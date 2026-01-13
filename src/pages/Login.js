import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API, { setAuthToken } from '../api';
import './Auth.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await API.post('/auth/login', { email, password });
            setAuthToken(data.token);
            navigate(data.user.isAdmin ? '/admin' : '/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-wrapper">
                <div className="auth-left">
                    <div className="auth-left-content">
                        <h1 className="brand-title">📁 Mini Drive</h1>
                        <h2 className="brand-subtitle">Cloud Storage Redefined</h2>
                        <p className="brand-description">Secure • Fast • Reliable</p>
                        <div className="features-list">
                            <div className="feature">
                                <span className="feature-icon">🔒</span>
                                <span>End-to-end encrypted storage</span>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">⚡</span>
                                <span>Lightning fast uploads & downloads</span>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">👥</span>
                                <span>Easy file sharing & collaboration</span>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">♾️</span>
                                <span>Unlimited version history</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="auth-box">
                    <div className="auth-header">
                        <h2>Welcome Back</h2>
                        <p>Sign in to your Mini Drive account</p>
                    </div>

                    {error && <div className="error">⚠️ {error}</div>}

                    <form onSubmit={handleLogin} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading} className="btn-submit">
                            {loading ? '🔄 Signing in...' : '🚀 Sign In'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Don't have an account? <Link to="/signup">Create one now</Link></p>
                        <p className="auth-subtext">Start storing, sharing & collaborating instantly</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
