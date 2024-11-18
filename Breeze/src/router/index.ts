import { createRouter, createWebHistory } from "vue-router";
import LoginForm from "@/components/authorization/LoginForm.vue";
import RegisterOrganization from "@/components/authorization/RegisterOrganization.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/login", 
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
  ],
});

export default router;
