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
        <h1 class="text-2xl font-bold mb-6 text-gray-800">{{ $t('register.title') }}</h1>
        <form @submit.prevent="handleSubmit" class="flex flex-col space-y-4">
          <div>
            <label class="block text-gray-700 font-medium mb-2">
              <span class="text-red-500 font-bold">*</span>{{ $t('login.email') }}:
            </label>
            <input v-model="formData.email" type="email"
              class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required />
            <span v-if="duplicateEmail" class="text-red-500 italic">{{ $t('employeeList.emailInUse') }}</span>
          </div>
          <div>
            <label class="block text-gray-700 font-medium mb-2">
              <span class="text-red-500 font-bold">*</span>{{ $t('login.password') }}:
            </label>
            <input v-model="formData.password" type="password"
              class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required />
          </div>
          <div>
            <label class="block text-gray-700 font-medium mb-2">
              <span class="text-red-500 font-bold">*</span>{{ $t('register.firstName') }}:
            </label>
            <input v-model="formData.first_name" type="text"
              class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required />
          </div>
          <div>
            <label class="block text-gray-700 font-medium mb-2">
              <span class="text-red-500 font-bold">*</span>{{ $t('register.lastName') }}:
            </label>
            <input v-model="formData.last_name" type="text"
              class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required />
          </div>
          <div>
            <label class="block text-gray-700 font-medium mb-2">
              <span class="text-red-500 font-bold">*</span>{{ $t('employeeDetails.fields.dateOfBirth') }}:
            </label>
            <input v-model="formData.birthdate" type="date"
              class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required />
          </div>
          <div>
            <label class="block text-gray-700 font-medium mb-2">
              <span class="text-red-500 font-bold">*</span>{{ $t('settings.fields.role') }}:
            </label>
            <input v-model="formData.role" type="text"
              class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required />
          </div>
          <div>
            <label class="block text-gray-700 font-medium mb-2">
              <span class="text-red-500 font-bold">*</span>{{ $t('settings.fields.joinDate') }}:
            </label>
            <input v-model="formData.join_date" type="date"
              class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required />
          </div>
          <div>
            <label class="block text-gray-700 font-medium mb-2">
              <span class="text-red-500 font-bold">*</span>{{ $t('register.organizationName') }}:
            </label>
            <input v-model="formData.company_name" type="text"
              class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required />
          </div>
          <button type="submit"
            class="bg-blue-500 text-white py-3 px-4 rounded hover:bg-blue-600 transition duration-200 font-semibold">
            {{ $t('register.submit') }}
          </button>
          <button @click="goToLogin()"
            class="bg-red-500 text-white py-3 px-4 rounded hover:bg-red-600 transition duration-200 font-semibold">
            {{ $t('register.goBack') }}
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
import LoopingRhombusesSpinner from '../../modal/Loading.vue';

const { t } = useI18n();
const router = useRouter();

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
      alert(t('register.errorFillAllFields'));
      return;
    }
    isLoading.value = true;

    //check if the entered email address is already associated with an account in the database
    const doesAccountExist = await verifyAccount();
    console.log(doesAccountExist);
    isLoading.value = false;
    if(doesAccountExist) {
      duplicateEmail.value = true;
      isLoading.value = false;
      return;
    }

    // create Firebase user with form data and fetch post to add to backend
    await createUserFirebase();
    router.push({ path: `/employee` });
    alert(t('register.success'));

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
