import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import './Share.css';

export default function Share() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [requests, setRequests] = useState([]);
    const [status, setStatus] = useState('');
    const [requestStatus, setRequestStatus] = useState('none');
    const [permissionRequested, setPermissionRequested] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const getInitials = (email) => {
        if (!email) return '?';
        const parts = String(email).split('@')[0].split(/[._-]/).filter(Boolean);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
    };

    const avatarColor = (s) => {
        let h = 0;
        for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
        const hue = Math.abs(h) % 360;
        return `linear-gradient(135deg,hsl(${hue} 70% 55%), hsl(${(hue + 40) % 360} 65% 50%))`;
    };

    const loadRequests = useCallback(async () => {
        try {
            const response = await API.get(`/files/share/${id}/requests`);
            setRequests(response.data || []);
            setError('');
            return response.data || [];
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to load requests';
            setError(message);
            console.error('Load requests error:', err);
            return [];
        }
    }, [id]);

    const loadMyRequest = useCallback(async () => {
        try {
            const response = await API.get(`/files/share/${id}/status`);
            const s = response.data?.status || 'none';
            setRequestStatus(s);
            setPermissionRequested(response.data?.permissionRequested || null);
            setError('');
            return response.data;
        } catch (err) {
            setRequestStatus('none');
            return null;
        }
    }, [id]);

    const checkOwnership = useCallback(async () => {
        setLoading(true);
        try {
            const response = await API.get('/files');
            const owned = response.data?.owned || [];
            const found = owned.find((f) => String(f._id) === String(id));
            if (found) {
                setIsOwner(true);
                await loadRequests();
            } else {
                setIsOwner(false);
                await loadMyRequest();
            }
            setError('');
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to verify access';
            setError(message);
            setIsOwner(false);
            console.error('Check ownership error:', err);
        } finally {
            setLoading(false);
        }
    }, [id, loadRequests, loadMyRequest]);

    const requestAccess = async (permission) => {
        try {
            await API.post(`/files/share/${id}/request`, { permission });
            setStatus('Request created successfully');
            setRequestStatus('pending');
            setPermissionRequested(permission);
            setError('');
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Request failed';
            setError(message);
            console.error('Request access error:', err);
        }
    };

    const respond = async (requestId, action, permission) => {
        try {
            await API.post(`/files/share/${id}/respond`, { requestId, action, permission });
            setError('');
            await loadRequests();
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Action failed';
            setError(message);
            console.error('Respond error:', err);
        }
    };

    useEffect(() => {
        checkOwnership();
    }, [checkOwnership]);

    useEffect(() => {
        const onFocus = async () => {
            await checkOwnership();
        };
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [checkOwnership]);

    return (
        <div className="share-page">
            <div className="share-header">
                <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
                <div className="title-area">
                    <h1 className="title">Share / Access</h1>
                    <p className="subtitle">Manage who can view or edit this file</p>
                </div>
            </div>

            <div className="share-content">
                {error && <div className="error" style={{ margin: '20px 0', padding: '15px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px' }}>⚠️ {error}</div>}

                {loading ? (
                    <div className="card">
                        <div className="card-header">
                            <h2 className="skeleton w-60">&nbsp;</h2>
                            <div className="skeleton chip w-20">&nbsp;</div>
                        </div>
                        <div className="skeleton-row">
                            <div className="skeleton avatar" />
                            <div className="skeleton w-70" />
                        </div>
                        <div className="skeleton-row">
                            <div className="skeleton avatar" />
                            <div className="skeleton w-50" />
                        </div>
                    </div>
                ) : isOwner ? (
                    <section className="card">
                        <div className="card-header">
                            <h2>Pending Requests</h2>
                            <span className="chip">{requests.length} pending</span>
                        </div>

                        {requests.length === 0 ? (
                            <div className="empty">No requests</div>
                        ) : (
                            <ul className="request-list">
                                {requests.map((r) => (
                                    <li key={r._id} className="request-item">
                                        <div className="request-main">
                                            <div className="request-user">
                                                <div className="avatar" style={{ background: avatarColor(r.requester?.email || String(r._id)) }} aria-hidden>
                                                    <span className="avatar-text">{getInitials(r.requester?.email)}</span>
                                                </div>
                                                <div className="request-name">{r.requester?.email || 'unknown'}</div>
                                            </div>
                                            <div className="request-meta">Requested: <strong>{r.permissionRequested}</strong></div>
                                        </div>
                                        <div className="request-right">
                                            <div className={`status-badge status-${r.status}`} role="status" aria-live="polite">{r.status}</div>
                                            {r.status === 'pending' && (
                                                <div className="actions">
                                                    <button className="btn btn-approve" onClick={() => respond(r._id, 'approve', 'view')}>Approve View</button>
                                                    <button className="btn btn-approve-outline" onClick={() => respond(r._id, 'approve', 'edit')}>Approve Edit</button>
                                                    <button className="btn btn-reject" onClick={() => respond(r._id, 'reject')}>Reject</button>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                ) : (
                    <section className="card request-access-card">
                        <h2>Request Access</h2>
                        <p className="muted">Request permission to view or edit this file. The owner will be notified.</p>

                        <div className="request-actions">
                            <button className="btn btn-primary" onClick={() => requestAccess('view')} disabled={requestStatus === 'pending' || requestStatus === 'approved'}>Request View</button>
                            <button className="btn btn-outline" onClick={() => requestAccess('edit')} disabled={requestStatus === 'pending' || requestStatus === 'approved'}>Request Edit</button>
                        </div>

                        {requestStatus !== 'none' && (
                            <div className="status-row">Your request status: <strong>{requestStatus}</strong>{permissionRequested ? ` (requested: ${permissionRequested})` : ''}</div>
                        )}

                        {status && <div className="status-message">{status}</div>}
                    </section>
                )}
            </div>
        </div>
    );
}

