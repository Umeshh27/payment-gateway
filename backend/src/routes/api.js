const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

const authenticateHost = require('../middleware/auth');
const orderController = require('../controllers/orderController');

// Public routes
router.get('/health', healthController.getHealth);
router.get('/test/merchant', async (req, res) => {
    // Implement test merchant endpoint inline for now or move to controller later as urged by task list
    try {
        const db = require('../config/database');
        const result = await db.query("SELECT id, email, api_key FROM merchants WHERE email = 'test@example.com'");
        if (result.rows.length > 0) {
            res.json({ ...result.rows[0], seeded: true });
        } else {
            res.status(404).json({ error: 'Test merchant not found' });
        }
    } catch (e) { res.status(500).json({ error: e.message }) }
});

const paymentController = require('../controllers/paymentController');

// Protected routes
router.post('/orders', authenticateHost, orderController.createOrder);
router.get('/orders/:order_id', authenticateHost, orderController.getOrder); // Added authenticateHost

router.post('/payments', authenticateHost, paymentController.createPayment);
router.get('/payments', authenticateHost, paymentController.getPayments);
router.get('/payments/:payment_id', authenticateHost, paymentController.getPayment);

// Public Checkout Routes
router.get('/orders/:order_id/public', paymentController.getOrderPublic);
router.post('/payments/public', paymentController.createPaymentPublic);
router.get('/payments/:payment_id/public', paymentController.getPaymentPublic);

module.exports = router;
