<template>
    <header class="flex justify-between items-center p-4 bg-gray-100 shadow">
      
      <div class="flex gap-4">
        <div class="p-4 shadow bg-white rounded border w-64">
          <h3 class="font-bold mb-2">{{ $t('employeeList.employeeHeader.currentMonthInfo') }}</h3>
          <ul class="text-sm">
            <li>- {{ $t('employeeList.employeeHeader.expectedHours') }}</li>
            <li>- {{ $t('employeeList.employeeHeader.totalHours') }}</li>
            <li>- {{ $t('employeeList.employeeHeader.currentOT') }}</li>
          </ul>
        </div>
        <div class="p-4 shadow bg-white rounded border w-64">
          <h3 class="font-bold mb-2">{{ $t('employeeList.employeeHeader.ptoInfo') }}</h3>
          <ul class="text-sm">
            <li>- {{ $t('employeeList.employeeHeader.remainingPTO') }}</li>
            <li>- {{ $t('employeeList.employeeHeader.ptoUsed') }}</li>
          </ul>
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
  //add a comment for push
  const switchLanguage = (lang) => {
    locale.value = lang;
  };
  </script>
  