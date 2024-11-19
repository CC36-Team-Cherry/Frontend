<template>
  <div>
    <header class="flex justify-end items-center p-4 bg-gray-100 shadow">
      <button @click="switchLanguage('en-US')" class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200 mx-2">English</button>
      <button @click="switchLanguage('ja-JP')" class="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-200 mx-2">日本語</button>
    </header>
    <router-view />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

const switchLanguage = (lang) => {
  locale.value = lang;
};
</script>

<style>
header {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin: 10px;
}

button {
  padding: 5px 10px;
  font-size: 16px;
  cursor: pointer;
}
</style>


