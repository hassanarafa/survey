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

export default router;
