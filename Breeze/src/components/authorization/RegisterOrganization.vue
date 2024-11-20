<template>
  <div class="flex justify-center items-center h-screen bg-gray-100">
    <div class="bg-white p-8 rounded shadow-md w-full max-w-lg">
      <h1 class="text-2xl font-bold mb-6 text-gray-800">{{ $t('register.title') }}</h1>
      <form @submit.prevent="handleSubmit" class="flex flex-col space-y-4">
        <div>
          <label class="block text-gray-700 font-medium mb-2">
            {{ $t('register.adminName') }}:
          </label>
          <input
            v-model="formData.adminName"
            type="text"
            class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
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
            {{ $t('register.organizationName') }}:
          </label>
          <input
            v-model="formData.organizationName"
            type="text"
            class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label class="block text-gray-700 font-medium mb-2">
            {{ $t('register.organizationDetails') }}:
          </label>
          <textarea
            v-model="formData.organizationDetails"
            class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          ></textarea>
        </div>
        <button
          @click="createUserFirebase()"
          type="submit"
          class="bg-blue-500 text-white py-3 px-4 rounded hover:bg-blue-600 transition duration-200 font-semibold"
        >
          {{ $t('register.submit') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/authStore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/init.ts';

const { t } = useI18n(); 


const formData = ref({
  adminName: '',
  adminEmail: '',
  adminPassword: '',
  organizationName: '',
  organizationDetails: '',
});


const authStore = useAuthStore();


const handleSubmit = () => {
  
  // if (
  //   !formData.value.adminName ||
  //   !formData.value.adminEmail ||
  //   !formData.value.adminPassword ||
  //   !formData.value.organizationName
  // ) {
  //   alert(t('register.errorFillAllFields')); 
  //   return;
  // }

  
  // authStore.setOrganization({
  //   name: formData.value.organizationName,
  //   details: formData.value.organizationDetails,
  // });

  // console.log('Registration completed:', formData.value);
  // alert(t('register.success'));
};

const createUserFirebase = () => {
  const email = formData.value.adminEmail;
  const password = formData.value.adminPassword;

  createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed up 
    //const user = userCredential.user;
    // User will be logged in automatically if account is successfully created
    window.location.href = '/logintest';
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorCode, errorMessage);
  });
};

</script>

