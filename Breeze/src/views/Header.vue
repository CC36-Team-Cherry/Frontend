<template>
    <header class="flex justify-end items-center p-4 bg-gray-100 shadow">
      <div class="flex space-x-0">
        <button
          @click="switchLanguage('en-US')"
          :class="locale === 'en-US' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'"
          class="text-sm py-1 px-3 rounded-l hover:bg-blue-600 transition duration-200"
        >
          {{ $t('language.en') }}
        </button>
        <button
          @click="switchLanguage('ja-JP')"
          :class="locale === 'ja-JP' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'"
          class="text-sm py-1 px-3 rounded-r hover:bg-blue-600 transition duration-200"
        >
          {{ $t('language.jp') }}
        </button>
      </div>
      <button
        @click="handleLogout"
        class="ml-4 bg-red-500 text-white min-w-28 py-2 px-4 rounded hover:bg-red-600 transition duration-200"
      >
        {{ $t('Logout') }}
      </button>
    </header>
  </template>
  
  <script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { useAuthStore } from '@/stores/authStore';
  
  const { locale } = useI18n();
  const authStore = useAuthStore();
  
  const switchLanguage = (lang: string) => {
    locale.value = lang; 
  };
  
  const handleLogout = async () => {
    try {
      await authStore.logout();
      console.log('Logout');
      window.location.href = '/login';
    } catch (error) {
      console.error('Error:', error);
    }
  };
  </script>
  
  