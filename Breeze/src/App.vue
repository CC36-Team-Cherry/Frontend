<template>
  <div class="flex h-screen">
    
    <Sidebar v-if="showSidebar" class="w-64" />
    
    
    <div class="flex-1 flex flex-col">
      
      <component :is="currentHeader" />
      
     
      <router-view class="flex-1" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';

import Header from '@/views/Header.vue';
import EmployeeHeader from '@/views/EmployeeHeader.vue';
import Sidebar from '@/views/Sidebar.vue';

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

.h-screen {
  height: 100vh;
}
</style>










