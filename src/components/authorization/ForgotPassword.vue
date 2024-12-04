<template>
    <LoopingRhombusesSpinner v-if="isLoading" class="bg-gray-100" />
    <div v-else class="flex flex-col h-screen bg-gray-100">

        <!-- Language Buttons -->
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

        <!-- Reset Password Form -->
        <div class="flex justify-center items-center flex-1">
            <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 class="text-2xl font-bold mb-4">{{ $t('login.resetPassword') }}</h2>
                <form @submit.prevent="handleSubmit" class="flex flex-col space-y-4">
                <div>
                    <label for="username" class="block text-gray-700"></label>
                    <input
                    type="text"
                    id="username"
                    v-model="email"
                    :placeholder="$t('login.placeholders.email')"
                    class="w-full p-2 border border-gray-300 rounded"
                    required
                    />
                </div>
                <button
                    type="submit"
                    class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                {{ $t('login.sendEmail') }}
                </button>
                <button
                    @click="goToLogin()"
                    class="text-blue-500 text-sm hover:underline"
                >
                {{ $t('login.return') }}
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
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../../firebase/firebaseConfig.ts'
import { useI18n } from 'vue-i18n';
import axios from "axios";
import LoopingRhombusesSpinner from '../../modal/Loading.vue';
axios.defaults.withCredentials = true;

const email = ref('')
const router = useRouter();
const { locale } = useI18n();
const authStore = useAuthStore();
const isLoading = ref(false);

const handleSubmit = async () => {
  isLoading.value = true;
  await resetEmail();
  router.push({ path: `/login` });
  isLoading.value = false;

  //TODO: add toast popup on success
  //Success! Please check your email
    
  //TODO: add validation to confirm if account exists

};

const resetEmail = async () => {
  try {
    await sendPasswordResetEmail(auth, email.value);
  } catch (err) {
    console.error(err);
  }
};

const switchLanguage = (lang : any) => {
    locale.value = lang;
}

const goToLogin = () => {
  router.push({ path: `/login` });
}
  
const checkLogin = () => {
  if (authStore.user) {
    router.push({ path: `/calendar` });
  }
}

onMounted(() => {
  checkLogin();
});
  
</script>

