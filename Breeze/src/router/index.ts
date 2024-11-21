import { createRouter, createWebHistory, type RouteLocationNormalizedGeneric } from "vue-router";
import { onAuthStateChanged } from "firebase/auth";
import LoginForm from "@/components/authorization/LoginForm.vue";
import RegisterOrganization from "@/components/authorization/RegisterOrganization.vue";
import Playground from "@/components/authorization/Playground.vue";
import { auth } from '../firebase/firebaseConfig.ts'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/login", // Redirect root to /login
    },
    {
      path: "/login",
      name: "login",
      component: LoginForm,
    },
    {
      path: "/adminorg",
      name: "adminorg",
      component: RegisterOrganization,
    },
    {
      path: "/playground",
      name: "playground",
      component: Playground,
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
  if (!await authenticate() && to.name !== 'login') {
    // redirect the user to the login page
    return { name: 'login' }
  }
});

export default router;
