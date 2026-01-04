import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

const Checkout = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('order_id');

    const [order, setOrder] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('upi'); // Default to UPI for nice toggle
    const [paymentState, setPaymentState] = useState('initial');
    const [paymentResult, setPaymentResult] = useState(null);

    // Form states
    const [vpa, setVpa] = useState('');
    const [cardDetails, setCardDetails] = useState({
        number: '', expiry: '', cvv: '', name: ''
    });

    useEffect(() => {
        if (orderId) fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            const res = await axios.get(`http://localhost:8000/api/v1/orders/${orderId}/public`);
            setOrder(res.data);
        } catch (err) {
            setPaymentState('fatal_error');
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setPaymentState('processing');

        try {
            let payload = {
                order_id: orderId,
                method: paymentMethod
            };

            if (paymentMethod === 'upi') {
                payload.vpa = vpa;
            } else {
                const [month, year] = cardDetails.expiry.split('/');
                payload.card = {
                    number: cardDetails.number,
                    expiry_month: month,
                    expiry_year: year,
                    cvv: cardDetails.cvv,
                    holder_name: cardDetails.name
                };
            }

            const res = await axios.post('http://localhost:8000/api/v1/payments/public', payload);
            const paymentId = res.data.id;
            pollStatus(paymentId);
        } catch (err) {
            setPaymentState('error');
        }
    };

    const pollStatus = async (paymentId) => {
        const interval = setInterval(async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/v1/payments/${paymentId}/public`);
                const status = res.data.status;

                if (status === 'success') {
                    clearInterval(interval);
                    setPaymentResult(res.data);
                    setPaymentState('success');
                } else if (status === 'failed') {
                    clearInterval(interval);
                    setPaymentState('error');
                }
            } catch (err) {
                clearInterval(interval);
                setPaymentState('error');
            }
        }, 2000);
    };

    // Views
    if (!orderId) {
        return (
            <div className="checkout-wrapper" style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ color: 'red', fontSize: '1.5rem', marginBottom: '1rem' }}>⚠️</div>
                <h3>Invalid Request</h3>
                <p className="text-soft">Missing Order ID in URL.</p>
                <p className="text-soft" style={{ fontSize: '0.8rem' }}>Use <code>?order_id=...</code></p>
            </div>
        );
    }

    if (paymentState === 'fatal_error') {
        return (
            <div className="checkout-wrapper" style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ color: 'red', fontSize: '1.5rem', marginBottom: '1rem' }}>❌</div>
                <h3>Order Not Found</h3>
                <p className="text-soft">The order ID provided is invalid or expired.</p>
            </div>
        );
    }

    if (paymentState === 'processing') {
        return (
            <div className="checkout-wrapper" data-test-id="checkout-container">
                <div className="state-container" data-test-id="processing-state">
                    <div className="spinner"></div>
                    <h3 data-test-id="processing-message">Processing Payment</h3>
                    <p className="text-soft">Please do not close this window</p>
                </div>
            </div>
        );
    }

    if (paymentState === 'success' && paymentResult) {
        return (
            <div className="checkout-wrapper" data-test-id="checkout-container">
                <div className="state-container" data-test-id="success-state">
                    <div className="success-icon">✓</div>
                    <h2>Payment Successful</h2>
                    <span data-test-id="success-message" style={{ display: 'block', marginBottom: '1rem' }}>Your payment of ₹{paymentResult.amount / 100} was successful.</span>
                    <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem' }}>
                        <div style={{ color: '#6b7280' }}>Transaction ID</div>
                        <div style={{ fontFamily: 'monospace', fontWeight: 500 }} data-test-id="payment-id">{paymentResult.id}</div>
                    </div>
                </div>
            </div>
        );
    }

    if (paymentState === 'error') {
        return (
            <div className="checkout-wrapper" data-test-id="checkout-container">
                <div className="state-container" data-test-id="error-state">
                    <div style={{ fontSize: '48px', marginBottom: '1rem' }}>⚠️</div>
                    <h2>Payment Failed</h2>
                    <span data-test-id="error-message" style={{ display: 'block', marginBottom: '1rem' }}>We couldn't process your payment.</span>
                    <button className="pay-btn" data-test-id="retry-button" onClick={() => setPaymentState('initial')}>Try Again</button>
                </div>
            </div>
        );
    }

    // Initial loading state
    if (!order) {
        return (
            <div className="checkout-wrapper" style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="spinner" style={{ margin: '0 auto' }}></div>
                <p className="text-soft" style={{ marginTop: '1rem' }}>Loading Order...</p>
            </div>
        );
    }

    return (
        <div className="checkout-wrapper" data-test-id="checkout-container">
            <div className="checkout-header" data-test-id="order-summary">
                <div className="text-soft" style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payable Amount</div>
                <div className="amount-display" data-test-id="order-amount">₹{order.amount / 100}</div>
                <div className="order-ref">Order #<span data-test-id="order-id">{order.id}</span></div>
            </div>

            <div className="checkout-body">
                <div className="payment-tabs" data-test-id="payment-methods">
                    <button
                        className={`tab-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
                        data-test-id="method-upi"
                        onClick={() => setPaymentMethod('upi')}
                    >
                        UPI
                    </button>
                    <button
                        className={`tab-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                        data-test-id="method-card"
                        onClick={() => setPaymentMethod('card')}
                    >
                        Credit/Debit Card
                    </button>
                </div>

                {paymentMethod === 'upi' && (
                    <form data-test-id="upi-form" onSubmit={handlePayment}>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>UPI ID</label>
                            <input
                                className="input-field"
                                data-test-id="vpa-input"
                                placeholder="username@bank"
                                type="text"
                                value={vpa}
                                onChange={e => setVpa(e.target.value)}
                                required
                            />
                        </div>
                        <button className="pay-btn" data-test-id="pay-button" type="submit">
                            Pay ₹{order.amount / 100}
                        </button>
                    </form>
                )}

                {paymentMethod === 'card' && (
                    <form data-test-id="card-form" onSubmit={handlePayment}>
                        <div className="input-group">
                            <input
                                className="input-field"
                                data-test-id="card-number-input"
                                placeholder="Card Number"
                                type="text"
                                value={cardDetails.number}
                                onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })}
                                required
                            />
                        </div>
                        <div className="row">
                            <div className="input-group" style={{ flex: 1 }}>
                                <input
                                    className="input-field"
                                    data-test-id="expiry-input"
                                    placeholder="MM/YY"
                                    type="text"
                                    value={cardDetails.expiry}
                                    onChange={e => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group" style={{ flex: 1 }}>
                                <input
                                    className="input-field"
                                    data-test-id="cvv-input"
                                    placeholder="CVV"
                                    type="text"
                                    value={cardDetails.cvv}
                                    onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="input-group">
                            <input
                                className="input-field"
                                data-test-id="cardholder-name-input"
                                placeholder="Name on Card"
                                type="text"
                                value={cardDetails.name}
                                onChange={e => setCardDetails({ ...cardDetails, name: e.target.value })}
                                required
                            />
                        </div>
                        <button className="pay-btn" data-test-id="pay-button" type="submit">
                            Pay ₹{order.amount / 100}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Checkout;
