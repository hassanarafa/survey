import axios from 'axios';

// Create an axios instance with a base URL
const api = axios.create({
    baseURL: 'https://survey.dd-ops.com/api/', // Base URL for your API
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add an interceptor to attach the Authorization token to each request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken'); // Retrieve token from localStorage (or sessionStorage)
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`; // Attach token to headers
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Optionally, you can add response interceptors to handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API call error:', error);
        return Promise.reject(error);
    }
);

export default api;
