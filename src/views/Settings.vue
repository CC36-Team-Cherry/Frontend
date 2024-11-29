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
        <input type="date" v-model="formData.birthdate.split('T')[0]" class="border rounded p-2" />
      </div>
      <div>
        <label class="block mb-1">{{ $t('settings.fields.team') }}</label>
        <select v-if="authStore.user.Privileges.is_admin" v-model="formData.team_id" class="border rounded p-2 w-full">
          <option value="" disabled>{{ $t('employeeDetails.placeholders.selectTeam') }}</option>
          <option v-for="team in fetchedTeams" :key="team.id" :value="team.id">
            {{ team.team_name }}
          </option>
        </select>

        <!-- Display as a disabled text input if the user is not an admin -->
        <input v-else type="text" class="border rounded p-2 w-full bg-gray-100 text-gray-500 cursor-not-allowed"
          :value="(fetchedTeams.find(team => team.id === formData.team_id)?.team_name) || 'no team'" disabled />
        <!-- <label class="block mb-1">{{ $t('settings.fields.team') }}</label>
        <select v-model="formData.team_id" class="border rounded p-2 w-full" :disabled="!authStore.user.Privileges.is_admin">
          <option value="" disabled>{{ $t('employeeDetails.placeholders.selectTeam') }}</option>
          <option v-for="team in fetchedTeams" :key="team.id" :value="team.id">{{ team.team_name }}</option>
        </select> -->
      </div>
      <div class="flex flex-col">
        <label class="font-medium">{{ $t('settings.fields.defaultSupervisor') }}</label>
        <input type="text" v-model="formData.supervisor" class="border rounded p-2" />
      </div>
      <div class="flex flex-col">
        <label class="font-medium">{{ $t('settings.fields.role') }}</label>
        <input type="text" v-model="formData.role" class="border rounded p-2"
          :disabled="!authStore.user.Privileges.is_admin" />
      </div>
      <div class="flex flex-col">
        <label class="font-medium">{{ $t('settings.fields.joinDate') }}</label>
        <input type="date" v-model="formData.join_date.split('T')[0]" class="border rounded p-2" />
      </div>
      <div v-if="authStore.user.Privileges.is_admin" class="flex flex-col">
        <label class="font-medium">{{ 'Privileges' }}</label>
        <input type="checkbox" v-model="formData.is_supervisor" />{{ $t('employeeList.modal.userType.supervisor') }}
        <input type="checkbox" v-model="formData.is_admin" />{{ $t('employeeList.modal.userType.admin') }}
      </div>
      <div v-else>
        <label class="font-medium">{{ 'Privileges' }}</label>
        <p>{{ authStore.user.Privileges.is_supervisor ? 'Supervisor' : 'None' }}</p>
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
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/authStore';

const apiUrl = import.meta.env.VITE_API_URL;

const authStore = useAuthStore();

const { locale } = useI18n();

const fetchedTeams = ref([]);

const formData = reactive({
  first_name: '',
  last_name: '',
  email: '',
  birthdate: '',
  team_id: '',
  supervisor: '',
  role: '',
  join_date: '',
  is_admin: '',
  is_supervisor: '',
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

const handleFetchTeams = async () => {
  try {
    const response = await axios.get(`${apiUrl}/organizations/${authStore.user.company_id}/teams`);
    fetchedTeams.value = response.data;
  } catch (err) {
    console.error('Error fetching teams:', err);
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
  handleFetchTeams();
})
</script>