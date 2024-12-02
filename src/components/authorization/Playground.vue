<template>
    <div>Welcome to the Firebase playground!</div>
    <div>Click this button to console.log your current user info!
        <button
            @click="checkLogin()"
            class="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
            Check if we're logged in?
        </button>
    </div>
    <div>Edit a password</div>
    <div>Edit an email</div>
    <div>Delete your own account</div>
    <div>Delete someone else's account?</div>
    <div>Check CSRF cookie
        <button
            @click="checkCookie()"
            class="ml-4 bg-yellow-500 text-white min-w-28 py-2 px-4 rounded hover:bg-yellow-600 transition duration-200"
        >
        Check CSRF cookie
        </button>
    </div>
    <div>Logout
        <button
            @click="logoutFirebase()"
            class="ml-4 bg-red-500 text-white min-w-28 py-2 px-4 rounded hover:bg-red-600 transition duration-200"
        >
            {{ $t('Logout') }}
        </button>
    </div>
</template>


<script setup lang="ts">

import { getAuth, signOut } from 'firebase/auth';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

function getCookie(name: string) {
  const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
  return v ? v[2] : null;
}

const checkCookie = () => {
    const cookie = getCookie('csrfToken');
    console.log(cookie);
}

const logoutFirebase = () => {
    signOut(getAuth()).then(() => {
      authStore.logout();
      window.location.href = '/login';
    }).catch((error) => {
    // An error happened.
    });
  };

  const checkLogin = () => {
    console.log(getAuth().currentUser);
  }

</script>