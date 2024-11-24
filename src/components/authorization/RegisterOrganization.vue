<template>
  <div class="flex justify-center items-center bg-gray-100">
    <div class="bg-white p-8 rounded shadow-md w-full max-w-lg">
      <h1 class="text-2xl font-bold mb-6 text-gray-800">{{ $t('register.title') }}</h1>
      <form @submit.prevent="handleSubmit" class="flex flex-col space-y-4">
        <div>
          <label class="block text-gray-700 font-medium mb-2">
            {{ $t('login.email') }}:
          </label>
          <input
            v-model="formData.adminEmail"
            type="email"
            class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label class="block text-gray-700 font-medium mb-2">
            {{ $t('login.password') }}:
          </label>
          <input
            v-model="formData.adminPassword"
            type="password"
            class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label class="block text-gray-700 font-medium mb-2">
            {{ $t('register.firstName') }}:
          </label>
          <input
            v-model="formData.adminFirstName"
            type="text"
            class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label class="block text-gray-700 font-medium mb-2">
            {{ $t('register.lastName') }}:
          </label>
          <input
            v-model="formData.adminLastName"
            type="text"
            class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label class="block text-gray-700 font-medium mb-2">
            {{ $t('employeeDetails.fields.dateOfBirth') }}:
          </label>
          <input
            v-model="formData.adminDateOfBirth"
            type="date"
            class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label class="block text-gray-700 font-medium mb-2">
            {{ $t('settings.fields.role') }}:
          </label>
          <input
            v-model="formData.adminRole"
            type="text"
            class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label class="block text-gray-700 font-medium mb-2">
            {{ $t('settings.fields.joinDate') }}:
          </label>
          <input
            v-model="formData.adminJoinDate"
            type="date"
            class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label class="block text-gray-700 font-medium mb-2">
            {{ $t('register.organizationName') }}:
          </label>
          <input
            v-model="formData.organizationName"
            type="text"
            class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <button
          @click="handleSubmit()"
          type="submit"
          class="bg-blue-500 text-white py-3 px-4 rounded hover:bg-blue-600 transition duration-200 font-semibold"
        >
          {{ $t('register.submit') }}
        </button>
        <button
          @click="goToLogin()"
          class="bg-red-500 text-white py-3 px-4 rounded hover:bg-red-600 transition duration-200 font-semibold"
        >
        {{ $t('register.goBack') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRaw, reactive } from 'vue';
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/authStore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig.ts'
import axios from 'axios';

const { t } = useI18n(); 
const router = useRouter();

// TODO: add active account state to track log in after registration, or set from login and update when register
// export const activeAccount = reactive({
//   id: , 
//   organizationId: ,
// });

const apiUrl = import.meta.env.VITE_API_URL;

const formData = ref({
  adminEmail: '',
  adminPassword: '',
  adminFirstName: '',
  adminLastName: '',
  adminDateOfBirth: '',
  adminRole: '',
  adminJoinDate: '',
  organizationName: '',
});

const goToLogin = () => {
  router.push({ path: `/login` });
}

const authStore = useAuthStore();

const handleSubmit = async () => {
  try {

    if (
      !formData.value.adminEmail ||
      !formData.value.adminPassword ||
      !formData.value.adminFirstName ||
      !formData.value.adminLastName ||
      !formData.value.adminDateOfBirth ||
      !formData.value.adminRole ||
      !formData.value.adminJoinDate ||
      !formData.value.organizationName
  ) {
    alert(t('register.errorFillAllFields')); 
    return;
  }

    // create user with form data
    createUserFirebase();

    // convert reactive object to raw object to pass to backend
    const adminData = toRaw(formData.value);

    await axios.post(`${apiUrl}/registration`, {
      adminData
    },
    {
      withCredentials: true,
    })

    console.log('Frontend - Registration completed:', formData.value);
    alert(t('register.success'));

  } catch(err) {
    console.error(err);
  }
  
  /*authStore.setOrganization({
    name: formData.value.organizationName,
    details: formData.value.organizationDetails,
  });*/

};

const createUserFirebase = () => {
  const email = formData.value.adminEmail;
  const password = formData.value.adminPassword;

  createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    console.log(user.uid);
    // User will be logged in automatically if account is successfully created
    router.push({ path: `/employee` });
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorCode, errorMessage);
  });
};

</script>

