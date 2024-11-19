<template>
  <div>
    <header>
      <button @click="switchLanguage('en-US')">English</button>
      <button @click="switchLanguage('ja-JP')">日本語</button>
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


