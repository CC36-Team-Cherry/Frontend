<template>
  <div>
    <h2>Step 1: Admin Details</h2>
    <form @submit.prevent="nextStep">
      <label>
        Admin Name:
        <input v-model="adminName" type="text" />
      </label>
      <label>
        Email Admin:
        <input v-model="adminEmail" type="email" />
      </label>
      <label>
        Password:
        <input v-model="adminPassword" type="password" />
      </label>
      <button type="submit">Next</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue';

const adminName = ref('');
const adminEmail = ref('');
const adminPassword = ref('');

const emit = defineEmits<{
  (e: 'next', data: { adminName: string; adminEmail: string; adminPassword: string }): void;
}>();

const nextStep = () => {
  emit('next', {
    adminName: adminName.value,
    adminEmail: adminEmail.value,
    adminPassword: adminPassword.value,
  });
};
</script>
