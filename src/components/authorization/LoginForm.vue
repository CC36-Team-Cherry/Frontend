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

const email = ref('')
const password = ref('');
const authStore = useAuthStore();
const router = useRouter();

const handleLogin = () => {
  //TODO: fetch user info from backend
  //TODO: modify authStore.ts to be able to store all of the info that we want, also modify the below authStore.login command to include all of this info
  authStore.login({ first_name: 'name', last_name: 'last', email: email.value, is_admin: false, is_supervisor: false, company_id: 1, team_id: 1, team_name: "team", role: "leader", join_date: new Date(2020-12-2), pto: 8 });
  loginFirebase();
};

const goToRegister = () => {
  router.push({ path: `/adminorg` });
}

const loginFirebase = () => {
  signInWithEmailAndPassword(auth, email.value, password.value)
  .then((userCredential) => {
    // Signed in 
    router.push({ path: `/calendar` });
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorCode, errorMessage);
  });
}

</script>
