<template>
  <aside class="w-64 bg-gray-100 h-full shadow-md flex flex-col">
    <div class="p-4 flex justify-center items-center"><img src="/favicon.png" alt="Breeze logo" width="80" height="80"></div>
    <div class="text-center"> {{ authStore.user.company.name }} </div>
    <div class="border-b p-2 text-center"> {{ $t('Sidebar.Welcome') }} {{ authStore.user.first_name + " " + authStore.user.last_name}} </div>
    <nav class="flex-1 p-4 space-y-2">
      <router-link to="/calendar" class="block p-2 hover:bg-gray-200 rounded">
        {{ $t('Sidebar.Calendar') }}
      </router-link>
      <router-link to="/approvals" class="block p-2 hover:bg-gray-200 rounded">
        {{ $t('Sidebar.Approvals') }}
      </router-link>
      <router-link to="/employee" class="block p-2 hover:bg-gray-200 rounded">
        {{ $t('Sidebar.EmployeeList') }}
      </router-link>
      <router-link to="/admin" class="block p-2 hover:bg-gray-200 rounded">
        {{ $t('Sidebar.AdminPage') }}
      </router-link>
      <!-- Supervisor-specific link -->
       <router-link to="/supervisor-calendar"
         v-if="authStore.user.Privileges.is_supervisor"
         class="block p-2 hover:bg-gray-200 rounded">
        {{ $t('Sidebar.SupervisorCalendar') }}
       </router-link>
    </nav>
    <div class="flex justify-around p-4 border-t">
      <router-link to="/settings" class="w-full max-w-[120px] text-center">
        <button class="bg-gray-300 p-2 rounded w-full">
          {{ $t('Settings') }}
        </button>
      </router-link>
      <button
        @click="handleLogout()"
        class="bg-red-500 text-white p-2 rounded w-full max-w-[120px] text-center"
      >
        {{ $t('Logout') }}
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { getAuth, signOut } from "firebase/auth";
import { useAuthStore } from "@/stores/authStore";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
  logoutFirebase();
  clearCookie();
  router.push({ path: `/login` });
}

const logoutFirebase = async () => {
  signOut(getAuth())
  authStore.logout();
};

const clearCookie = async () => {
  await axios.post(`${apiUrl}/logout`, {}, { withCredentials: true });
}
</script>

  
  

  
  