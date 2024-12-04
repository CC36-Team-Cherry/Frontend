<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-white p-6 rounded shadow-lg w-4/5 max-w-xl relative" style="max-height: 90%;">
      <button @click="$emit('close')" class="absolute top-2 right-2 text-gray-500 hover:text-black">✕</button>
      <slot></slot>
      <div class="mt-4 flex flex-col justify-center space-y-2">
        <button @click="confirmFunc" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">{{
          confirmString }}</button>
        <button @click="$emit('close')" class="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
  confirmFunc: {
    type: Function,
    required: true,
  },
  confirmString: {
    type: String,
    required: true,
  }
});
</script>