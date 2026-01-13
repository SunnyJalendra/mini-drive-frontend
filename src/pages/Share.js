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
    const [requestStatus, setRequestStatus] = useState('none'); // none|pending|approved|rejected
    const [permissionRequested, setPermissionRequested] = useState(null);
    const navigate = useNavigate();

    // small helpers for avatars and initials
    const getInitials = (email) => {
        if (!email) return '?';
        const parts = String(email).split('@')[0].split(/[._-]/).filter(Boolean);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + (parts[1][0] || '')).toUpperCase();
    };

    const avatarColor = (s) => {
        let h = 0;
        for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
        const hue = Math.abs(h) % 360;
        return `linear-gradient(135deg,hsl(${hue} 70% 55%), hsl(${(hue + 40) % 360} 65% 50%))`;
    };

    const loadRequests = useCallback(async () => {
        try {
            const res = await API.get(`/files/share/${id}/requests`);
            setRequests(res.data || []);
            return res.data || [];
        } catch (err) {
            alert('Failed to load requests: ' + (err.response?.data?.message || err.message));
            return [];
        }
    }, [id]);

    const loadMyRequest = useCallback(async () => {
        try {
            const res = await API.get(`/files/share/${id}/status`);
            const s = res.data?.status || 'none';
            setRequestStatus(s);
            setPermissionRequested(res.data?.permissionRequested || null);
            return res.data;
        } catch (err) {
            // ignore failures for now
            setRequestStatus('none');
            return null;
        }
    }, [id]);

    const checkOwnership = useCallback(async () => {
        setLoading(true);
        try {
            const list = await API.get('/files');
            const owned = list.data.owned || [];
            const found = owned.find(f => String(f._id) === String(id));
            if (found) {
                setIsOwner(true);
                await loadRequests();
            } else {
                setIsOwner(false);
                await loadMyRequest();
            }
        } catch (err) {
            setIsOwner(false);
        } finally {
            setLoading(false);
        }
    }, [id, loadRequests, loadMyRequest]);

    const requestAccess = async (permission) => {
        try {
            await API.post(`/files/share/${id}/request`, { permission });
            setStatus('Request created');
            setRequestStatus('pending');
            setPermissionRequested(permission);
        } catch (err) {
            alert('Request failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const respond = async (requestId, action, permission) => {
        try {
            await API.post(`/files/share/${id}/respond`, { requestId, action, permission });
            loadRequests();
        } catch (err) {
            alert('Action failed: ' + (err.response?.data?.message || err.message));
        }
    };

    useEffect(() => {
        const load = async () => { await checkOwnership(); };
        load();
    }, [checkOwnership]);

    useEffect(() => {
        const onFocus = async () => { await checkOwnership(); };
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
                                {requests.map(r => (
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
