<template>
  <LoopingRhombusesSpinner v-if="isLoading"/>
  <div v-else class="bg-white shadow p-4 rounded">
    <div class="flex justify-between items-center mb-4">
      <input type="text" :placeholder="$t('employeeList.searchPlaceholder')" v-model="searchTerm"
        class="border rounded p-2 w-1/2" />
      <button v-if="authStore.Privileges?.is_admin || authStore.user.Privileges?.is_supervisor"
        @click="openAddUserModal" class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
        {{ $t('employeeList.addUser') }}
      </button>
    </div>
    <table class="w-full border-collapse border border-gray-300">
      <thead class="bg-gray-200">
        <tr>
          <th class="border p-2">{{ $t('employeeList.tableHeaders.name') }}</th>
          <th class="border p-2">{{ $t('employeeList.tableHeaders.team') }}</th>
          <th class="border p-2">{{ $t('employeeList.tableHeaders.role') }}</th>
          <th class="border p-2">{{ $t('employeeList.tableHeaders.joinDate') }}</th>
          <th class="border p-2">{{ $t('employeeList.tableHeaders.lastDate') }}</th>
          <th class="border p-2">{{ $t('employeeList.tableHeaders.privileges') }}</th>
          <th v-if="authStore.Privileges?.is_admin || authStore.user.Privileges?.is_supervisor" class="border p-2">Last
            Login</th>
          <th class="border p-2">{{ $t('employeeList.tableHeaders.email') }}</th>
          <th v-if="authStore.Privileges?.is_admin || authStore.user.Privileges?.is_supervisor" class="border p-2">{{
            $t('employeeList.tableHeaders.att') }}</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="filteredEmployees.length > 0">
          <tr v-for="employee in filteredEmployees" :key="employee.id" @click="openEmployeeDetailsModal(employee)"
            class="cursor-pointer hover:bg-gray-100">
            <td class="border p-2">{{ employee.first_name + ' ' + employee.last_name }}</td>
            <td class="border p-2">{{ employee.team ? employee.team.team_name : 'no team' }}</td>
            <td class="border p-2">{{ employee.role }}</td>
            <td class="border p-2">{{ employee.join_date.split('T')[0] }}</td>
            <td class="border p-2">{{ employee.leave_date || 'NA' }}</td>
            <td class="border p-2">
              {{
                employee.Privileges.is_admin && employee.Privileges.is_supervisor
                  ? 'Admin,\nSupervisor'
                  : employee.Privileges.is_admin
                    ? 'Admin'
                    : employee.Privileges.is_supervisor
                      ? 'Supervisor'
                      : 'none'
              }}
            </td>
            <td v-if="authStore.Privileges?.is_admin || authStore.user.Privileges?.is_supervisor" class="border p-2">{{ employee.last_login ? employee.last_login.split('T')[0] : 'Invite Sent' }}</td>
            <td class="border p-2">{{ employee.email }}</td>
            <td v-if="authStore.Privileges?.is_admin || authStore.user.Privileges?.is_supervisor" class="border p-2">
              <button class="bg-green-500 text-white px-2 py-1 rounded" @click.stop="openCalendarModal(employee)">
                {{ $t('employeeList.view') }}
              </button>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
    <!-- Modal for Adding User -->
    <Modal :isVisible="isAddUserModalVisible" @close="closeAddUserModal">
      <h2 class="text-xl font-bold mb-4">{{ $t('employeeList.modal.modalTitle') }}</h2>
      <form>
        <div>
          <div>
            <label class="block mb-1">{{ $t('employeeList.modal.fields.firstName') }}</label>
            <input type="text" v-model="formData.first_name" class="border rounded p-2 w-full" />
          </div>
          <div>
            <label class="block mb-1">{{ $t('employeeList.modal.fields.lastName') }}</label>
            <input type="text" v-model="formData.last_name" class="border rounded p-2 w-full" />
          </div>
          <div>
            <label class="block mb-1">{{ $t('employeeList.modal.fields.email') }}</label>
            <input type="email" v-model="formData.email" class="border rounded p-2 w-full" />
          </div>
          <div>
            <label class="block mb-1">{{ $t('employeeList.modal.fields.dateOfBirth') }}</label>
            <input type="date" v-model="formData.birthdate" class="border rounded p-2 w-full" />
          </div>
          <div>
            <label class="block mb-1">{{ $t('employeeList.modal.fields.team') }}</label>
            <select v-model="formData.team_id" class="border rounded p-2 w-full">
              <option value="" disabled>{{ $t('employeeDetails.placeholders.selectTeam') }}</option>
              <option v-for="team in fetchedTeams" :key="team.id" :value="team.id">{{ team.team_name }}</option>
            </select>
          </div>
          <div>
            <label class="block mb-1">{{ "Supervisor" }}</label>
            <input v-model="supervisorSearch" @input="filterSupervisors" @focus="showDropdown = true" type="text" placeholder="Select Supervisor"
              class="border rounded p-2 w-full">
            <button
              v-if="formData.supervisor_id"
              @click="clearSupervisor"
            >
              x
            </button>
            <ul v-if="showDropdown && filteredSupervisors.length > 0" ref="dropdown"
              class="border rounded mt-2 max-h-48 overflow-y-auto">
              <li v-for="supervisor in filteredSupervisors" :key="supervisor.id" @click="selectedSupervisor(supervisor)"
                class="cursor-pointer hover:bg-gray-100 p-2">
                {{ supervisor.first_name + " " + supervisor.last_name }}
              </li>
            </ul>
          </div>
          <div>
            <label class="block mb-1">{{ $t('employeeList.modal.fields.role') }}</label>
            <input type="text" v-model="formData.role" class="border rounded p-2 w-full" />
          </div>
          <div>
            <label class="block mb-1">{{ $t('employeeList.modal.fields.joinDate') }}</label>
            <input type="date" v-model="formData.join_date" class="border rounded p-2 w-full" />
          </div>
          <div>
            <input type="checkbox" v-model="formData.is_supervisor" />{{ $t('employeeList.modal.userType.supervisor')
            }}
            <template v-if="authStore.user.is_admin">
              <input type="checkbox" v-if="authStore.user.is_admin" v-model="formData.is_admin" />{{
                $t('employeeList.modal.userType.admin') }}
            </template>
          </div>
          <div>
            <label class="block mb-1">{{ $t('employeeList.modal.fields.pto') }}</label>
            <input type="number" v-model="formData.remaining_pto" class="border rounded p-2 w-full" />
          </div>
        </div>
        <div class="mt-4">
          <button @click="handleSubmit()" type="button"
            class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            {{ $t('employeeList.modal.sendInvitation') }}
          </button>
        </div>
      </form>
    </Modal>
    <!-- Employee Details Modal -->
    <EmployeeDetailsModal v-if="selectedEmployee" :employee="selectedEmployee" :teams="fetchedTeams"
      :supervisors="fetchedSupervisors" :isVisible="isEmployeeDetailsModalVisible" @close="closeEmployeeDetailsModal"
      @save="handleUpdate" @delete="handleDelete" />
    <!-- Calendar Modal -->
    <CalendarModal v-if="isCalendarModalVisible" :isVisible="isCalendarModalVisible" :accountId="selectedUser.id"
      :employeeName="`${selectedUser.first_name} ${selectedUser.last_name}`" @close="closeCalendarModal" />
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import axios from 'axios';
import { auth } from '../../firebase/firebaseConfig.ts';
import { sendPasswordResetEmail } from 'firebase/auth';
import Modal from '@/modal/ModalView.vue';
import EmployeeDetailsModal from '@/modal/EmployeeDetailsModal.vue';
import CalendarModal from '@/modal/CalendarModal.vue';
import { useAuthStore } from '@/stores/authStore';
import { onClickOutside } from '@vueuse/core';
import LoopingRhombusesSpinner from '../../modal/Loading.vue';

