<template>
    <aside class="w-64 bg-gray-100 h-full shadow-md flex flex-col">
      <div class="p-4 text-center font-bold border-b">{{ $t('Sidebar.Logo') }}</div>
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
      </nav>
      <div class="flex justify-around p-4 border-t">
        <router-link to="/settings" class="w-full max-w-[120px] text-center">
        <button class="bg-gray-300 p-2 rounded w-full">
         {{ $t('Settings') }}
        </button>
        </router-link>
        <button
          @click="logoutFirebase()"
          class="bg-red-500 text-white p-2 rounded w-full max-w-[120px] text-center"
        >
          {{ $t('Logout') }}
        </button>
      </div>
    </aside>
  </template>
  
  
  
  <script setup>
  import { getAuth, signOut } from 'firebase/auth';
  import { useAuthStore } from '@/stores/authStore';
  
  const authStore = useAuthStore();

  const logoutFirebase = () => {
    signOut(getAuth()).then(() => {
      authStore.logout();
      window.location.href = '/login';
    }).catch((error) => {
    // An error happened.
    });
  };

  </script>
  
  

  
  