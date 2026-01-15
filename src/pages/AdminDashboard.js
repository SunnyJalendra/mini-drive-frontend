import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { setAuthToken } from '../api';
import './Admin.css';

export default function AdminDashboard() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchAllFiles = useCallback(async () => {
        try {
            const response = await API.get('/admin/files');
            setFiles(response.data || []);
            setError('');
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to load files';
            setError(message);
            console.error('Fetch admin files error:', err);
            if (err.response?.status === 403) navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchAllFiles();
    }, [fetchAllFiles]);

    const handleDelete = async (fileId) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;
        try {
            await API.delete(`/admin/files/${fileId}`);
            setError('');
            await fetchAllFiles();
        } catch (err) {
            const message = err.response?.data?.message || 'Delete failed';
            setError(message);
            console.error('Delete error:', err);
        }
    };

    const downloadFile = async (fileId, filename) => {
        try {
            const response = await API.get(`/admin/files/${fileId}`, { responseType: 'blob' });
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
        <div className="admin-dashboard">
            <nav className="navbar">
                <h1>Admin Dashboard - Mini Drive</h1>
                <button onClick={handleLogout}>Logout</button>
            </nav>

            <div className="container">
                {error && (
                    <div className="error" style={{ margin: '20px 0', padding: '15px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px' }}>
                        ⚠️ {error}
                    </div>
                )}

                <h2>All Uploaded Files ({files.length})</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : files.length === 0 ? (
                    <p>No files uploaded yet</p>
                ) : (
                    <table className="files-table">
                        <thead>
                            <tr>
                                <th>File Name</th>
                                <th>Owner</th>
                                <th>Size</th>
                                <th>Uploaded</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map((file) => (
                                <tr key={file._id}>
                                    <td>{file.originalName}</td>
                                    <td>{file.owner?.email || 'Unknown'}</td>
                                    <td>{(file.size / 1024).toFixed(2)} KB</td>
                                    <td>{new Date(file.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button onClick={() => downloadFile(file._id, file.originalName)}>Download</button>
                                        <button onClick={() => handleDelete(file._id)} style={{ marginLeft: '10px' }}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
    *** End Patch
}
