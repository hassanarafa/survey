import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/views/LoginView.vue';
import Survey from '@/views/SurveyView.vue';
import UserAnswer from "@/views/UserAnswers.vue";
import SubmissionDetails from "@/components/SubmissionDetail.vue"
import SurveyList from "@/components/SurveyList.vue"

const routes = [
    {
        path: '/',
        name: 'login',
        component: Login,
    },
    {
        path: '/survey/:id',
        name: 'survey',
        component: Survey,
        props: true,  // This will pass the parameters as props to the component
    },
    {
        path: '/userAnswer/:userId/:surveyId',
        name: 'userAnswer',
        component: UserAnswer,
        props: true,  // This will pass the parameters as props to the component
    },
    {
        path: '/submission/:id',
        name: 'SubmissionDetails',
        component: SubmissionDetails,
        props: true
    },
    {
        path: '/surveys',
        name: 'SurveyList',
        component: SurveyList
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem('authToken') // check if user is logged in

    if (to.path === '/' && isAuthenticated) {
        // If user tries to go to Login page while authenticated, redirect to Home
        next('/surveys')
    } else if (to.path !== '/' && !isAuthenticated) {
        // If user tries to access any page without logging in, redirect to Login
        next('/')
    } else {
        next() // Otherwise allow navigation
    }
})

export default router;
