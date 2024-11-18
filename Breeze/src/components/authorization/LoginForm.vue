<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent="handleLogin">
      <label>
        Email:
        <input v-model="email" type="email" />
      </label>
      <label>
        Password:
        <input v-model="password" type="password" />
      </label>
      <button type="submit">Login</button>
    </form>
    <button @click="$emit('register')">Create Organization</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const email = ref('');
const password = ref('');
const authStore = useAuthStore();

const handleLogin = () => {
  authStore.login({ name: 'name', email: email.value });
};
</script>
