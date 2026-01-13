import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { setAuthToken } from '../api';
import './Admin.css';

export default function AdminDashboard() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchAllFiles = useCallback(async () => {
        try {
            const { data } = await API.get('/admin/files');
            setFiles(data);
        } catch (err) {
            alert('Access denied or failed to load: ' + err.response?.data?.message);
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchAllFiles();
    }, [fetchAllFiles]);

    const handleDelete = async (fileId) => {
        if (!window.confirm('Delete this file?')) return;
        try {
            await API.delete(`/admin/files/${fileId}`);
            alert('File deleted by admin');
            fetchAllFiles();
        } catch (err) {
            alert('Delete failed: ' + err.response?.data?.message);
        }
    };

    const downloadFile = async (fileId, filename) => {
        try {
            const res = await API.get(`/admin/files/${fileId}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename || 'file');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Download failed: ' + (err.response?.data?.message || err.message));
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
                                    <td>{file.owner?.email}</td>
                                    <td>{(file.size / 1024).toFixed(2)} KB</td>
                                    <td>{new Date(file.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button onClick={() => downloadFile(file._id, file.originalName)}>Download</button>
                                        <button onClick={() => handleDelete(file._id)}>Delete</button>
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
