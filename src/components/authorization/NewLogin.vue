<template>
    <div class="flex justify-center items-center h-screen bg-gray-100">
      <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 class="text-2xl font-bold mb-4">{{ $t('login.title') }}</h2>
        <form @submit.prevent="handleLogin" class="flex flex-col space-y-4">
          <div>
            <label for="password" class="block text-gray-700">
              {{ $t('login.password') }}:
            </label>
            <input
              type="password"
              id="password"
              v-model="newPassword"
              class="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label for="password" class="block text-gray-700">
            Confirm {{ $t('login.password') }}:
            </label>
            <input
              type="password"
              id="password"
              v-model="confirmNewPassword"
              class="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <button
            @click="handleResetPassword()"
            type="submit"
            class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
          Confirm
          </button>
        </form>
      </div>
    </div>
  </template>
  
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/authStore';
  import { verifyPasswordResetCode, confirmPasswordReset, signInWithEmailAndPassword } from "firebase/auth";
  import { auth } from '../../firebase/firebaseConfig.ts'
  
  const email = ref('')
  const newPassword = ref('');
  const confirmNewPassword = ref('');
  const authStore = useAuthStore();
  const router = useRouter();

  let accountEmail = '';
  
  const handleLogin = () => {
    //authStore.login({ name: 'name', email: email.value });
  };

  function getParameterByName(name: string) {    
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    const regexS = "[\\?&]"+name+"=([^&#]*)";
    const regex = new RegExp(regexS);
    const results = regex.exec(window.location.href);
    if (!results) {
      return "";
    } else {
      return decodeURIComponent(results[1].replace(/\+/g, " "));
    }
  }

  const handleResetPassword = () => {
    const actionCode = getParameterByName('oobCode');
    verifyPasswordResetCode(auth, actionCode)
    .then((email) => {
      accountEmail = email;
      confirmPasswordReset(auth, actionCode, newPassword.value)
      .then((res) => {
        loginFirebase();
      })
      .catch((error) => {
        console.log(error.code, error.message);
      });
    })
    .catch((error) => {
      console.log(error.code, error.message);
    });
  }

  // const validatePasswords = () => {
  //   if (newPassword.value !== confirmNewPassword.value) {
  //     return false
  //   }
  // }
  
  const loginFirebase = () => {
    signInWithEmailAndPassword(auth, accountEmail, newPassword.value)
    .then((userCredential) => {
      // Signed in 
      router.push({ path: `/calendar` });
    })
    .catch((error) => {
      console.log(error.code, error.message);
    });
  }
  
  </script>
  