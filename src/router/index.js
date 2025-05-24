import { createRouter, createWebHistory } from 'vue-router';
import Cookies from 'js-cookie'; // ✅ use 'js-cookie', not 'cookie-js'

import Login from '@/views/LoginView.vue';
import Survey from '@/views/SurveyView.vue';
import UserAnswer from "@/views/UserAnswers.vue";
import SubmissionDetails from "@/components/SubmissionDetail.vue";
import SurveyList from "@/components/SurveyList.vue";
import DashBoard from "@/components/DashBoard.vue";

// ✅ Token validation: checks structure and expiry
function isTokenValid() {
    const tokenFromCookies = Cookies.get('authToken'); // Get the authToken from cookies
    const originalTokenFromCookies = Cookies.get('originalToken'); // Get the originalToken from cookies

    if (!tokenFromCookies || !originalTokenFromCookies) {
        console.warn('No token found in cookies');
        return false;
    }

    try {
        const payload = JSON.parse(atob(tokenFromCookies.split('.')[1])); // Decode the token
        const now = Math.floor(Date.now() / 1000); // Get current time in seconds

        // If the token is expired, return false
        if (!payload.exp || payload.exp < now) {
            console.warn('Token expired');
            return false;
        }

        // If the original token in cookies doesn't match, return false
        if (originalTokenFromCookies !== tokenFromCookies) {
            console.warn('Original token mismatch');
            return false;
        }

        return true;
    } catch (e) {
        console.error('Token decoding/parsing failed:', e);
        return false;
    }
}

// ✅ Routes
const routes = [
    { path: '/', name: 'login', component: Login },
    {
        path: '/survey/:id',
        name: 'survey',
        component: Survey,
        props: true,
        // meta: { requiresAuth: true }
    },
    {
        path: '/userAnswer/:userId/:surveyId',
        name: 'userAnswer',
        component: UserAnswer,
        props: true,
        // meta: { requiresAuth: true }
    },
    {
        path: '/submission/:id',
        name: 'SubmissionDetails',
        component: SubmissionDetails,
        props: true,
        // meta: { requiresAuth: true }
    },
    {
        path: '/surveys',
        name: 'SurveyList',
        component: SurveyList,
        // meta: { requiresAuth: true }
    },
    {
        path: '/dashboard',
        name: 'DashBoard',
        component: DashBoard,
        // meta: { requiresAuth: true }
    }
];

// ✅ Router
const router = createRouter({
    history: createWebHistory(),
    routes
});

// ✅ Navigation guard
router.beforeEach((to, from, next) => {
    const token = Cookies.get('authToken'); // ✅ read from cookie

    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (isTokenValid(token)) {
            next();
        } else {
            Cookies.remove('authToken');
            next({
                name: 'login',
                query: { warning: 'Session expired or token was modified. Please log in again.' }
            });
        }
    } else {
        next();
    }
});

export default router;
