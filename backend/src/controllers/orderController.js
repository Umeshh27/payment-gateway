const db = require('../config/database');
const { generateId } = require('../utils/helpers');

const createOrder = async (req, res) => {
    const { amount, currency = 'INR', receipt, notes } = req.body;
    const merchantId = req.merchant.id;

    // Validation
    if (!Number.isInteger(amount) || amount < 100) {
        return res.status(400).json({
            error: {
                code: 'BAD_REQUEST_ERROR',
                description: 'amount must be at least 100'
            }
        });
    }

    // Generate ID unique check could be added here but collision prob is low for 16 chars
    const orderId = generateId('order_');

    try {
        const result = await db.query(
            `INSERT INTO orders (id, merchant_id, amount, currency, receipt, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'created')
       RETURNING *`,
            [orderId, merchantId, amount, currency, receipt, notes]
        );

        const order = result.rows[0];
        res.status(201).json(order);
    } catch (err) {
        console.error('Create order error:', err);
        res.status(500).json({
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                description: 'Internal server error'
            }
        });
    }
};

const getOrder = async (req, res) => {
    const { order_id } = req.params;

    try {
        const result = await db.query('SELECT * FROM orders WHERE id = $1', [order_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: {
                    code: 'NOT_FOUND_ERROR',
                    description: 'Order not found'
                }
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Get order error:', err);
        res.status(500).json({
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                description: 'Internal server error'
            }
        });
    }
};

module.exports = { createOrder, getOrder };
