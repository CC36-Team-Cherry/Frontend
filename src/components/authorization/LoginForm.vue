<template>
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
          @click="handleLogin()"
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


<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase/firebaseConfig.ts'
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

const email = ref('')
const password = ref('');
const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  await getUserFromBackend();
  loginFirebase();
  updateLastLogin();
};

const getUserFromBackend = async () => {
  try {
    const backendData = await axios.post(`${apiUrl}/login`, {email: email.value});
    // store user data in Pinia
    authStore.login(backendData.data)
  } catch (err) {
    console.log(err);
  }
}

const updateLastLogin = async () => {
  try {
    const response = await axios.patch(`${apiUrl}/accounts/${authStore.user?.id}`, {last_login: new Date()})
  } catch (err) {
    console.error('Error updating last_login: ', err);
  }
}

const goToRegister = () => {
  router.push({ path: `/adminorg` });
}

const loginFirebase = () => {
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then((userCredential) => {
      router.push({ path: `/calendar` });
    })
    .catch((error) => {
      const errorCode = error.code;
      if (errorCode === 'auth/user-not-found') {
        console.error('Nessun utente trovato con questa email.');
      } else if (errorCode === 'auth/wrong-password') {
        console.error('Password errata.');
      } else {
        console.error('Errore di autenticazione:', error.message);
      }
    });
};

</script>
