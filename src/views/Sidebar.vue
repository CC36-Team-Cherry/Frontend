<template>
  <aside class="w-64 bg-gray-100 h-full shadow-md flex flex-col">
    <div class="p-4 flex justify-center items-center"><img src="/favicon.png" alt="Breeze logo" width="80" height="80">
    </div>
    <div class="text-center"> {{ authStore.user.company.name }} </div>
    <div class="border-b p-2 text-center"> {{ $t('Sidebar.Welcome') }} {{ authStore.user.first_name + " " +
      authStore.user.last_name}} </div>
    <nav class="flex-1 p-4 space-y-2">
      <router-link to="/calendar" class="block p-2 hover:bg-gray-200 rounded">
        {{ $t('Sidebar.Calendar') }}
      </router-link>
      <div class="flex flex-row items-center">
        <router-link to="/approvals" class="block p-2 hover:bg-gray-200 rounded">
          {{ $t('Sidebar.Approvals') }}
        </router-link>
        <span v-if="pendingApprovalsCount > 0"
          class="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {{ pendingApprovalsCount }}
        </span>
      </div>
      <router-link to="/employee" class="block p-2 hover:bg-gray-200 rounded">
        {{ $t('Sidebar.EmployeeList') }}
      </router-link>
      <router-link to="/admin" class="block p-2 hover:bg-gray-200 rounded">
        {{ $t('Sidebar.AdminPage') }}
      </router-link>
      <!-- Supervisor-specific link -->
      <router-link to="/supervisor-calendar" v-if="authStore.user.Privileges.is_supervisor"
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
      <button @click="handleLogout" class="bg-red-500 text-white p-2 rounded w-full max-w-[120px] text-center">
        {{ $t('Logout') }}
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router'
import { useAuthStore } from "@/stores/authStore";
import axios from "axios";
import { useLogout } from "@/utils/useLogout";

const { handleLogout } = useLogout();

const apiUrl = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;
const authStore = useAuthStore();
const router = useRouter();

const requests = ref({
  sent: [],
  received: []
});

const pendingApprovalsCount = computed(() => {
  const sentApprovals = authStore.approvals.sent || [];
  const receivedApprovals = authStore.approvals.received || [];

  const pendingSent = sentApprovals.filter(approval => approval.status === 'Pending').length;
  const pendingReceived = receivedApprovals.filter(approval => approval.status === 'Pending').length;

  console.log(authStore.approvals)
  return pendingSent + pendingReceived;
});
</script>