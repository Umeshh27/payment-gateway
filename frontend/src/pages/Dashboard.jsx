import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [stats, setStats] = useState({ count: 0, amount: 0, successRate: 0 });
    const [creds, setCreds] = useState({ apiKey: '', apiSecret: '' });

    useEffect(() => {
        const stored = localStorage.getItem('merchant');
        if (stored) {
            const parsed = JSON.parse(stored);
            setCreds(parsed);
            fetchStats(parsed);
        }
    }, []);

    const fetchStats = async (credentials) => {
        try {
            // Since we don't have a specific stats endpoint, we'll fetch all payments 
            // or we can add a stats endpoint. Or just use the required /api/v1/payments endpoint?
            // Wait, there is NO list payments endpoint in the spec!
            // "GET /api/v1/payments/{payment_id}" exists.
            // "Transactions Page (/dashboard/transactions): ... <tr data-test-id='transaction-row' ...>"
            // This implies we need to list transactions. 
            // "Transactions Page... <table...>"
            // Implied Requirement: We need an endpoint to list payments/orders.
            // The spec says: "RESTful API with fixed endpoints for creating orders, processing payments, and querying transaction status".
            // It lists specific endpoints: GET /orders/{id}, GET /payments/{id}.
            // It DOES NOT list GET /orders or GET /payments (list).
            // BUT "Transactions Page" requires it.
            // "Can I add additional API endpoints... Yes".
            // I MUST add GET /api/v1/payments (list) to support the dashboard.

            const response = await axios.get('http://localhost:8000/api/v1/payments', {
                headers: {
                    'X-Api-Key': credentials.apiKey,
                    'X-Api-Secret': credentials.apiSecret
                }
            });

            const payments = response.data; // Assuming array

            const totalCount = payments.length;
            const successPayments = payments.filter(p => p.status === 'success');
            const totalAmount = successPayments.reduce((sum, p) => sum + p.amount, 0);
            const rate = totalCount > 0 ? (successPayments.length / totalCount) * 100 : 0;

            setStats({
                count: totalCount,
                amount: totalAmount,
                successRate: Math.round(rate)
            });

        } catch (err) {
            console.error('Failed to fetch stats', err);
        }
    };

    return (
        <div className="layout" data-test-id="dashboard">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <span>Partnr Gateway</span>
                </div>
                <nav>
                    <Link to="/dashboard" className="nav-link active">Overview</Link>
                    <Link to="/dashboard/transactions" className="nav-link">Transactions</Link>
                    <Link to="/login" className="nav-link" onClick={() => localStorage.clear()}>Logout</Link>
                </nav>
            </aside>

            <main className="main-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2>Overview</h2>
                    <div data-test-id="api-credentials" style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
                        <div className="card" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span className="text-muted">Key:</span>
                            <code data-test-id="api-key" style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{creds.apiKey}</code>
                        </div>
                        <div className="card" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span className="text-muted">Secret:</span>
                            <code data-test-id="api-secret" style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{creds.apiSecret}</code>
                        </div>
                    </div>
                </div>

                <div className="stats-grid" data-test-id="stats-container">
                    <div className="stat-card">
                        <div className="stat-label">Total Transactions</div>
                        <div className="stat-value" data-test-id="total-transactions">{stats.count}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Total Volume</div>
                        <div className="stat-value" data-test-id="total-amount">₹{(stats.amount / 100).toLocaleString()}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Success Rate</div>
                        <div className="stat-value" data-test-id="success-rate">{stats.successRate}%</div>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3>Recent Activity</h3>
                        <Link to="/dashboard/transactions" className="btn btn-primary" style={{ textDecoration: 'none' }}>View All</Link>
                    </div>
                    <p className="text-muted">Check the Transactions tab for detailed records.</p>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;

