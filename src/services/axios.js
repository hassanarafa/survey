import axios from 'axios';

const api = axios.create({
    baseURL: 'https://survey.dd-ops.com/api/',
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use(
    config => config,
    error => Promise.reject(error)
);

api.interceptors.response.use(
    response => response,
    error => {
        console.error('API call error:', error);
        return Promise.reject(error);
    }
);

export default api;
