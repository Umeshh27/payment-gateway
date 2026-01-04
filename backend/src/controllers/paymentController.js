const db = require('../config/database');
const { generateId } = require('../utils/helpers');
const { validateVPA, validateLuhn, getCardNetwork, validateExpiry } = require('../utils/validation');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const createPayment = async (req, res) => {
    const { order_id, method, vpa, card } = req.body;
    const merchantId = req.merchant.id;

    try {
        // 1. Verify Order
        const orderRes = await db.query('SELECT * FROM orders WHERE id = $1', [order_id]);
        if (orderRes.rows.length === 0) {
            return res.status(404).json({ error: { code: 'NOT_FOUND_ERROR', description: 'Order not found' } });
        }
        const order = orderRes.rows[0];
        if (order.merchant_id !== merchantId) {
            // Technically 404 is safer to not leak existence, but prompt implies ownership check
            return res.status(404).json({ error: { code: 'NOT_FOUND_ERROR', description: 'Order not found' } });
        }

        // 2. Validate Method Specifics
        let cardNetwork = null;
        let cardLast4 = null;

        if (method === 'upi') {
            if (!vpa || !validateVPA(vpa)) {
                return res.status(400).json({ error: { code: 'INVALID_VPA', description: 'VPA format invalid' } });
            }
        } else if (method === 'card') {
            if (!card || !card.number || !card.expiry_month || !card.expiry_year || !card.cvv || !card.holder_name) {
                return res.status(400).json({ error: { code: 'BAD_REQUEST_ERROR', description: 'Missing card details' } });
            }
            if (!validateLuhn(card.number)) {
                return res.status(400).json({ error: { code: 'INVALID_CARD', description: 'Card validation failed' } });
            }
            if (!validateExpiry(card.expiry_month, card.expiry_year)) {
                return res.status(400).json({ error: { code: 'EXPIRED_CARD', description: 'Card expiry date invalid' } });
            }

            cardNetwork = getCardNetwork(card.number);
            cardLast4 = card.number.replace(/[\s-]/g, '').slice(-4);
        } else {
            return res.status(400).json({ error: { code: 'BAD_REQUEST_ERROR', description: 'Invalid payment method' } });
        }

        // 3. Create Payment (Processing)
        const paymentId = generateId('pay_');
        const amount = order.amount;
        const currency = order.currency;

        await db.query(
            `INSERT INTO payments (id, order_id, merchant_id, amount, currency, method, status, vpa, card_network, card_last4)
         VALUES ($1, $2, $3, $4, $5, $6, 'processing', $7, $8, $9)`,
            [paymentId, order_id, merchantId, amount, currency, method, vpa, cardNetwork, cardLast4]
        );

        // 4. Send Response immediately (As per prompt: "Return response... Set status to processing... Process payment synchronously")
        // Wait... prompt says "Process payment synchronously: Add a delay... Update payment status... Return response".
        // This defines a BLOCKING request. "Process payment synchronously" -> "Return response".
        // So I must wait BEFORE returning response.

        // Determining logic based on TEST_MODE
        const isTestMode = process.env.TEST_MODE === 'true';
        let delay = Math.floor(Math.random() * (10000 - 5000 + 1) + 5000); // 5-10s
        let isSuccess = false;

        if (isTestMode) {
            delay = parseInt(process.env.TEST_PROCESSING_DELAY) || 1000;
            isSuccess = process.env.TEST_PAYMENT_SUCCESS !== 'false'; // Default true
        } else {
            const rand = Math.random();
            if (method === 'upi') {
                isSuccess = rand < 0.90;
            } else {
                isSuccess = rand < 0.95;
            }
        }

        await sleep(delay);

        const finalStatus = isSuccess ? 'success' : 'failed';
        let errorCode = null;
        let errorDesc = null;

        if (!isSuccess) {
            errorCode = 'PAYMENT_FAILED';
            errorDesc = 'Payment processing failed';
        }

        const updateQuery = `
        UPDATE payments 
        SET status = $1, error_code = $2, error_description = $3, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $4 
        RETURNING *
    `;
        const updateRes = await db.query(updateQuery, [finalStatus, errorCode, errorDesc, paymentId]);
        const finalPayment = updateRes.rows[0];

        res.status(201).json(finalPayment);

    } catch (err) {
        console.error('Create payment error:', err);
        res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', description: 'Internal server error' } });
    }
};

const getPayment = async (req, res) => {
    const { payment_id } = req.params;
    try {
        const result = await db.query('SELECT * FROM payments WHERE id = $1', [payment_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: { code: 'NOT_FOUND_ERROR', description: 'Payment not found' } });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Get payment error:', err);
        res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', description: 'Internal server error' } });
    }
};

