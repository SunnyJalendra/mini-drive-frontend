import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API, { setAuthToken } from '../api';
import './Auth.css';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [adminCode, setAdminCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!email || !password) {
            setError('Email and password are required');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            const response = await API.post('/auth/signup', { email, password, adminCode: adminCode || undefined });
            const { token, user } = response.data;
            if (!token || !user) {
                setError('Invalid response from server');
                return;
            }
            setAuthToken(token);
            navigate(user.isAdmin ? '/admin' : '/dashboard');
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Signup failed. Please try again.';
            setError(message);
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
                        <h2 className="brand-subtitle">Join Us Today</h2>
                        <p className="brand-description">Secure • Fast • Reliable</p>
                        <div className="features-list">
                            <div className="feature">
                                <span className="feature-icon">🆓</span>
                                <span>Get started in seconds</span>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">🔐</span>
                                <span>Your data is always protected</span>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">📤</span>
                                <span>Upload & share with anyone</span>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">💼</span>
                                <span>Perfect for work & personal use</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="auth-box">
                    <div className="auth-header">
                        <h2>Create Account</h2>
                        <p>Start your secure cloud storage journey</p>
                    </div>

                    {error && <div className="error">⚠️ {error}</div>}

                    <form onSubmit={handleSignup} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="adminCode">Admin Code (Optional)</label>
                            <input id="adminCode" type="text" placeholder="Leave blank for regular user" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} disabled={loading} />
                        </div>

                        <button type="submit" disabled={loading} className="btn-submit">
                            {loading ? '⏳ Creating account...' : '🎉 Sign Up'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Already have an account? <Link to="/login">Sign in here</Link>
                        </p>
                        <p className="auth-subtext">Get unlimited secure cloud storage instantly</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
