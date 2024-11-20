<template>
    <header class="flex justify-end items-center p-4 bg-gray-100 shadow">
      <div class="flex space-x-0">
        <button
          @click="checkLogin()"
          class="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          Check if we're logged in?
        </button>
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
        @click="logoutFirebase"
        class="ml-4 bg-red-500 text-white min-w-28 py-2 px-4 rounded hover:bg-red-600 transition duration-200"
      >
        {{ $t('Logout') }}
      </button>
    </header>
  </template>
  
  <script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { useAuthStore } from '@/stores/authStore';
  import { signOut } from "firebase/auth";
  import { auth } from '../firebase/init.ts';
  
  const { locale } = useI18n();
  const authStore = useAuthStore();
  
  const switchLanguage = (lang: string) => {
    locale.value = lang; 
  };
  
  const handleLogout = async () => {
    // try {
    //   await authStore.logout();
    //   console.log('Logout');
    //   window.location.href = '/login';
    // } catch (error) {
    //   console.error('Error:', error);
    // }
  };

  const logoutFirebase = () => {
    signOut(auth).then(() => {
      // Sign-out successful.
      window.location.href = '/login';
    }).catch((error) => {
    // An error happened.
    });
  };

  const checkLogin = () => {
    console.log(auth.currentUser);
  }

  </script>
  
  