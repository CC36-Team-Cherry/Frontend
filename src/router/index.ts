import { createRouter, createWebHistory, type RouteLocationNormalizedGeneric } from "vue-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../firebase/firebaseConfig.ts'
import { useAuthStore } from '@/stores/authStore';
import { AppPageType } from '@/types/AppState';
import LoginForm from "@/components/authorization/LoginForm.vue";
import RegisterOrganization from "@/components/authorization/RegisterOrganization.vue";
import Calendar from "@/components/authorization/Calendar.vue";
import EmployeeList from '@/components/adminView/EmployeeList.vue';
import PasswordReset from '@/components/authorization/PasswordReset.vue';
import Settings from '@/views/Settings.vue'; 

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
      path:'/calendar',
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
      path: '/settings', 
      name: 'settings',
      component: Settings,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/passwordreset',
      name: 'passwordreset',
      component: PasswordReset,
      meta: {
        requiresAuth: true
      }
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

// router.beforeEach((to, from, next) => {
//   const authStore = useAuthStore();

  
//   if (to.name === 'login') {
//     authStore.navigateToPage(AppPageType.LOGIN);
//   } else if (to.name === 'adminorg') {
//     authStore.navigateToPage(AppPageType.REGISTRATION);
//   } else if (to.name === 'employee') {
//     authStore.navigateToPage(AppPageType.EMPLOYEE_LIST);
//   }

//   next();
// });

export default router;


