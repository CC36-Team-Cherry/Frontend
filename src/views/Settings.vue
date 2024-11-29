<template>
  <div class="p-8 bg-gray-50 min-h-screen">
    <h1 class="text-2xl font-bold mb-6">{{ $t('settings.title') }}</h1>
    <div class="grid grid-cols-2 gap-6">
      <div class="flex flex-col">
        <label class="font-medium">{{ $t('settings.fields.firstName') }}</label>
        <input type="text" v-model="formData.first_name" class="border rounded p-2" />
      </div>
      <div class="flex flex-col">
        <label class="font-medium">{{ $t('settings.fields.lastName') }}</label>
        <input type="text" v-model="formData.last_name" class="border rounded p-2" />
      </div>
      <div class="flex flex-col">
        <label class="font-medium">{{ $t('settings.fields.email') }}</label>
        <input type="email" v-model="formData.email" class="border rounded p-2" />
      </div>
      <div class="flex flex-col">
        <label class="font-medium">{{ $t('settings.fields.dateOfBirth') }}</label>
        <input type="date" v-model="formData.birthdate" class="border rounded p-2" />
      </div>
      <div class="flex flex-col">
        <label class="font-medium">{{ $t('settings.fields.team') }}</label>
        <input type="text" v-model="formData.team" class="border rounded p-2" />
      </div>
      <div class="flex flex-col">
        <label class="font-medium">{{ $t('settings.fields.defaultSupervisor') }}</label>
        <input type="text" v-model="formData.supervisor" class="border rounded p-2" />
      </div>
      <div class="flex flex-col">
        <label class="font-medium">{{ $t('settings.fields.role') }}</label>
        <input type="text" v-model="formData.role" class="border rounded p-2" />
      </div>
      <div class="flex flex-col">
        <label class="font-medium">{{ $t('settings.fields.joinDate') }}</label>
        <input type="date" v-model="formData.join_date" class="border rounded p-2" />
      </div>
      <div class="flex flex-col">
        <label class="font-medium">{{ $t('settings.fields.type') }}</label>
        <select v-model="formData.type" class="border rounded p-2">
          <option value="User">{{ $t('settings.user') }}</option>
          <option value="Admin">{{ $t('settings.admin') }}</option>
        </select>
      </div>
      <div class="flex flex-col">
        <label class="font-medium">{{ $t('settings.fields.languagePreference') }}</label>
        <div class="flex space-x-2 mt-2">
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
      </div>
    </div>
    <div class="mt-8">
      <button @click="saveSettings" class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
        {{ $t('settings.save') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import axios from 'axios';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/authStore';

const apiUrl = import.meta.env.VITE_API_URL;

const authStore = useAuthStore();

const { locale } = useI18n();

const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  birthdate: '',
  team: '',
  supervisor: '',
  role: '',
  join_date: '',
  type: '',
  language_preference: 'en',
});

async function handleFetchCurrentUserData() {
  try {
    const response = await axios.get(`${apiUrl}/accounts/${authStore.user.id}/details`);
    if (response.status === 200) {
      await Object.assign(formData, {
        ...formData,
        ...response.data,
      });
      console.log(formData);
    } else {
      console.error('Server error.')
    }
  } catch (err) {
    console.error('Error fetching user data:', err);
  }
}

const switchLanguage = (lang) => {
  locale.value = lang;
};

const saveSettings = () => {
  console.log('Settings saved:', formData.value);
  alert('Settings saved successfully!');
};

onMounted(() => {
  handleFetchCurrentUserData();
})
</script>