<template>
    <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-white p-6 rounded shadow-lg w-1/2 relative">
        <button @click="$emit('close')" class="absolute top-2 right-2 text-gray-500 hover:text-black">✕</button>
        <slot></slot>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    isVisible: {
      type: Boolean,
      required: true,
    },
  });
  </script>

  
  
  

  

  

  