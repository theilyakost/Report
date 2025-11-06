import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import PatientListView from '../views/PatientListView.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'PatientList',
        component: PatientListView,
        meta: { title: 'СПИСОК ПАЦИЕНТОВ' }
    },
    {
        path: '/patient/:id',
        name: 'PatientDetails',
        component: () => import('../views/PatientDetailsView.vue'),
        meta: { title: 'КАРТОЧКА ПАЦИЕНТА' }
    },
    {
        path: '/summary',
        name: 'Summary',
        component: () => import('../views/SummaryView.vue'),
        meta: { title: 'ОТЧЁТ' }
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('../views/ProfileView.vue'),
        meta: { title: 'НАСТРОЙКИ' }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;