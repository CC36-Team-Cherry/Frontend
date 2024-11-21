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
    <div>Logout
        <button
            @click="logoutFirebase"
            class="ml-4 bg-red-500 text-white min-w-28 py-2 px-4 rounded hover:bg-red-600 transition duration-200"
        >
            {{ $t('Logout') }}
        </button>
    </div>
</template>


<script setup lang="ts">

import { getAuth, signOut } from "firebase/auth";

const logoutFirebase = () => {
    signOut(getAuth()).then(() => {
      // Sign-out successful.
      window.location.href = '/login';
    }).catch((error) => {
    // An error happened.
    });
  };

  const checkLogin = () => {
    console.log(getAuth().currentUser);
  }

</script>