<template>
  <LoopingRhombusesSpinner v-if="isLoading" class="bg-gray-100" />
  <div v-else class="p-8 bg-gray-50 min-h-screen">
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
        <input v-else type="text" class="border rounded p-2 w-full bg-gray-100 text-gray-500"
          :value="(fetchedTeams.find(team => team.id === formData.team_id)?.team_name) || 'no team'" disabled />
      </div>
      <div>
            <label class="block mb-1">{{ $t('employeeList.modal.userType.supervisor') }}</label>
            <input 
              v-model="supervisorSearch" 
              @input="filterSupervisors"
              @focus="showDropdown = true"
              type="text"
              :placeholder="supervisorPlaceholder"
              class="border rounded p-2 w-11/12"
            >
            <button 
                v-if="formData.supervisor_id" 
                @click="clearSupervisor" 
                class="border rounded p-2 bg-gray-50 w-1/12"
              >
                ✕
              </button>
            <ul v-if="showDropdown && filteredSupervisors.length > 0" ref="dropdown" class="border rounded mt-2 max-h-48 overflow-y-auto">
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
        <input type="text" v-model="formData.role" class="border rounded p-2"/>
      </div>
      <div class="flex flex-col">
        <label class="font-medium">{{ $t('settings.fields.joinDate') }} </label>
        <input type="date" v-model="formData.join_date.split('T')[0]" class="border rounded p-2"  :disabled="!authStore.user.Privileges.is_admin" />
      </div>
      <div v-if="authStore.user.Privileges.is_admin" class="flex flex-col">
        <label class="font-medium">{{ $t('employeeList.tableHeaders.privileges') }}</label>
        <div class="flex items-center space-x-2 text left">
          <input type="checkbox" v-model="formData.is_supervisor" class="scale-150 m-5" />{{ $t('employeeList.modal.userType.supervisor') }}
        </div>
        <div class="flex items-center space-x-2 text left">
          <input type="checkbox" v-model="formData.is_admin" class="scale-150 m-5" />{{ $t('employeeList.modal.userType.admin') }}
        </div>
      </div>
      <div v-else>
        <label class="font-medium">{{ $t('employeeList.tableHeaders.privileges') }}</label>
        <input type="text" class="border rounded p-2 w-full bg-gray-100 text-gray-500" disabled
          :value="authStore.user.Privileges.is_supervisor ? 'Supervisor' : 'None'" />
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
      <button @click="handleSave" class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
        {{ $t('settings.save') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import axios from 'axios';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/authStore';
import { onClickOutside } from '@vueuse/core';
import LoopingRhombusesSpinner from '@/components/Loading.vue';
import { useToast } from "vue-toastification";

const toast = useToast();
const { t } = useI18n();
const apiUrl = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;
const fetchedSupervisors = ref([]);
const supervisorSearch = ref('');
const filteredSupervisors = ref([]);
const dropdown = ref(null);
const showDropdown = ref(false);
const isLoading = ref(false);

const authStore = useAuthStore();
const activeCompanyId = authStore.user.company_id;

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
  supervisor_id: '',
});

async function handleFetchCurrentUserData() {
  try {
    const response = await axios.get(`${apiUrl}/accounts/${authStore.user.id}/details`);
    if (response.status === 200) {
      await Object.assign(formData, {
        ...formData,
        ...response.data,
      });
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
  formData.language_preference = lang.substring(0, 2);
  authStore.user.language_preference = lang.substring(0, 2);
  locale.value = lang;
};

 // get all supervisors
 const fetchSupervisors = async () => {
      try {
        const response = await axios.get(`${apiUrl}/organizations/${activeCompanyId}/supervisors`);
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
    showDropdown.value = false;
  }

  const closeDropdown = () => {
    filteredSupervisors.value = [];  // Close the dropdown by clearing the filtered list
    showDropdown.value = false;
    filterSupervisors();
  };
  
  const supervisorPlaceholder = computed(() => {
      // If a supervisor is selected, show their full name, otherwise default to "Select Supervisor"
      const supervisor = fetchedSupervisors.value.find(s => s.id === formData.supervisor_id);
      return supervisor ? `${supervisor.first_name} ${supervisor.last_name}` : t('employeeList.modal.placeholders.supervisor');
    }
  );
  
  const clearSupervisor = () => {
    formData.supervisor_id = '';  // Reset the supervisor ID
    supervisorSearch.value = '';   // Clear the input field
    filteredSupervisors.value = [];  // Clear the filtered supervisors list
    showDropdown.value = false;
    filterSupervisors();
  };
  
  // handle click outside of dropdown of supervisors
  onClickOutside(dropdown, closeDropdown);

const handleSave = async () => {
  try {
    isLoading.value = true;
    const employeeId = authStore.user.id;
    const cleanedUpdates = Object.fromEntries(
      Object.entries(formData).filter(([key, value]) => {
        // Only include key-value pairs where value is not empty, null, undefined, or whitespace
        return (
          value !== "" &&
          value !== null &&
          value !== undefined &&
          (typeof value === "string" ? value.trim() !== "" : true)
        );
      })
    );
    cleanedUpdates.join_date = new Date(cleanedUpdates.join_date);
    cleanedUpdates.birthdate = new Date(cleanedUpdates.birthdate);
    authStore.user.supervisor_id = cleanedUpdates.supervisor_id;
    const response = await axios.patch(`${apiUrl}/accounts/${employeeId}`, cleanedUpdates);
    if (response.status === 200) {
      isLoading.value = false;
      toast.success(t('settings.updateSuccess'));
      handleFetchCurrentUserData();
    } else {
      isLoading.value = false;
      toast.error(t('settings.updateFail'));
    }
  } catch (err) {
    isLoading.value = false;
    console.error("Error updating employee: ", err);
    toast.error(t('settings.updateFail'));
  }
}

onMounted(async () => {
  isLoading.value = true;
  await handleFetchCurrentUserData();
  await handleFetchTeams();
  await fetchSupervisors();
  filterSupervisors();
  isLoading.value = false;
})
</script>