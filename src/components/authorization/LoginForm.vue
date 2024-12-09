<template>
  <LoopingRhombusesSpinner v-if="isLoading" class="bg-gray-100" />
  <div v-else class="flex flex-col h-screen bg-gray-100">

    <!-- en/jp switch -->
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

    <!-- login page contents -->
    <div class="grid grid-cols-2 h-screen gap-x-36 m-auto">

    <!-- logo & text -->
      <div class="flex flex-col justify-center items-center">
        <img src="/favicon.png" title="Breeze">
        <h2 class="text-5xl font-bold mt-6">Breeze</h2>
        <h1 class="italic mt-2">The simple attendance management app</h1>
      </div>

    <!-- login form -->
      <div class="bg-white p-8 rounded shadow-md w-[32rem] m-auto">
        <h2 class="text-2xl font-bold mb-4">{{ $t('login.title') }}</h2>
        <form @submit.prevent="handleLogin" class="flex flex-col space-y-4">
          <div>
          <label for="username" class="block text-gray-700">
          </label>
          <input
            type="text"
            id="username"
            v-model="email"
            :placeholder="$t('login.placeholders.email')"
            class="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label for="password" class="block text-gray-700">
          </label>
          <input
            type="password"
            id="password"
            v-model="password"
            :placeholder="$t('login.placeholders.password')"
            class="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <button
          type="submit"
          data-test="login-button"
          class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
        >
          {{ $t('login.submit') }}
        </button>
        <button
          @click="goToForgotPassword()"
          class="text-blue-500 text-sm hover:underline"
        >
          {{ $t('login.forgotPassword') }}
        </button>
        <hr class="border-gray-300">
        <button
          data-test="register-button"
          @click="goToRegister()"
          class="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition"
        >
          {{ $t('login.register') }}
        </button>
        </form>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase/firebaseConfig.ts'
import { useI18n } from 'vue-i18n';
import axios from "axios";
import LoopingRhombusesSpinner from '../../modal/Loading.vue';
import { useToast } from "vue-toastification";

const apiUrl = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;
const toast = useToast();
const {t} = useI18n();

const email = ref('')
const password = ref('');
// TODO: Need to edit with correct type
const authStore = useAuthStore() as any;
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
  const credential = await signInWithEmailAndPassword(auth, email.value, password.value).catch((err) => {
    toast.error(t('login.invalidLogin'));
    isLoading.value = false;
    return;
  });
  if (credential) {
    const user = credential.user;
    const token = await user.getIdToken();
    await getUserFromBackend(token);
    updateLastLogin();
    if(authStore.user?.language_preference === 'en') {
      locale.value = 'en-US';
    } else if (authStore.user?.language_preference === 'ja') {
      locale.value = 'ja-JP';
    }
    router.push({ path: `/calendar` });
  }
}

const switchLanguage = (lang : string) => {
  locale.value = lang;
};

const checkLogin = () => {
  if (authStore.user) {
    router.push({ path: `/calendar` });
  }
}

onMounted(() => {
  checkLogin();
});

</script>
