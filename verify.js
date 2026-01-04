const http = require('http');

const request = (options, data) => {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = body ? JSON.parse(body) : {};
                    resolve({ status: res.statusCode, body: parsed, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, body: body, headers: res.headers });
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
};

const runTest = async () => {
    try {
        console.log('--- Starting Verification ---');

        // 1. Health Check
        console.log('\n[1] Checking /health...');
        const health = await request({
            hostname: 'localhost', port: 8000, path: '/health', method: 'GET'
        });
        console.log('Status:', health.status);
        console.log('Response:', JSON.stringify(health.body));
        if (health.status !== 200) throw new Error('Health check failed');

        // 2. Get Merchant (Verification it exists)
        console.log('\n[2] Checking Test Merchant...');
        const merchant = await request({
            hostname: 'localhost', port: 8000, path: '/api/v1/test/merchant', method: 'GET'
        });
        console.log('Status:', merchant.status);
        console.log('Merchant:', merchant.body.email);
        if (merchant.status !== 200) throw new Error('Get merchant failed');

        // Hardcoded credentials as per spec
        const api_key = 'key_test_abc123';
        const api_secret = 'secret_test_xyz789';

        // 3. Create Order
        console.log('\n[3] Creating Order...');
        const orderData = { amount: 50000, currency: "INR", receipt: "verif_1" };
        const order = await request({
            hostname: 'localhost', port: 8000, path: '/api/v1/orders', method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': api_key,
                'X-Api-Secret': api_secret
            }
        }, orderData);
        console.log('Status:', order.status);
        console.log('Order ID:', order.body.id);
        if (order.status !== 201) {
            console.error('Order Error:', order.body);
            throw new Error('Order creation failed');
        }

        const orderId = order.body.id;

        // 4. Create Payment (via Public API)
        console.log('\n[4] Creating Payment (simulating checkout)...');
        console.log('Waiting for payment processing (approx 5-10s)...');
        const paymentData = {
            order_id: orderId,
            method: 'upi',
            vpa: 'test@upi'
        };

        const paymentStart = await request({
            hostname: 'localhost', port: 8000, path: '/api/v1/payments/public', method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, paymentData);
        console.log('Status:', paymentStart.status);
        console.log('Payment Status:', paymentStart.body.status);

        if (paymentStart.status !== 201) {
            console.error('Payment Error:', paymentStart.body);
            throw new Error('Payment creation failed');
        }

        // 5. Verify via Dashboard Endpoint (List)
        console.log('\n[5] Verifying in Dashboard List...');
        const paymentsList = await request({
            hostname: 'localhost', port: 8000, path: '/api/v1/payments', method: 'GET',
            headers: {
                'X-Api-Key': api_key,
                'X-Api-Secret': api_secret
            }
        });
        console.log('Status:', paymentsList.status);
        const found = paymentsList.body.find(p => p.id === paymentStart.body.id);
        console.log('Found Transaction:', !!found);
        if (!found) throw new Error('Transaction not found in dashboard list');

        console.log('\n--- VERIFICATION SUCCESSFUL ---');

    } catch (err) {
        console.error('\n--- TEST FAILED ---', err.message);
        process.exit(1);
    }
};

runTest();

// Verification script ready
