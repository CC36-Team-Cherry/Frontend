import { createRouter, createWebHistory, type RouteLocationNormalizedGeneric } from "vue-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../firebase/firebaseConfig.ts'
import { useAuthStore } from '@/stores/authStore';
import { AppPageType } from '@/types/AppState';
import LoginForm from "@/components/authorization/LoginForm.vue";
import RegisterOrganization from "@/components/authorization/RegisterOrganization.vue";
import Calendar from "@/components/authorization/Calendar.vue";
import EmployeeList from '@/components/adminView/EmployeeList.vue';
import NewLogin from '@/components/authorization/NewLogin.vue';
import ForgotPassword from '@/components/authorization/ForgotPassword.vue';
import Settings from '@/views/Settings.vue'; 
import AdminConsole from '@/components/adminView/AdminConsole.vue';
import Approvals from '@/views/Approvals.vue';
import SupervisorCalendar from '@/components/adminView/SupervisorCalendar.vue';
import MobileLanding from '@/views/MobileLanding.vue'

//THIS IS FOR TESTING FIREBASE, DELETE THIS LATER
import Playground from "@/components/authorization/Playground.vue";

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
      path:'/calendar/',
      name:'calendar',
      component: Calendar,
      meta: {
        requiresAuth: true,
        layout: 'default'
      },
    },
    {
      path: '/employee',
      name: 'employee',
      component: EmployeeList,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/supervisor-calendar/:userId?',
      name: 'supervisorCalendar',
      component: SupervisorCalendar,
      props: route => ({ userId: route.params.userId }),
      meta: {
        requiresAuth: true
      },
    },
    {
      path: '/settings', 
      name: 'settings',
      component: Settings,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/admin', 
      name: 'admin',
      component: AdminConsole,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/approvals', 
      name: 'approvals',
      component: Approvals,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/newlogin',
      name: 'newlogin',
      component: NewLogin,
    },
    {
      path: '/forgotpassword',
      name: 'forgotpassword',
      component: ForgotPassword,
    },
    {
      path: '/landing',
      name: 'landing',
      component: MobileLanding,
    },
    //THIS IS FOR TESTING FIREBASE, DELETE THIS LATER
    {
      path: "/playground",
      name: "playground",
      component: Playground,
      meta: {
        requiresAuth: true
      }
    },
  ],
});

function authenticate () {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      resolve(user);
    }, reject)
  })
};

router.beforeEach(async (to) => {
  let requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  if (!await authenticate() && requiresAuth) {
    return { name: 'login' }
  }
});

router.beforeEach((to, from, next) => {
  if ((to.path === '/' || to.path === '/login') && screen.width < screen.height) {
    return next('/landing');
  }

  const authStore = useAuthStore();

  switch (to.name) {
    case 'employee':
      authStore.navigateToPage(AppPageType.EMPLOYEE_LIST);
      break;
    case 'calendar':
      authStore.navigateToPage(AppPageType.CALENDAR);
      break;
    case 'supervisorCalendar':
      authStore.navigateToPage(AppPageType.SUPERVISORCALENDAR);
      break;
    case 'settings':
      authStore.navigateToPage(AppPageType.SETTINGS);
      break;
    case 'admin':
      authStore.navigateToPage(AppPageType.ADMINCONSOLE);
      break;
    case 'approvals':
      authStore.navigateToPage(AppPageType.APPROVAL);
      break;
    default:
      break;
  }

  next();
});

  

export default router;