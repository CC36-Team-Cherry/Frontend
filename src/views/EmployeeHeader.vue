<template>
    <header class="flex justify-between items-center p-4 bg-gray-100 shadow">
      <div class="flex gap-4 items-center">
        <div class="flex items-center px-4 py-2 bg-white shadow rounded border">
          <span class="font-bold">{{ $t('month') }}</span>
        </div>
        <div class="flex items-center px-4 py-2 bg-white shadow rounded border">
          <span class="text-sm font-medium">{{ $t('workingDays') }}: #</span>
          <span class="ml-2 font-bold"># Days / #</span>
        </div>
        <div class="flex items-center px-4 py-2 bg-white shadow rounded border">
          <span class="text-sm font-medium">{{ $t('workedHours') }}:</span>
          <span class="ml-2 font-bold">#</span>
        </div>
        <div class="flex items-center px-4 py-2 bg-white shadow rounded border">
          <span class="text-sm font-medium">{{ $t('ot') }}:</span>
          <span class="ml-2 font-bold">#</span>
        </div>
        <div class="flex items-center px-4 py-2 bg-white shadow rounded border">
          <span class="text-sm font-medium">{{ $t('ptoUsed') }}:</span>
          <span class="ml-2 font-bold">#</span>
        </div>
        <div class="flex items-center px-4 py-2 bg-white shadow rounded border">
          <span class="text-sm font-medium">{{ $t('remainingPto') }}:</span>
          <span class="ml-2 font-bold">#</span>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <button
          @click="switchLanguage('en-US')"
          :class="locale === 'en-US' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'"
          class="py-1 px-3 rounded hover:bg-blue-600 transition duration-200"
        >
          {{ $t('language.en') }}
        </button>
        <button
          @click="switchLanguage('ja-JP')"
          :class="locale === 'ja-JP' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'"
          class="py-1 px-3 rounded hover:bg-blue-600 transition duration-200"
        >
          {{ $t('language.jp') }}
        </button>
      </div>
    </header>
  </template>
  
  <script setup>
  import { useI18n } from 'vue-i18n';
  
  const { locale } = useI18n();
  
  const switchLanguage = (lang) => {
    locale.value = lang;
  };
  </script>
  
  