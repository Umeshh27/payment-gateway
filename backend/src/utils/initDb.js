const fs = require('fs');
const path = require('path');
const db = require('../config/database');

const initDb = async () => {
    try {
        const schemaPath = path.join(__dirname, '../schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Run schema
        console.log('Running schema migrations...');
        await db.query(schema);
        console.log('Schema migrations completed.');

        // Seed Test Merchant
        const testMerchant = {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Test Merchant',
            email: 'test@example.com',
            api_key: 'key_test_abc123',
            api_secret: 'secret_test_xyz789'
        };

        console.log('Seeding test merchant...');
        const checkMerchant = await db.query('SELECT * FROM merchants WHERE email = $1', [testMerchant.email]);

        if (checkMerchant.rows.length === 0) {
            await db.query(
                `INSERT INTO merchants (id, name, email, api_key, api_secret) 
         VALUES ($1, $2, $3, $4, $5)`,
                [testMerchant.id, testMerchant.name, testMerchant.email, testMerchant.api_key, testMerchant.api_secret]
            );
            console.log('Test merchant seeded successfully.');
        } else {
            console.log('Test merchant already exists.');
        }

    } catch (err) {
        console.error('Database initialization failed:', err);
        throw err;
    }
};

module.exports = initDb;
