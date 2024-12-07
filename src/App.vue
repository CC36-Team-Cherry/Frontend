<template>
  <div class="flex h-screen">
    <Sidebar v-if="showSidebar" class="w-64 flex-shrink-0" />
    <div class="flex-1 flex flex-col bg-gray-50">
      <component :is="currentHeader" class="flex-shrink-0" />
      <router-view class="flex-1 p-4 h-full" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';

import Sidebar from '@/views/Sidebar.vue';


const authStore = useAuthStore();

/*const currentHeader = computed(() => {
  return authStore.currentPage === 'EMPLOYEE_LIST' ? EmployeeHeader : null;
});*/

const showSidebar = computed(() => authStore.showSidebar);

</script>