const apiUrl = import.meta.env.VITE_API_URL;

axios.defaults.withCredentials = true;

const authStore = useAuthStore();

const searchTerm = ref('');
const isAddUserModalVisible = ref(false);
const isEmployeeDetailsModalVisible = ref(false);
const isCalendarModalVisible = ref(false);
const isLoading = ref(true);

const fetchedEmployees = ref([]);
const fetchedTeams = ref([]);
const selectedEmployee = ref(null);
const selectedUser = ref(null);
const fetchedSupervisors = ref([]);
const supervisorSearch = ref('');
const filteredSupervisors = ref([]);
const dropdown = ref(null);
const showDropdown = ref(false);

const formData = reactive({
  first_name: '',
  last_name: '',
  email: '',
  birthdate: '',
  team_id: '',
  supervisor_id: '',
  remaining_pto: 0,
  special_pto: '',
  role: '',
  join_date: '',
  leave_date: '',
  is_admin: false,
  is_supervisor: false,
});

function resetFormData() {
  formData.first_name = '';
  formData.last_name = '';
  formData.email = '';
  formData.birthdate = '';
  formData.team_id = '';
  formData.supervisor_id = '';
  formData.remaining_pto = 0;
  formData.special_pto = '';
  formData.role = '';
  formData.join_date = '';
  formData.leave_date = '';
  formData.is_supervisor = false;
  formData.is_admin = false;
}

const openAddUserModal = () => {
  isAddUserModalVisible.value = true;
  formData.supervisor_id = null; // Reset supervisor to null when opening the modal for adding a new user
  supervisorSearch.value = '';  // Reset search term for supervisor
}


const closeAddUserModal = () => {
  isAddUserModalVisible.value = false;
  resetFormData();
};

