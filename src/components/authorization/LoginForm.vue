<template>
  <LoopingRhombusesSpinner v-if="isLoading" class="bg-gray-100" />
  <div v-else class="flex flex-col h-screen bg-gray-100">
    <div class="absolute top-4 right-4 flex space-x-2">
      <button @click="switchLanguage('en-US')"
        :class="locale === 'en-US' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'"
        class="py-1 px-3 rounded hover:bg-blue-600 transition duration-200">
        {{ $t('language.en') }}
      </button>
      <button @click="switchLanguage('ja-JP')"
        :class="locale === 'ja-JP' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'"
        class="py-1 px-3 rounded hover:bg-blue-600 transition duration-200">
        {{ $t('language.jp') }}
      </button>
    </div>
    <div class="flex justify-center items-center flex-1">
      <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 class="text-2xl font-bold mb-4">{{ $t('login.title') }}</h2>
        <form @submit.prevent="handleLogin" class="flex flex-col space-y-4">
          <div>
            <label for="username" class="block text-gray-700">
              {{ $t('login.email') }}:
            </label>
            <input type="text" id="username" v-model="email" class="w-full p-2 border border-gray-300 rounded"
              required />
          </div>
          <div>
            <label for="password" class="block text-gray-700">
              {{ $t('login.password') }}:
            </label>
            <input type="password" id="password" v-model="password" class="w-full p-2 border border-gray-300 rounded"
              required />
          </div>
          <button type="submit" class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            {{ $t('login.submit') }}
          </button>
          <button @click="goToRegister()" class="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
            {{ $t('login.register') }}
          </button>
          <button @click="goToForgotPassword()" class="italic underline">
            Forgot your password?
          </button>
        </form>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase/firebaseConfig.ts'
import { useI18n } from 'vue-i18n';
import axios from "axios";
import LoopingRhombusesSpinner from '../../modal/Loading.vue';

const apiUrl = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

const email = ref('')
const password = ref('');
const authStore = useAuthStore();
const router = useRouter();
const { locale } = useI18n();
const isLoading = ref(false);

const handleLogin = async () => {
  isLoading.value = true;
  await loginFirebase();
  isLoading.value = false;
};

const getUserFromBackend = async (token: string) => {
  try {
    const backendData = await axios.post(`${apiUrl}/login`, { email: email.value, token: token }, { withCredentials: true });
    // store user data in Pinia
    authStore.login(backendData.data)
  } catch (err) {
    console.log(err);
  }
}

const updateLastLogin = async () => {
  try {
    const response = await axios.patch(`${apiUrl}/accounts/${authStore.user?.id}`, { last_login: new Date() })
  } catch (err) {
    console.error('Error updating last_login: ', err);
  }
}

const goToRegister = () => {
  router.push({ path: `/adminorg` });
}

const goToForgotPassword = () => {
  router.push({ path: `/forgotpassword` })
}

const loginFirebase = async () => {
  const credential = await signInWithEmailAndPassword(auth, email.value, password.value);
  const user = credential.user;
  const token = await user.getIdToken();
  await getUserFromBackend(token);
  updateLastLogin();
  if(authStore.user.language_preference === 'en') {
    locale.value = 'en-US';
  } else if (authStore.user.language_preference === 'ja') {
    locale.value = 'ja-JP';
  }
  router.push({ path: `/calendar` });
}

const switchLanguage = (lang) => {
  locale.value = lang;
};
</script>