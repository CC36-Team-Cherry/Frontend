import { createRouter, createWebHistory } from "vue-router";
import LoginForm from "@/components/authorization/LoginForm.vue";
import RegisterOrganization from "@/components/authorization/RegisterOrganization.vue";
import Step1 from "@/components/authorization/Step1.vue";
import Step2 from "@/components/authorization/Step2.vue";

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
      path: "/step1",
      name: "step1",
      component: Step1,
    },
    {
      path: "/step2",
      name: "step2",
      component: Step2,
    },
  ],
});

export default router;
