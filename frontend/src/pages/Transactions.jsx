import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Transactions = () => {
    const [payments, setPayments] = useState([]);

    useEffect(() => {
        const fetchPayments = async () => {
            const stored = localStorage.getItem('merchant');
            if (!stored) return;
            const { apiKey, apiSecret } = JSON.parse(stored);

            try {
                const response = await axios.get('http://localhost:8000/api/v1/payments', {
                    headers: {
                        'X-Api-Key': apiKey,
                        'X-Api-Secret': apiSecret
                    }
                });
                setPayments(response.data);
            } catch (err) {
                console.error('Failed to fetch payments', err);
            }
        };
        fetchPayments();
    }, []);

    const getStatusBadge = (status) => {
        const classes = {
            success: 'badge badge-success',
            processing: 'badge badge-processing',
            failed: 'badge badge-failed'
        };
        return <span className={classes[status] || 'badge'}>{status}</span>;
    };

    return (
        <div className="layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <span>Partnr Gateway</span>
                </div>
                <nav>
                    <Link to="/dashboard" className="nav-link">Overview</Link>
                    <Link to="/dashboard/transactions" className="nav-link active">Transactions</Link>
                    <Link to="/login" className="nav-link" onClick={() => localStorage.clear()}>Logout</Link>
                </nav>
            </aside>

            <main className="main-content">
                <h2 style={{ marginBottom: '2rem' }}>Transactions</h2>
                <div className="table-container">
                    <table data-test-id="transactions-table">
                        <thead>
                            <tr>
                                <th>PAYMENT ID</th>
                                <th>ORDER ID</th>
                                <th>AMOUNT</th>
                                <th>METHOD</th>
                                <th>STATUS</th>
                                <th>DATE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(payment => (
                                <tr key={payment.id} data-test-id="transaction-row" data-payment-id={payment.id}>
                                    <td data-test-id="payment-id"><code style={{ color: 'var(--primary)', fontWeight: 600 }}>{payment.id}</code></td>
                                    <td data-test-id="order-id"><code style={{ color: 'var(--text-muted)' }}>{payment.order_id}</code></td>
                                    <td data-test-id="amount" style={{ fontWeight: 600 }}>₹{payment.amount / 100}</td>
                                    <td data-test-id="method" style={{ textTransform: 'uppercase' }}>{payment.method}</td>
                                    <td data-test-id="status">{getStatusBadge(payment.status)}</td>
                                    <td data-test-id="created-at">{new Date(payment.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default Transactions;
