import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { setAuthToken } from '../api';
import './Dashboard.css';

export default function Dashboard() {
    const [owned, setOwned] = useState([]);
    const [shared, setShared] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchFiles();
        const interval = setInterval(fetchFiles, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchFiles = async () => {
        try {
            const response = await API.get('/files');
            const { owned: ownedFiles = [], shared: sharedFiles = [] } = response.data;
            setOwned(ownedFiles);
            setShared(sharedFiles);
            setError('');
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to load files';
            setError(message);
            console.error('Fetch files error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';
        if (file.size > 100 * 1024 * 1024) {
            setError('File size exceeds 100MB limit');
            return;
        }
        setUploading(true);
        setError('');
        const formData = new FormData();
        formData.append('file', file);
        try {
            await API.post('/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            await fetchFiles();
        } catch (err) {
            const message = err.response?.data?.message || 'Upload failed';
            setError(message);
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (fileId) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;
        try {
            await API.delete(`/files/${fileId}`);
            await fetchFiles();
        } catch (err) {
            const message = err.response?.data?.message || 'Delete failed';
            setError(message);
            console.error('Delete error:', err);
        }
    };

    const downloadFile = async (fileId, filename) => {
        try {
            const response = await API.get(`/files/${fileId}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename || 'file');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            setError('');
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Download failed';
            setError(message);
            console.error('Download error:', err);
        }
    };

    const handleLogout = () => {
        setAuthToken(null);
        navigate('/login');
    };

    return (
        <div className="dashboard">
            <nav className="navbar">
                <h1>Mini Drive</h1>
                <button onClick={handleLogout}>Logout</button>
            </nav>

            <div className="container">
                {error && <div className="error" style={{ margin: '20px 0', padding: '15px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px' }}>⚠️ {error}</div>}

                <div className="upload-section">
                    <div className="upload-header">
                        <div>
                            <h2>📤 Upload Your Files</h2>
                            <p className="upload-description">Securely upload and store your files in the cloud. Supports all file types with end-to-end encryption.</p>
                        </div>
                    </div>
                    <div className="file-input-wrapper">
                        <label htmlFor="file-input" className={`file-input-label ${uploading ? 'uploading' : ''}`}>
                            <div className="upload-icon">📁</div>
                            <div className="upload-text">
                                <h3>Choose file to upload</h3>
                                <p>or drag and drop your files here</p>
                                <p className="upload-hint">Maximum file size: 100MB</p>
                            </div>
                        </label>
                        <input id="file-input" type="file" onChange={handleUpload} disabled={uploading || loading} className="hidden-input" />
                    </div>
                    {uploading && <div className="uploading-status"><span className="spinner"></span> Uploading your file...</div>}
                </div>

                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        <h2>📁 Your Files ({owned.length})</h2>
                        {owned.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📄</div>
                                <h3>No files uploaded yet</h3>
                                <p>Start by uploading your first file using the upload section above. Your files will appear here.</p>
                            </div>
                        ) : (
                            <div className="files-grid">
                                {owned.map((file) => (
                                    <div key={file._id} className="file-card owned-card">
                                        <div className="file-icon">📄</div>
                                        <h3 className="file-name" title={file.originalName}>{file.originalName}</h3>
                                        <div className="file-meta">
                                            <span className="file-size">📦 {(file.size / 1024).toFixed(2)} KB</span>
                                            <span className="file-status">✓ Encrypted</span>
                                        </div>
                                        <p className="file-description">Your personal file • Secure storage</p>
                                        <div className="actions">
                                            <button className="btn-download" onClick={() => downloadFile(file._id, file.originalName)}>📥 Download</button>
                                            <button className="btn-share" onClick={() => navigate(`/share/${file._id}`)}>🔗 Share</button>
                                            <button className="btn-delete" onClick={() => handleDelete(file._id)}>🗑️ Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <h2>👥 Shared with You ({shared.length})</h2>
                        {shared.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">🤝</div>
                                <h3>No files shared with you</h3>
                                <p>When others share files with you, they will appear here. You can view and download shared files.</p>
                            </div>
                        ) : (
                            <div className="files-grid">
                                {shared.map((file) => (
                                    <div key={file._id} className="file-card shared-card">
                                        <div className="file-icon shared-icon">👤</div>
                                        <h3 className="file-name" title={file.originalName}>{file.originalName}</h3>
                                        <div className="file-meta">
                                            <span className="file-size">📦 {(file.size / 1024).toFixed(2)} KB</span>
                                            <span className="file-status shared">📨 Shared</span>
                                        </div>
                                        <p className="file-description">Shared by: <strong>{file.owner?.email || 'Unknown'}</strong></p>
                                        <div className="actions">
                                            <button className="btn-download" onClick={() => downloadFile(file._id, file.originalName)}>📥 Download</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
    *** End Patch
}
