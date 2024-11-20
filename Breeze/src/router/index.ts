import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { AppPageType } from '@/types/AppState';


import LoginForm from '@/components/authorization/LoginForm.vue';
import RegisterOrganization from '@/components/authorization/RegisterOrganization.vue';
import EmployeeList from '@/components/adminView/EmployeeList.vue';
import Settings from '@/views/Settings.vue'; 

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' }, 
    {
      path: '/login',
      name: 'login',
      component: LoginForm,
    },
    {
      path: '/adminorg',
      name: 'adminorg',
      component: RegisterOrganization,
    },
    {
      path: '/employee',
      name: 'employee',
      component: EmployeeList,
    },
    {
      path: '/settings', 
      name: 'settings',
      component: Settings,
    },
  ],
});


router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  
  if (to.name === 'login') {
    authStore.navigateToPage(AppPageType.LOGIN);
  } else if (to.name === 'adminorg') {
    authStore.navigateToPage(AppPageType.REGISTRATION);
  } else if (to.name === 'employee') {
    authStore.navigateToPage(AppPageType.EMPLOYEE_LIST);
  }

  next();
});

export default router;


