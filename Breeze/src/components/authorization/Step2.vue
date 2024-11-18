<template>
  <div>
    <h2>Step 2: Organization Detail</h2>
    <form @submit.prevent="submitForm">
      <label>
        Organization Name:
        <input v-model="organizationName" type="text" />
      </label>
      <label>
        Organization Name:
        <textarea v-model="organizationDetails"></textarea>
      </label>
      <button type="submit">Confirm</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';

defineProps<{ formData: { adminName: string; adminEmail: string; adminPassword: string } }>();

const organizationName = ref('');
const organizationDetails = ref('');

const emit = defineEmits<{
  (e: 'submit', data: { organizationName: string; organizationDetails: string }): void;
}>();

const submitForm = () => {
  emit('submit', {
    organizationName: organizationName.value,
    organizationDetails: organizationDetails.value,
  });
};
</script>
