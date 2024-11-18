<template>
  <div>
    <h1>Registration Organization</h1>
    <div v-if="currentStep === 1">
      <Step1 @next="handleNextStep" />
    </div>
    <div v-if="currentStep === 2">
      <Step2 :form-data="formData" @submit="handleSubmit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Step1 from './Step1.vue';
import Step2 from './Step2.vue';
import { useAuthStore } from '@/stores/authStore';

const currentStep = ref(1);
const formData = ref({
  adminName: '',
  adminEmail: '',
  adminPassword: '',
  organizationName: '',
  organizationDetails: '',
});

const authStore = useAuthStore();

const handleNextStep = (data: Partial<typeof formData.value>) => {
  Object.assign(formData.value, data);
  currentStep.value++;
};

const handleSubmit = () => {
  authStore.setOrganization({
    name: formData.value.organizationName,
    details: formData.value.organizationDetails,
  });
  console.log('Registrazione completata:', formData.value);
};
</script>
