<template>
  <LoopingRhombusesSpinner v-if="isLoading" class="bg-gray-100" />
  <div v-else class="flex flex-col h-screen bg-gray-100">

    <!-- Language Buttons in the Top-Right Corner -->
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

    <!-- Reset Password Confirmation Form -->
    <div class="flex justify-center items-center flex-1">
      <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 class="text-2xl font-bold mb-4">{{ $t('login.resetPassword') }}</h2>
        <form class="flex flex-col space-y-4">
          <div>
            <label for="password" class="block text-gray-700">
            </label>
            <input
              type="password"
              id="password"
              v-model="newPassword"
              :placeholder="$t('login.placeholders.newPassword')"
              class="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label for="password" class="block text-gray-700">
            </label>
            <input
              type="password"
              id="password-confirm"
              v-model="confirmNewPassword"
              :placeholder="$t('login.placeholders.confirmPassword')"
              class="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <button @click="handleResetPassword()" type="button"
            class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition">
            {{ $t('login.submit') }}
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
import { verifyPasswordResetCode, confirmPasswordReset, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase/firebaseConfig.ts';
import { useI18n } from 'vue-i18n';
import axios from "axios";
import LoopingRhombusesSpinner from '../../modal/Loading.vue';
import { useToast } from "vue-toastification";

const apiUrl = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;
const { locale } = useI18n();
const isLoading = ref(false);
const toast = useToast();
const { t } = useI18n();

const newPassword = ref('');
const confirmNewPassword = ref('');
const authStore = useAuthStore();
const router = useRouter();

let accountEmail = '';

const handleResetPassword = () => {
  if (newPassword.value !== confirmNewPassword.value) {
    toast.warning(t('login.passwordMismatch'));
    return;
  }
  isLoading.value = true;
  const actionCode = getParameterByName('oobCode');
  verifyPasswordResetCode(auth, actionCode)
    .then((email) => {
      accountEmail = email;
      confirmPasswordReset(auth, actionCode, newPassword.value)
        .then((res) => {
          loginFirebase();
      })
        .catch((error) => {
          console.error(error.code, error.message);
      });
    })
    .catch((error) => {
      console.error(error.code, error.message);
  });
}


const getParameterByName = (name: string) => {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  const regexS = "[\\?&]" + name + "=([^&#]*)";
  const regex = new RegExp(regexS);
  const results = regex.exec(window.location.href);
  if (!results) {
    return "";
  } else {
    return decodeURIComponent(results[1].replace(/\+/g, " "));
  }
}

const getUserFromBackend = async (token: string) => {
  try {
    const backendData = await axios.post(`${apiUrl}/login`, { email: accountEmail, token: token });
    // store user data in Pinia
    authStore.login(backendData.data)
  } catch (err) {
    console.error(err);
  }
}

const updateLastLogin = async () => {
  try {
    const response = await axios.patch(`${apiUrl}/accounts/${authStore.user?.id}`, { last_login: new Date() })
  } catch (err) {
    console.error('Error updating last_login: ', err);
  }
}

const loginFirebase = async () => {
  const credential = await signInWithEmailAndPassword(auth, accountEmail, newPassword.value);
  const user = credential.user;
  const token = await user.getIdToken();
  await getUserFromBackend(token);
  updateLastLogin();
  router.push({ path: `/calendar` });
  isLoading.value = false;
}

const switchLanguage = (lang : any) => {
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
