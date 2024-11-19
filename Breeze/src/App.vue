<template>
  <div class="flex h-screen">
    
    <Sidebar v-if="showSidebar" class="w-64 flex-shrink-0" />

    
    <div class="flex-1 flex flex-col bg-gray-50">
      
      <component :is="currentHeader" class="flex-shrink-0" />

      
      <router-view class="flex-1 p-4" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';

import Sidebar from '@/views/Sidebar.vue';
import Header from '@/views/Header.vue';
import EmployeeHeader from '@/views/EmployeeHeader.vue';

const authStore = useAuthStore();

const currentHeader = computed(() => {
  if (authStore.currentPage === 'EMPLOYEE_LIST') {
    return EmployeeHeader;
  } else {
    return Header;
  }
});

const showSidebar = computed(() => authStore.showSidebar);
</script>

<style scoped>
/* Full screen layout */
.h-screen {
  height: 100vh;
}

/* Fix Sidebar and Content layout */
.flex-1 {
  display: flex;
  flex-direction: column;
}
</style>










