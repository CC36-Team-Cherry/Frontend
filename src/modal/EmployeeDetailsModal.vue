<template>
  <div v-if="isVisible" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <div class="bg-white p-6 rounded shadow-lg max-w-4xl w-4/5 relative overflow-y-auto" style="max-height: 90%">
      <!-- Close Button -->
      <button @click="onClose" class="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
        ✕
      </button>

      <!-- Title -->
      <h2 class="text-2xl font-bold mb-6 text-center">{{ $t('employeeDetails.title') }}</h2>

      <!-- Modal Content -->
      <div>
        <!-- Account Info -->
        <div>
          <h3 class="text-lg text-center font-semibold mb-4">
            --- {{ $t('employeeDetails.accountInfo') }} ---
          </h3>
          <div class="space-y-3">
            <div>
              <label class="font-semibold block">{{ $t('employeeDetails.fields.firstName') }}</label>
              <input :disabled="!authStore.user.Privileges?.is_admin && !authStore.user.Privileges?.is_supervisor"
                type="text" v-model="formData.first_name" class="border w-full rounded px-2 py-1" />
            </div>
            <div>
              <label class="font-semibold block">{{ $t('employeeDetails.fields.lastName') }}</label>
              <input :disabled="!authStore.user.Privileges?.is_admin && !authStore.user.Privileges?.is_supervisor"
                type="text" v-model="formData.last_name" class="border w-full rounded px-2 py-1" />
            </div>
            <div>
              <label class="font-semibold block">{{ $t('employeeDetails.fields.email') }}</label>
              <input :disabled="!authStore.user.Privileges.is_admin && !authStore.user.Privileges.is_supervisor"
                type="email" v-model="formData.email" class="border w-full rounded px-2 py-1" />
            </div>
            <div>
              <label class="font-semibold block">{{ $t('employeeDetails.fields.dateOfBirth') }}</label>
              <input :disabled="!authStore.user.Privileges.is_admin && !authStore.user.Privileges.is_supervisor"
                type="date" v-model="formData.birthdate" class="border w-full rounded px-2 py-1" />
            </div>
            <div>
              <label class="font-semibold block">{{ $t('employeeDetails.fields.team') }}</label>
              <select v-if="authStore.user.Privileges.is_admin || authStore.user.Privileges.is_supervisor"
                v-model="formData.team_id" class="border rounded p-2 w-full">
                <option value="" disabled>{{ $t('employeeDetails.placeholders.selectTeam') }}</option>
                <option v-for="team in teams" :key="team.id" :value="team.id">{{ team.team_name }}</option>
                <option :value="null">No team</option>
              </select>
              <input v-else disabled :value="selectedTeamName" class="border w-full rounded px-2 py-1" />
            </div>
            <div>
              <label class="font-semibold block">{{ $t('employeeDetails.fields.supervisor') }}</label>
              <input 
                :disabled="!authStore.user.Privileges.is_admin && !authStore.user.Privileges.is_supervisor"
                v-model="supervisorSearch" 
                @input="filterSupervisors" 
                @focus="showDropdown = true" 
                type="text" 
                :placeholder="supervisorPlaceholder"
                class="border rounded p-2 w-ull">
              <button 
                v-if="formData.supervisor_id" 
                @click="clearSupervisor"
              >
                ✕
              </button>
              <ul v-if="showDropdown && filteredSupervisors.length > 0" ref="dropdown"
                class="border rounded mt-2 max-h-48 overflow-y-auto">
                <li v-for="supervisor in filteredSupervisors" :key="supervisor.id"
                  @click="selectedSupervisor(supervisor)" class="cursor-pointer hover:bg-gray-100 p-2">
                  {{ supervisor.first_name + " " + supervisor.last_name }}
                </li>
              </ul>
            </div>
            <div>
              <label class="font-semibold block">Role</label>
              <input :disabled="!authStore.user.Privileges.is_admin && !authStore.user.Privileges.is_supervisor"
                type="text" v-model="formData.role" class="border w-full rounded px-2 py-1" />
            </div>
            <div>
              <label class="font-semibold block">Join Date</label>
              <input :disabled="!authStore.user.Privileges.is_admin && !authStore.user.Privileges.is_supervisor"
                type="date" v-model="formData.join_date" class="border w-full rounded px-2 py-1" />
            </div>
            <div v-if="authStore.user.Privileges.is_admin || authStore.user.Privileges.is_supervisor">
              <label class="font-semibold block">Leave Date</label>
              <input :disabled="!authStore.user.Privileges.is_admin && !authStore.user.Privileges.is_supervisor"
                type="date" v-model="formData.leave_date" class="border w-full rounded px-2 py-1" />
            </div>
            <div v-if="authStore.user.Privileges.is_admin">
              <input type="checkbox" v-model="formData.is_supervisor"> Supervisor
              <input type="checkbox" v-model="formData.is_admin"> Admin
            </div>
          </div>
          <!-- Attendance Settings -->
          <div v-if="authStore.user.Privileges.is_admin || authStore.user.Privileges.is_supervisor">
            <h3 class="text-lg font-semibold text-center mb-4">
              --- {{ $t('employeeDetails.attendanceSettings') }} ---
            </h3>
            <div class="space-y-3">
              <div>
                <label class="font-semibold block">{{ $t('employeeDetails.fields.pto') }}</label>
                <input 
                  type="number" 
                  min="0"
                  v-model="formData.remaining_pto" 
                  :placeholder="employee.PTO?.remaining_pto || 0"
                  class="border w-full rounded px-2 py-1"
                  @input="validateRemainingPto" 
                />
              </div>
              <div>
                <label class="font-semibold block">{{ $t('employeeDetails.fields.specialHolidays') }}</label>
                <div>
                  <ul class="flex flex-col">
                    <li v-for="(specialPto, index) in specialPtos" :key="specialPto.id" class="flex justify-around">
                      <input v-if="editingSpecialPtoIndex === index" v-model="specialPtos[index].type"
                        @blur="stopEditing" @keyup.enter="stopEditing" />
                      <span v-else>
                        {{ specialPto.type }}</span>
                      <button @click="startEditingSpecialPto(index)" v-if="editingSpecialPtoIndex !== index"
                        class="border-2">
                        Edit
                      </button>
                      <button @click="deleteSpecialPto(specialPto.id)" class="border-2">
                        Delete
                      </button>
                    </li>
                  </ul>
                  <div class="flex justify-around">
                    <input v-model="newSpecialPto" type="text" placeholder="Enter Special PTO" class="border-2" />
                    <button @click="addSpecialPto" class="border-2" type="button">
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="flex justify-between mt-6">
        <button class="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600" @click="onSave">
          {{ $t('employeeDetails.buttons.save') }}
        </button>
        <button class="bg-red-500 text-white py-2 px-6 rounded hover:bg-red-600" @click="onDelete">
          {{ $t('employeeDetails.buttons.delete') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch, reactive, onMounted, toRaw, computed } from 'vue';
import { onClickOutside } from '@vueuse/core';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
axios.defaults.withCredentials = true;


const props = defineProps({
  employee: {
    type: Object,
    required: true,
  },
  teams: {
    type: Array,
    required: true,
  },
  isVisible: {
    type: Boolean,
    required: true,
  },
  supervisors: {
    type: Array,
    required: true,
  }
});

const selectedTeamName = computed(() => {
  if (!formData.team_id || !props.teams) return '';
  const selectedTeam = props.teams.find(team => team.id === formData.team_id);
  return selectedTeam ? selectedTeam.team_name : '';
});

const emit = defineEmits(['close', 'save', 'delete']);

const onClose = () => emit('close');
const onSave = () => emit('save', formData);
const onDelete = () => emit('delete');

const formData = reactive({
  first_name: '',
  last_name: '',
  email: '',
  birthdate: '',
  team: '',
  supervisor: '',
  remaining_pto: 0,
  special_holidays: '',
  role: '',
  join_date: '',
  leave_date: '',
  is_admin: false,
  is_supervisor: false,
  pto: 0,
  team_id: '',
  supervisor_id: '',
});

const specialPtos = ref([]);
const newSpecialPto = ref('');
// Track index of special pto being edited
const editingSpecialPtoIndex = ref(null);
const supervisorSearch = ref('');
const filteredSupervisors = ref([]);
const dropdown = ref(null);
const showDropdown = ref(false);

const apiUrl = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

const getSpecialPto = async () => {
  try {
    const response = await axios.get(`${apiUrl}/accounts/${props.employee.id}/specialPto`);
    specialPtos.value = response.data;
  } catch (err) {
    console.error('Error fetching special pto:', err);
  }
}

// Add new special PTO 
const addSpecialPto = async () => {
  try {
    // const newSpecialPto = newSpecialPto.value;
    const response = await axios.post(`${apiUrl}/accounts/${props.employee.id}/specialPto`,
      { content: newSpecialPto.value }
    );

    // TODO: Confirm if correct
    specialPtos.value.push({
      type: newSpecialPto.value, // The content of the new special PTO
    });

    console.log('New special pto saved', toRaw(response));

    // Reset input 
    newSpecialPto.value = '';

  } catch (err) {
    console.error(err);
  }
}

// Start editing and keep track of index of special pto editing
const startEditingSpecialPto = (index) => {
  editingSpecialPtoIndex.value = index;
};

// Save the edited special pto
const stopEditing = async () => {

  try {
    const specialPto = specialPtos.value[editingSpecialPtoIndex.value];
    const updatedSpecialPtoType = specialPto.type;
    console.log(specialPto)
    console.log("updatedspecialpto", updatedSpecialPtoType);


    const response = await axios.patch(`${apiUrl}/specialPto/${specialPto.id}`, {
      updatedSpecialPtoType
    });

    if (response.status === 200) {
      specialPtos.value[editingSpecialPtoIndex.value].type = updatedSpecialPtoType;
    }

    editingSpecialPtoIndex.value = null;

    console.log('Special pto edited', toRaw(response))

  } catch (err) {
    console.error(err);
  }
}

const deleteSpecialPto = async (specialPtoId) => {
  try {

    const originalSpecialPto = [...specialPtos.value];
    specialPtos.value = specialPtos.value.filter(specialPto => specialPto.id !== specialPtoId);

    const response = await axios.delete(`${apiUrl}/specialPto/${specialPtoId}`)

    if (response.status !== 200) {
      specialPtos.value = originalSpecialPto;
      console.error('Failed to delete the special pto');
    } else {
      console.error('Special pto delete successful');
    }

  } catch (err) {
    console.error(err);
  }
}

// filter supervisors in dropdown 
const filterSupervisors = () => {
  if (!supervisorSearch.value) {
    filteredSupervisors.value = props.supervisors;
  } else {
    filteredSupervisors.value = props.supervisors.filter((supervisor) => {
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
  const supervisor = props.supervisors.find(s => s.id === formData.supervisor_id);
  return supervisor ? `${supervisor.first_name} ${supervisor.last_name}` : "Select Supervisor";
});

const clearSupervisor = () => {
  formData.supervisor_id = '';  // Reset the supervisor ID
  supervisorSearch.value = '';   // Clear the input field
  filteredSupervisors.value = [];  // Clear the filtered supervisors list
  showDropdown.value = false;
  filterSupervisors();
};

// handle click outside of dropdown of supervisors
onClickOutside(dropdown, closeDropdown);

  const validateRemainingPto = () => {
    // Ensure that the value is a valid non-negative number
    let value = formData.remaining_pto;

    // Check if the value is a valid number and greater than or equal to zero
    if (value < 0 || isNaN(value)) {
      formData.remaining_pto = 0;  // Reset to 0 if it's invalid
    }
  }

onMounted(() => {
  formData.first_name = props.employee.first_name;
  formData.last_name = props.employee.last_name;
  formData.email = props.employee.email;
  formData.birthdate = new Date(props.employee.birthdate).toISOString().split('T')[0];
  formData.team = props.employee.team;
  formData.supervisor = props.employee.supervisor;
  formData.remaining_pto = Number(props.employee.PTO.remaining_pto);
  formData.special_holidays = props.employee.special_holidays;
  formData.role = props.employee.role;
  formData.join_date = new Date(props.employee.join_date).toISOString().split('T')[0];
  formData.is_admin = Boolean(props.employee.Privileges.is_admin);
  formData.is_supervisor = Boolean(props.employee.Privileges.is_supervisor);
  formData.team_id = props.employee.team_id;
  formData.supervisor_id = props.employee.supervisor_id;

  // Get special pto for selected user
  getSpecialPto();

  if (props.employee.leave_date) {
    formData.leave_date = new Date(props.employee.leave_date).toISOString().split('T')[0];
  }

  // Get special pto for selected user
  getSpecialPto();
  filterSupervisors();

  // if (props.employee.birthdate) {
  //   formData.dateOfBirth = props.employee.birthdate.split('T')[0];
  // }
  // if (props.employee.PTO.remaining_pto) {
  //   formData.pto = Number(props.employee.PTO.remaining_pto);
  // }
});
</script>
