const db = require('../config/database');

const getHealth = async (req, res) => {
    let dbStatus = 'disconnected';
    try {
        await db.query('SELECT 1');
        dbStatus = 'connected';
    } catch (err) {
        console.error('Health check DB error:', err);
    }

    res.status(200).json({
        status: 'healthy',
        database: dbStatus,
        timestamp: new Date().toISOString()
    });
};

module.exports = { getHealth };
