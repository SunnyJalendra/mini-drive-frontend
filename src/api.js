import axios from 'axios';

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
    headers: { 'Content-Type': 'application/json' }
});

export const setAuthToken = (token) => {
    if (token) {
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('token', token);
    } else {
        delete API.defaults.headers.common['Authorization'];
        localStorage.removeItem('token');
    }
};

// Initialize with stored token
const token = localStorage.getItem('token');
if (token) setAuthToken(token);

export default API;
