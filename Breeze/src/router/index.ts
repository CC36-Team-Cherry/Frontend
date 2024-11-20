import { createRouter, createWebHistory } from "vue-router";
import LoginForm from "@/components/authorization/LoginForm.vue";
import RegisterOrganization from "@/components/authorization/RegisterOrganization.vue";
import LoginTest from "@/components/authorization/LoginTest.vue";

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
      path: "/logintest",
      name: "logintest",
      component: LoginTest,
    },
  ],
});

export default router;
