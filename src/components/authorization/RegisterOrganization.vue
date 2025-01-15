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

    <!-- Registration Form -->
    <div class="flex justify-center items-center flex-1">
      <div class="bg-white p-8 rounded shadow-md w-full max-w-lg">
        <h1 class="text-2xl font-bold mb-2 text-gray-800">{{ $t('register.title') }}</h1>
        <form @submit.prevent="handleSubmit" class="flex flex-col space-y-4">
          <hr class="border-gray-300">
          <div class="flex items-center justify-center gap-5">
            <input v-model="formData.first_name" type="text" :placeholder="$t('register.firstName')"
              data-test="reg-first-name"
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <input v-model="formData.last_name" type="text" :placeholder="$t('register.lastName')"
              data-test="reg-last-name"
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label class="block text-gray-700 mb-2">{{ $t('employeeDetails.fields.dateOfBirth') }}:</label>
            <input v-model="formData.birthdate" type="date" data-test="reg-birthday"
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <input v-model="formData.email" type="email" :placeholder="$t('login.email')"
              data-test="reg-username"
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <span v-if="duplicateEmail" class="text-red-500 italic">{{ $t('employeeList.emailInUse') }}</span>
          </div>
          <div>
            <input v-model="formData.password" type="password" :placeholder="$t('register.password')"
              data-test="reg-password"
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <hr class="border-gray-300">
          <div>
            <input v-model="formData.company_name" type="text" :placeholder="$t('register.organizationName')"
              data-test="reg-company-name"
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <input v-model="formData.role" type="text" :placeholder="$t('register.role')" data-test="reg-role"
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label class="block text-gray-700 mb-2">{{ $t('register.joinDate') }}:</label>
            <input v-model="formData.join_date" type="date" data-test="reg-join-date"
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <button type="submit" data-test="org-register-button"
            class="bg-blue-500 text-white py-3 px-4 rounded hover:bg-blue-600 transition duration-200">
            {{ $t('register.submit') }}
          </button>
          <button @click="goToLogin()" class="text-blue-500 text-sm hover:underline">
            {{ $t('login.return') }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, toRaw, onMounted } from 'vue';
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/authStore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig.ts'
import axios from 'axios';
import LoopingRhombusesSpinner from '@/components/Loading.vue';
import { useToast } from "vue-toastification";

const { t } = useI18n();
const router = useRouter();
const toast = useToast();

const apiUrl = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;
const authStore = useAuthStore();
const isLoading = ref(false);
const duplicateEmail = ref(false);
const { locale } = useI18n();

const formData = ref({
  email: '',
  auth_key: '',
  password: '',
  first_name: '',
  last_name: '',
  birthdate: '',
  role: '',
  join_date: '',
  company_name: '',
  is_admin: true,
  remaining_pto: 0,
});

const goToLogin = () => {
  router.push({ path: `/login` });
}

const handleSubmit = async () => {
  try {
    if (
      !formData.value.email ||
      !formData.value.password ||
      !formData.value.first_name ||
      !formData.value.last_name ||
      !formData.value.birthdate ||
      !formData.value.role ||
      !formData.value.join_date ||
      !formData.value.company_name
    ) {
      toast.warning(t('register.errorFillAllFields'))
      return;
    }
    isLoading.value = true;

    //check if the entered email address is already associated with an account in the database
    const doesAccountExist = await verifyAccount();
    if (doesAccountExist) {
      duplicateEmail.value = true;
      isLoading.value = false;
      return;
    }

    // create Firebase user with form data and fetch post to add to backend
    await createUserFirebase();
    router.push({ path: `/employee` });
    isLoading.value = false;
    toast.success(t('register.success'))

  } catch (err) {
    console.error(err);
  }
};

const createUserFirebase = async () => {
  const email = formData.value.email;
  const password = formData.value.password;


  //create the new user in Firebase
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  //add the new user's UID to the formData payload
  const uid = user.uid;
  formData.value.auth_key = uid;

  //generate the token to send to backend for cookie creation
  const token = await user.getIdToken();

  //create the new user in backend database
  const newAccount = toRaw(formData.value);
  await axios.post(`${apiUrl}/registration`, { newAccount });

  //receive cookie from backend and save user info in Pinia
  const backendData = await axios.post(`${apiUrl}/login`, { email: email, token: token });
  authStore.login(backendData.data);
};

const verifyAccount = async () => {
  try {
    const exists = await axios.post(`${apiUrl}/email`, { email: formData.value.email });
    return exists.data.exists;
  } catch (err) {
    console.error(err);
  }
}

const switchLanguage = (lang: any) => {
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
