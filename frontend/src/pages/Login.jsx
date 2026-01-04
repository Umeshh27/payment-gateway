import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (email === 'test@example.com') {
            const credentials = {
                apiKey: 'key_test_abc123',
                apiSecret: 'secret_test_xyz789',
                merchantId: '550e8400-e29b-41d4-a716-446655440000'
            };
            localStorage.setItem('merchant', JSON.stringify(credentials));
            navigate('/dashboard');
        } else {
            alert('Invalid credentials. Try test@example.com');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#e2e8f0' }}>
            <div className="card" style={{ width: '400px', padding: '2rem' }}>
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h2 style={{ color: '#1e293b' }}>Merchant Login</h2>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Access your Partnr Gateway dashboard</p>
                </div>

                <form data-test-id="login-form" onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Email Address</label>
                        <input
                            className="form-input"
                            data-test-id="email-input"
                            type="email"
                            placeholder="test@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Password</label>
                        <input
                            className="form-input"
                            data-test-id="password-input"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" data-test-id="login-button" type="submit" style={{ marginTop: '1rem', width: '100%' }}>
                        Sign In
                    </button>
                    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
                        Use <b>test@example.com</b> to log in
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
