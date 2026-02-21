import axios from 'axios';
import { auth } from './firebase';

const URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: URL,
    timeout: 120000, // 120s timeout for Render free tier cold starts
});

api.interceptors.request.use(async (config) => {
    if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
