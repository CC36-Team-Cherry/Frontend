<template>
  <div>
    <h1>Register Organization and Admin</h1>
    <form @submit.prevent="handleSubmit">
      <label>
        Admin Name:
        <input v-model="formData.adminName" type="text" required />
      </label>
      <br />
      <label>
        Admin Email:
        <input v-model="formData.adminEmail" type="email" required />
      </label>
      <br />
      <label>
        Admin Password:
        <input v-model="formData.adminPassword" type="password" required />
      </label>
      <br />
      <label>
        Organization Name:
        <input v-model="formData.organizationName" type="text" required />
      </label>
      <br />
      <label>
        Organization Details:
        <textarea v-model="formData.organizationDetails"></textarea>
      </label>
      <br />
      <button type="submit">Submit</button>
    </form>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const formData = ref({
  adminName: '',
  adminEmail: '',
  adminPassword: '',
  organizationName: '',
  organizationDetails: '',
});

const authStore = useAuthStore();

const handleSubmit = () => {
  authStore.setOrganization({
    name: formData.value.organizationName,
    details: formData.value.organizationDetails,
  });
};
</script>

