const db = require('../config/database');

const authenticate = async (req, res, next) => {
    const apiKey = req.header('X-Api-Key');
    const apiSecret = req.header('X-Api-Secret');

    if (!apiKey || !apiSecret) {
        return res.status(401).json({
            error: {
                code: 'AUTHENTICATION_ERROR',
                description: 'Invalid API credentials'
            }
        });
    }

    try {
        const result = await db.query(
            'SELECT * FROM merchants WHERE api_key = $1 AND api_secret = $2 AND is_active = true',
            [apiKey, apiSecret]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: {
                    code: 'AUTHENTICATION_ERROR',
                    description: 'Invalid API credentials'
                }
            });
        }

        // Attach merchant to request object
        req.merchant = result.rows[0];
        next();
    } catch (err) {
        console.error('Authentication error:', err);
        return res.status(500).json({
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                description: 'An unexpected error occurred'
            }
        });
    }
};

module.exports = authenticate;
