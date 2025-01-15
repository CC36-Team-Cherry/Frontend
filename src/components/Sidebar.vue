<template>
  <div class="flex">
  <aside class="w-64 bg-gray-100 h-full shadow-md flex flex-col fixed top-0 left-0">
    <div class="p-4 flex justify-center items-center">
      <router-link to="/calendar">
        <img src="/favicon.png" alt="Breeze logo" width="80" height="80">
      </router-link>
    </div>
    <div class="text-center font-semibold"> {{ authStore.user.company.name }} </div>
    <div class="border-b p-2 text-center" > {{ $t('Sidebar.Welcome') }} <span class="italic">{{ authStore.user.first_name + " " +
      authStore.user.last_name}}</span> </div>
    <nav class="flex-1 p-4 space-y-2">
      <router-link to="/calendar" class="block p-2 hover:bg-gray-400 rounded" active-class="bg-blue-500 text-white">
        {{ $t('Sidebar.Calendar') }}
      </router-link>
      <div class="flex flex-row items-center relative">
        <router-link to="/approvals" class="block p-2 hover:bg-gray-400 rounded w-full" active-class="bg-blue-500 text-white">
          {{ $t('Sidebar.Approvals') }}
        </router-link>
        <span v-if="pendingApprovalsCount > 0"
          class="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center absolute right-3" active-class="bg-blue-500 text-white">
          {{ pendingApprovalsCount }}
        </span>
      </div>
      <router-link to="/employee" class="block p-2 hover:bg-gray-400 rounded" active-class="bg-blue-500 text-white">
        {{ $t('Sidebar.EmployeeList') }}
      </router-link>
      <!-- Supervisor-specific link -->
      <router-link to="/supervisor-calendar" active-class="bg-blue-500 text-white" v-if="authStore.user.Privileges.is_supervisor"
      class="block p-2 hover:bg-gray-400 rounded">
      {{ $t('Sidebar.SupervisorCalendar') }}
    </router-link>
    <router-link to="/admin" class="block p-2 hover:bg-gray-400 rounded" active-class="bg-blue-500 text-white" v-if="authStore.user.Privileges.is_admin">
      {{ $t('Sidebar.AdminPage') }}
    </router-link>
    </nav>
    <div class="w-64 flex items-center justify-center gap-10 p-4 m-1 border-t">
      <router-link to="/settings">
        <button :title="$t('Settings')" class="bg-gray-300 hover:bg-gray-400 p-2 rounded max-w-[120px]">
          <settings/>
        </button>
      </router-link>
      <button
        @click="handleLogout" :title="$t('Logout')"
        class="bg-gray-300 hover:bg-gray-400 p-2 rounded max-w-[120px] text-center">
          <logout/>
      </button>
    </div>
  </aside>
</div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'
import { useAuthStore } from "@/stores/authStore";
import axios from "axios";
import logout from "./logout.vue";
import settings from "./settings.vue";
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
  return pendingSent + pendingReceived;
});

// TODO: Try implement fetch in sidebar to update approvals notification.
// const getApprovals = async() => {
//   const response = await axios.get(`${apiUrl}/accounts/${authStore.user.id}/approvals`);

//   requests.sent = response.data.approvalsSentData;
//   requests.received = response.data.approvalsReceivedData;

//   const pendingSent = requests.sent.filter(approval => approval.status === 'Pending').length;
//   const pendingReceived = requests.received.filter(approval => approval.status === 'Pending').length;
//   return pendingSent + pendingReceived;
// };

// onMounted(() => {
//   getApprovals();
// });

</script>