//adding a new user
const handleSubmit = async () => {
  const email = formData.email;
  // post new user to backend
  await addUserBackend(); 
  // close the modal
  closeAddUserModal();
  // send email to the new user, delayed by two seconds to allow time for new account to post to Firebase
  await new Promise(resolve => { setTimeout(resolve, 2000) });
  sendFirebaseEmail(email);
  // fetch employees from backend
  await handleFetchEmployees(authStore.user.company_id);
}
const addUserBackend = async () => {
  const userData = {
    email: formData.email,
    first_name: formData.first_name,
    last_name: formData.last_name,
    birthdate: new Date(formData.birthdate),
    company_id: authStore.user.company_id,
    join_date: new Date(formData.join_date),
    role: formData.role,
    is_admin: formData.is_admin,
    is_supervisor: formData.is_supervisor,
    remaining_pto: formData.remaining_pto,
    team_id: formData.team_id,
  };
  const cleanedData = Object.fromEntries(
    Object.entries(userData).filter(([key, value]) => {
      // Only include key-value pairs where value is not empty, null, undefined, or whitespace
      return (
        value !== "" &&
        value !== null &&
        value !== undefined &&
        (typeof value === "string" ? value.trim() !== "" : true)
      );
    })
  );
  await axios.post(`${apiUrl}/accounts`, cleanedData).catch((err) => { console.log(err) });
}
const sendFirebaseEmail = (email) => {
  sendPasswordResetEmail(auth, email)
    // .then((res) => {
    //   console.log("SENT");
    // })
    .catch((error) => {
      console.log(error.code, error.message);
    });
}

const openEmployeeDetailsModal = (employee) => {
  selectedEmployee.value = employee;
  isEmployeeDetailsModalVisible.value = true;

};

const closeEmployeeDetailsModal = () => {
  isEmployeeDetailsModalVisible.value = false;
  selectedEmployee.value = null;
  // fetch supervisors so that changes reflect after exiting modal
  fetchSupervisors();
};

const handleUpdate = async (updatedData) => {
  try {
    const employeeId = selectedEmployee.value.id;
    const cleanedUpdates = Object.fromEntries(
      Object.entries(updatedData).filter(([key, value]) => {
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
    cleanedUpdates.leave_date = new Date(cleanedUpdates.leave_date);
    cleanedUpdates.birthdate = new Date(cleanedUpdates.birthdate);
    const response = await axios.patch(`${apiUrl}/accounts/${employeeId}`, cleanedUpdates);
    if (response.status === 200) {
      console.log("Account updated successfully");
      await handleFetchEmployees(authStore.user.company_id);
      closeEmployeeDetailsModal();
    } else {
      console.error("Failed to update account")
    }
  } catch (err) {
    console.error("Error updating employee: ", err);
  }
}

//deleting account
const handleDelete = async () => {
  try {
    const employeeId = selectedEmployee.value.id;
    console.log(employeeId);
    const response = await axios.delete(`${apiUrl}/accounts/${employeeId}`)
    if (response.status === 200) {
      console.log('Account deleted successfully');
      await handleFetchEmployees(authStore.user.company_id);
      closeEmployeeDetailsModal();
    } else {
      console.error('Failed to delete account');
    }
  } catch (err) {
    console.error("Error deleting employee: ", err);
  }
}

const openCalendarModal = (user) => {
  console.log("Opening calendar for user:", user);
  selectedUser.value = user;
  isCalendarModalVisible.value = true;
};

const closeCalendarModal = () => {
  isCalendarModalVisible.value = false;
  selectedUser.value = null;
};

//get all employees for list
const handleFetchEmployees = async () => {
  try {
    const response = await axios.get(`${apiUrl}/accounts/${authStore.user.company_id}`);
    fetchedEmployees.value = response.data;
  } catch (err) {
    console.error('Error fetching employees:', err);
  }
};

//get all teams
const handleFetchTeams = async () => {
  try {
    const response = await axios.get(`${apiUrl}/organizations/${authStore.user.company_id}/teams`);
    fetchedTeams.value = response.data;
  } catch (err) {
    console.error('Error fetching teams:', err);
  }
}

//employee search
const filteredEmployees = computed(() => {
  if (!fetchedEmployees.value) return []; // handles case where employeeList is null initially
  return fetchedEmployees.value.filter((employee) =>
    (employee.first_name + employee.last_name).toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

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
  showDropdown.value = false;
}

const clearSupervisor = () => {
  formData.supervisor_id = '';  // Reset the supervisor ID
  supervisorSearch.value = '';   // Clear the input field
  filteredSupervisors.value = [];  // Clear the filtered supervisors list
  showDropdown.value = false;
  filterSupervisors();
};

const closeDropdown = () => {
  filteredSupervisors.value = [];  // Close the dropdown by clearing the filtered list
  showDropdown.value = false;
  filterSupervisors();
};

// handle click outside of dropdown of supervisors
onClickOutside(dropdown, closeDropdown);

const handleFetchAll = async () => {
  isLoading.value = true;
  await handleFetchEmployees();
  await handleFetchTeams();
  await fetchSupervisors();
  isLoading.value = false;
}

onMounted(() => {
  handleFetchEmployees();
  handleFetchTeams();
  fetchSupervisors();
  filterSupervisors();
});
</script>
