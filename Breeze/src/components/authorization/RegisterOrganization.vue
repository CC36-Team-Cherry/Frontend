<template>
  <div>
    <h1>{{ $t('register.title') }}</h1>
    <form @submit.prevent="handleSubmit">
      <label>
        {{ $t('register.adminName') }}:
        <input v-model="formData.adminName" type="text" required />
      </label>
      <br />
      <label>
        {{ $t('login.email') }}:
        <input v-model="formData.adminEmail" type="email" required />
      </label>
      <br />
      <label>
        {{ $t('login.password') }}:
        <input v-model="formData.adminPassword" type="password" required />
      </label>
      <br />
      <label>
        {{ $t('register.organizationName') }}:
        <input v-model="formData.organizationName" type="text" required />
      </label>
      <br />
      <label>
        {{ $t('register.organizationDetails') }}:
        <textarea v-model="formData.organizationDetails"></textarea>
      </label>
      <br />
      <button type="submit">{{ $t('register.submit') }}</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/authStore';

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
  
  if (
    !formData.value.adminName ||
    !formData.value.adminEmail ||
    !formData.value.adminPassword ||
    !formData.value.organizationName
  ) {
    alert(t('register.errorFillAllFields')); 
    return;
  }

  
  authStore.setOrganization({
    name: formData.value.organizationName,
    details: formData.value.organizationDetails,
  });

  console.log('Registration completed:', formData.value);
  alert(t('register.success'));
};
</script>

