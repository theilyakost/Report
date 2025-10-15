import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import PatientListView from '../views/PatientListView.vue';

const routes: Array<RouteRecordRaw> = [
    { path: '/', name: 'PatientList', component: PatientListView, meta: { title: 'Пациенты' } },
    {
        path: '/patient/:id',
        name: 'PatientDetails',
        component: () => import('../views/PatientDetailsView.vue'),
        meta: { title: 'Карточка пациента' }
    },
    {
        path: '/summary',
        name: 'Summary',
        component: () => import('../views/SummaryView.vue'),
        meta: { title: 'Отчёт' }
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('../views/ProfileView.vue'),
        meta: { title: 'Профиль' }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;