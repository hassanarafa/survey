import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';

// Add this block before mounting the app
const token = localStorage.getItem('authToken');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

createApp(App).use(router).mount('#app');
