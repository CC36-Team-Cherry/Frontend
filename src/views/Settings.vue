<template>
    <div class="p-8 bg-gray-50 min-h-screen">
      <h1 class="text-2xl font-bold mb-6">{{ $t('settings.title') }}</h1>
      <div class="grid grid-cols-2 gap-6">
        <div class="flex flex-col">
          <label class="font-medium">{{ $t('settings.fields.firstName') }}</label>
          <input
            type="text"
            v-model="formData.firstName"
            class="border rounded p-2"
          />
        </div>
        <div class="flex flex-col">
          <label class="font-medium">{{ $t('settings.fields.lastName') }}</label>
          <input
            type="text"
            v-model="formData.lastName"
            class="border rounded p-2"
          />
        </div>
        <div class="flex flex-col">
          <label class="font-medium">{{ $t('settings.fields.email') }}</label>
          <input
            type="email"
            v-model="formData.email"
            class="border rounded p-2"
          />
        </div>
        <div class="flex flex-col">
          <label class="font-medium">{{ $t('settings.fields.dateOfBirth') }}</label>
          <input
            type="date"
            v-model="formData.dateOfBirth"
            class="border rounded p-2"
          />
        </div>
        <div class="flex flex-col">
          <label class="font-medium">{{ $t('settings.fields.team') }}</label>
          <input
            type="text"
            v-model="formData.team"
            class="border rounded p-2"
          />
        </div>
        <div>
            <label class="block mb-1">{{ "Supervisor" }}</label>
            <input 
              v-model="supervisorSearch" 
              @input="filterSupervisors"
              type="text"
              placeholder="Select Supervisor"
              class="border rounded p-2 w-full"
            >
            <button 
                v-if="formData.supervisor_id" 
                @click="clearSupervisor" 
              >
                ✕
              </button>
            <ul v-if="filteredSupervisors.length > 0" ref="dropdown" class="border rounded mt-2 max-h-48 overflow-y-auto">
              <li
                v-for="supervisor in filteredSupervisors"
                :key="supervisor.id"
                @click="selectedSupervisor(supervisor)"
                class="cursor-pointer hover:bg-gray-100 p-2"
              >
                {{ supervisor.first_name + " " + supervisor.last_name }}
              </li>
            </ul>
          </div>
        <div class="flex flex-col">
          <label class="font-medium">{{ $t('settings.fields.role') }}</label>
          <input
            type="text"
            v-model="formData.role"
            class="border rounded p-2"
          />
        </div>
        <div class="flex flex-col">
          <label class="font-medium">{{ $t('settings.fields.joinDate') }}</label>
          <input
            type="date"
            v-model="formData.joinDate"
            class="border rounded p-2"
          />
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
            <button
              @click="switchLanguage('en-US')"
              :class="locale === 'en-US' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'"
              class="py-1 px-3 rounded hover:bg-blue-600 transition duration-200"
            >
              {{ $t('language.en') }}
            </button>
            <button
              @click="switchLanguage('ja-JP')"
              :class="locale === 'ja-JP' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'"
              class="py-1 px-3 rounded hover:bg-blue-600 transition duration-200"
            >
              {{ $t('language.jp') }}
            </button>
          </div>
        </div>
      </div>
      <div class="mt-8">
        <button
          @click="saveSettings"
          class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          {{ $t('settings.save') }}
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { onClickOutside } from '@vueuse/core';
  import axios from 'axios';
  
  const { locale } = useI18n(); 

  const apiUrl = import.meta.env.VITE_API_URL;
  
  const fetchedSupervisors = ref([]);
  const supervisorSearch = ref('');
  const filteredSupervisors = ref([]);
  const dropdown = ref(null);

  const formData = ref({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    team: '',
    supervisor: '',
    role: '',
    joinDate: '',
    type: '',
    languagePreference: 'en',
  });
  
  const switchLanguage = (lang) => {
    locale.value = lang; 
  };
  
  const saveSettings = () => {
    console.log('Settings saved:', formData.value);
    alert('Settings saved successfully!');
  };

  // get all supervisors
  const fetchSupervisors = async () => {
      try {
        const response = await axios.get(`${apiUrl}/supervisors`);
        console.log(response.data)
        fetchedSupervisors.value = response.data.filter(supervisor => supervisor.id !== authStore.user.id); 
      } catch (err) {
        console.error('Error fetching supervisors:', err);
      }
    }

  // filter supervisors in dropdown 
  const filterSupervisors = () => {
      if (!supervisorSearch.value) {
        filteredSupervisors.value = fetchedSupervisors.value;
      } else {
          filteredSupervisors.value = fetchedSupervisors.value.filter((supervisor) => {
          const fullName = (supervisor.first_name + " " + supervisor.last_name).toLowerCase();
          return fullName.includes(supervisorSearch.value.toLowerCase());
      });
    }
  }

  // function to select a supervisor from filtered list
  const selectedSupervisor = (supervisor) => {
    formData.supervisor_id = supervisor.id;
    supervisorSearch.value = `${supervisor.first_name} ${supervisor.last_name}`;
    filteredSupervisors.value = [];
  }

  const closeDropdown = () => {
    filteredSupervisors.value = [];  // Close the dropdown by clearing the filtered list
  };

  // handle click outside of dropdown of supervisors
  onClickOutside(dropdown, closeDropdown);

  const clearSupervisor = () => {
    formData.supervisor_id = '';  // Reset the supervisor ID
    supervisorSearch.value = '';   // Clear the input field
    filteredSupervisors.value = [];  // Clear the filtered supervisors list
  };

  onMounted(() => {
  fetchSupervisors();
})
  </script>
  
  