// Checkout Public Endpoints
const getOrderPublic = async (req, res) => {
    const { order_id } = req.params;
    try {
        const result = await db.query('SELECT id, amount, currency, status, merchant_id FROM orders WHERE id = $1', [order_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: { code: 'NOT_FOUND_ERROR', description: 'Order not found' } });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', description: 'Internal server error' } });
    }
};

const getPayments = async (req, res) => {
    const merchantId = req.merchant.id;
    try {
        const result = await db.query('SELECT * FROM payments WHERE merchant_id = $1 ORDER BY created_at DESC', [merchantId]);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', description: 'Internal server error' } });
    }
};

const createPaymentPublic = async (req, res) => {
    const { order_id, method, vpa, card } = req.body;

    try {
        // 1. Verify Order Exists (No merchant auth check needed for public payment on existing order)
        const orderRes = await db.query('SELECT * FROM orders WHERE id = $1', [order_id]);
        if (orderRes.rows.length === 0) {
            return res.status(404).json({ error: { code: 'NOT_FOUND_ERROR', description: 'Order not found' } });
        }
        const order = orderRes.rows[0];
        const merchantId = order.merchant_id; // Infer merchant from order

        // 2. Validate Method (Same as private)
        let cardNetwork = null;
        let cardLast4 = null;

        if (method === 'upi') {
            if (!vpa || !validateVPA(vpa)) return res.status(400).json({ error: { code: 'INVALID_VPA', description: 'VPA format invalid' } });
        } else if (method === 'card') {
            if (!card || !card.number || !card.expiry_month || !card.expiry_year || !card.cvv || !card.holder_name) {
                return res.status(400).json({ error: { code: 'BAD_REQUEST_ERROR', description: 'Missing card details' } });
            }
            if (!validateLuhn(card.number)) return res.status(400).json({ error: { code: 'INVALID_CARD', description: 'Card validation failed' } });
            if (!validateExpiry(card.expiry_month, card.expiry_year)) return res.status(400).json({ error: { code: 'EXPIRED_CARD', description: 'Card expiry date invalid' } });

            cardNetwork = getCardNetwork(card.number);
            cardLast4 = card.number.replace(/[\s-]/g, '').slice(-4);
        } else {
            return res.status(400).json({ error: { code: 'BAD_REQUEST_ERROR', description: 'Invalid payment method' } });
        }

        // 3. Create Payment
        const paymentId = generateId('pay_');
        await db.query(
            `INSERT INTO payments (id, order_id, merchant_id, amount, currency, method, status, vpa, card_network, card_last4)
             VALUES ($1, $2, $3, $4, $5, $6, 'processing', $7, $8, $9)`,
            [paymentId, order_id, merchantId, order.amount, order.currency, method, vpa, cardNetwork, cardLast4]
        );

        // 4. Process (Test Mode Logic)
        const isTestMode = process.env.TEST_MODE === 'true';
        let delay = Math.floor(Math.random() * (10000 - 5000 + 1) + 5000);
        let isSuccess = false;

        if (isTestMode) {
            delay = parseInt(process.env.TEST_PROCESSING_DELAY) || 1000;
            isSuccess = process.env.TEST_PAYMENT_SUCCESS !== 'false';
        } else {
            const rand = Math.random();
            if (method === 'upi') isSuccess = rand < 0.90;
            else isSuccess = rand < 0.95;
        }

        await sleep(delay);

        const finalStatus = isSuccess ? 'success' : 'failed';
        let errorCode = null;
        let errorDesc = null;
        if (!isSuccess) {
            errorCode = 'PAYMENT_FAILED';
            errorDesc = 'Payment processing failed';
        }

        const updateQuery = `
            UPDATE payments 
            SET status = $1, error_code = $2, error_description = $3, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $4 
            RETURNING *
        `;
        const updateRes = await db.query(updateQuery, [finalStatus, errorCode, errorDesc, paymentId]);
        res.status(201).json(updateRes.rows[0]);

    } catch (err) {
        console.error('Create payment public error:', err);
        res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', description: 'Internal server error' } });
    }
};

const getPaymentPublic = async (req, res) => {
    const { payment_id } = req.params;
    try {
        const result = await db.query('SELECT * FROM payments WHERE id = $1', [payment_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: { code: 'NOT_FOUND_ERROR', description: 'Payment not found' } });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', description: 'Internal server error' } });
    }
};

module.exports = { createPayment, getPayment, getOrderPublic, getPayments, createPaymentPublic, getPaymentPublic };

// Payment logic verified
