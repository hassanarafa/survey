import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/views/LoginView.vue';
import Survey from '@/views/SurveyView.vue';
import UserAnswer from "@/views/UserAnswers.vue"

const routes = [
    {
        path: '/',
        name: 'login',
        component: Login,
    },
    {
        path: '/survey',
        name: 'survey',
        component: Survey,
    },
    {
        path: '/userAnswer/:userId/:surveyId',
        name: 'userAnswer',
        component: UserAnswer,
        props: true,  // This will pass the parameters as props to the component
    }
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem('authToken') // check if user is logged in

    if (to.path === '/' && isAuthenticated) {
        // If user tries to go to Login page while authenticated, redirect to Home
        next('/survey')
    } else if (to.path !== '/' && !isAuthenticated) {
        // If user tries to access any page without logging in, redirect to Login
        next('/')
    } else {
        next() // Otherwise allow navigation
    }
})

export default router;
