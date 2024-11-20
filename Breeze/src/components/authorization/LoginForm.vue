<template>
  <template v-if="user===null">
  <div class="flex justify-center items-center h-screen bg-gray-100">
    <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
      <h2 class="text-2xl font-bold mb-4">{{ $t('login.title') }}</h2>
      <form @submit.prevent="handleLogin" class="flex flex-col space-y-4">
        <div>
          <label for="username" class="block text-gray-700">
            {{ $t('login.email') }}:
          </label>
          <input
            type="text"
            id="username"
            v-model="email"
            class="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label for="password" class="block text-gray-700">
            {{ $t('login.password') }}:
          </label>
          <input
            type="password"
            id="password"
            v-model="password"
            class="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <button
          @click="loginFirebase()"
          type="submit"
          class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          {{ $t('login.submit') }}
        </button>
        <button
          @click="goToRegister()"
          class="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          {{ $t('login.register') }}
        </button>
      </form>
    </div>
  </div>
  </template>
  <template v-else>
    <div class="flex justify-center items-center h-screen bg-gray-100">
    You are already logged in.
    <button
      @click="goToLoggedIn()"
      class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
    >
      Continue to site
    </button>
  </div>
  </template>
</template>


<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase/init.ts';

const email = ref('')
const password = ref('');
const authStore = useAuthStore();

const user = auth.currentUser;

const handleLogin = () => {
  //authStore.login({ name: 'name', email: email.value });
};

const goToRegister = () => {
  window.location.href = '/adminorg';
}

const goToLoggedIn = () => {
  window.location.href = '/logintest';
}

const loginFirebase = () => {
  signInWithEmailAndPassword(auth, email.value, password.value)
  .then((userCredential) => {
    // Signed in 
    window.location.href = '/logintest';
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorCode, errorMessage);
  });
}

</script>
