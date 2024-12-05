<template>
  <LoopingRhombusesSpinner v-if="isLoading" />
  <div v-else class="bg-white shadow p-4 rounded">
    <div class="flex justify-between items-center mb-4">
      <input type="text" :placeholder="$t('employeeList.searchPlaceholder')" v-model="searchTerm"
        class="border rounded p-2 w-1/2" />
      <button v-if="authStore.user.Privileges?.is_admin" @click="openAddUserModal"
        class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
        {{ $t('employeeList.addUser') }}
      </button>
    </div>
    <table class="w-full border-collapse border border-gray-300">
      <thead class="bg-gray-200">
        <tr>
          <th class="border p-2 text-left">
            <div class="inline-flex items-center space-x-2">
              <span>{{ $t('employeeList.tableHeaders.name') }}</span>
              <svg-icon v-if="!isNameSorted" :path="path" type="mdi" class="cursor-pointer w-5 h-5 min-w-5"
                @click="handleNameSort"></svg-icon>
              <svg-icon v-if="isNameSorted && !isNameSortedRev" :path="path" type="mdi"
                class="cursor-pointer w-5 h-5 min-w-5 bg-gray-400 rounded" @click="handleNameSort"></svg-icon>
              <svg-icon v-if="isNameSorted && isNameSortedRev" :path="path" type="mdi"
                class="cursor-pointer w-5 h-5 min-w-5 bg-gray-400 rounded" @click="resetSort"></svg-icon>
            </div>
          </th>
          <th class="border p-2 text-left">
            <div class="inline-flex items-center space-x-2">
              <span>{{ $t('employeeList.tableHeaders.team') }}</span>
              <svg-icon v-if="!isTeamSorted" :path="path" type="mdi" class="cursor-pointer w-5 h-5 min-w-5"
                @click="handleTeamSort"></svg-icon>
              <svg-icon v-if="isTeamSorted && !isTeamSortedRev" :path="path" type="mdi"
                class="cursor-pointer w-5 h-5 min-w-5 bg-gray-400 rounded" @click="handleTeamSort"></svg-icon>
              <svg-icon v-if="isTeamSorted && isTeamSortedRev" :path="path" type="mdi"
                class="cursor-pointer w-5 h-5 min-w-5 bg-gray-400 rounded" @click="resetSort"></svg-icon>
            </div>
          </th>
          <th class="border p-2 text-left">
            <div class="inline-flex items-center space-x-2">
              <span>{{ $t('employeeList.tableHeaders.role') }}</span>
              <svg-icon v-if="!isRoleSorted" :path="path" type="mdi" class="cursor-pointer w-5 h-5 min-w-5"
                @click="handleRoleSort"></svg-icon>
              <svg-icon v-if="isRoleSorted && !isRoleSortedRev" :path="path" type="mdi"
                class="cursor-pointer w-5 h-5 min-w-5 bg-gray-400 rounded" @click="handleRoleSort"></svg-icon>
              <svg-icon v-if="isRoleSorted && isRoleSortedRev" :path="path" type="mdi"
                class="cursor-pointer w-5 h-5 min-w-5 bg-gray-400 rounded" @click="resetSort"></svg-icon>
            </div>
          </th>
          <th class="border p-2 text-left">
            <div class="inline-flex items-center space-x-2">
              <span>{{ $t('employeeList.tableHeaders.joinDate') }}</span>
              <svg-icon v-if="!isJoinDateSorted" :path="path" type="mdi" class="cursor-pointer w-5 h-5 min-w-5"
                @click="handleJoinDateSort"></svg-icon>
              <svg-icon v-if="isJoinDateSorted && !isJoinDateSortedRev" :path="path" type="mdi"
                class="cursor-pointer w-5 h-5 min-w-5 bg-gray-400 rounded" @click="handleJoinDateSort"></svg-icon>
              <svg-icon v-if="isJoinDateSorted && isJoinDateSortedRev" :path="path" type="mdi"
                class="cursor-pointer w-5 h-5 min-w-5 bg-gray-400 rounded" @click="resetSort"></svg-icon>
            </div>
          </th>
          <th class="border p-2 text-left">
            <div class="inline-flex items-center space-x-2">
              <span>{{ $t('employeeList.tableHeaders.lastDate') }}</span>
              <svg-icon v-if="!isLastDateSorted" :path="path" type="mdi" class="cursor-pointer w-5 h-5 min-w-5"
                @click="handleLastDateSort"></svg-icon>
              <svg-icon v-if="isLastDateSorted && !isLastDateSortedRev" :path="path" type="mdi"
                class="cursor-pointer w-5 h-5 min-w-5 bg-gray-400 rounded" @click="handleLastDateSort"></svg-icon>
              <svg-icon v-if="isLastDateSorted && isLastDateSortedRev" :path="path" type="mdi"
                class="cursor-pointer w-5 h-5 min-w-5 bg-gray-400 rounded" @click="resetSort"></svg-icon>
            </div>
          </th>
          <th class="border p-2 text-left">
            <div class="inline-flex items-center space-x-2">
              <span>{{ $t('employeeList.tableHeaders.privileges') }}</span>
              <svg-icon v-if="!isPrivSorted" :path="path" type="mdi" class="cursor-pointer w-5 h-5 min-w-5"
                @click="handlePrivilegesSort"></svg-icon>
              <svg-icon v-if="isPrivSorted && !isPrivSortedRev" :path="path" type="mdi"
                class="cursor-pointer w-5 h-5 min-w-5 bg-gray-400 rounded" @click="handlePrivilegesSort"></svg-icon>
              <svg-icon v-if="isPrivSorted && isPrivSortedRev" :path="path" type="mdi"
                class="cursor-pointer w-5 h-5 min-w-5 bg-gray-400 rounded" @click="resetSort"></svg-icon>
            </div>
          </th>
          <th v-if="authStore.user.Privileges?.is_admin || authStore.user.Privileges?.is_supervisor"
            class="border p-2 text-left">
            <div class="inline-flex items-center space-x-2">
              <span>Last Login</span>
              <svg-icon v-if="!isLastLoginSorted" :path="path" type="mdi" class="cursor-pointer w-5 h-5 min-w-5"
                @click="handleLastLoginSort"></svg-icon>
              <svg-icon v-if="isLastLoginSorted && !isLastLoginSortedRev" :path="path" type="mdi"
                class="cursor-pointer w-5 h-5 min-w-5 bg-gray-400 rounded" @click="handleLastLoginSort"></svg-icon>
              <svg-icon v-if="isLastLoginSorted && isLastLoginSortedRev" :path="path" type="mdi"
                class="cursor-pointer w-5 h-5 min-w-5 bg-gray-400 rounded" @click="resetSort"></svg-icon>
            </div>
          </th>
          <th class="border p-2 text-left">
            <div class="inline-flex items-center space-x-2">
              <span>{{ $t('employeeList.tableHeaders.email') }}</span>
              <svg-icon v-if="!isEmailSorted" :path="path" type="mdi" class="cursor-pointer w-5 h-5 min-w-5"
                @click="handleEmailSort"></svg-icon>
              <svg-icon v-if="isEmailSorted && !isEmailSortedRev" :path="path" type="mdi"
                class="cursor-pointer w-5 h-5 min-w-5 bg-gray-400 rounded" @click="handleEmailSort"></svg-icon>
              <svg-icon v-if="isEmailSorted && isEmailSortedRev" :path="path" type="mdi"
                class="cursor-pointer w-5 h-5 min-w-5 bg-gray-400 rounded" @click="resetSort"></svg-icon>
            </div>
          </th>
          <th v-if="authStore.user.PrivilegesPrivileges?.is_admin || authStore.user.Privileges?.is_supervisor"
            class="border p-2">{{
              $t('employeeList.tableHeaders.att') }}</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="displayedEmployees.length > 0">
          <tr v-for="employee in displayedEmployees" :key="employee.id" @click="openEmployeeDetailsModal(employee)"
            class="cursor-pointer hover:bg-gray-200 even:bg-gray-100 odd:bg-white">
            <td class="border p-2">{{ employee.first_name + ' ' + employee.last_name }}</td>
            <td class="border p-2">{{ employee.team ? employee.team.team_name : 'NA' }}</td>
            <td class="border p-2">{{ employee.role }}</td>
            <td class="border p-2">{{ employee.join_date.split('T')[0] }}</td>
            <td class="border p-2">{{ employee.leave_date ? employee.leave_date.split('T')[0] : 'NA' }}</td>
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
            <td v-if="authStore.user.Privileges?.is_admin || authStore.user.Privileges?.is_supervisor"
              class="border p-2">{{
                employee.last_login ? employee.last_login.split('T')[0] : 'Invite Sent' }}</td>
            <td class="border p-2">{{ employee.email }}</td>
            <td v-if="authStore.user.Privileges?.is_admin || authStore.user.Privileges?.is_supervisor"
              class="border p-2">
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
            <label class="block mb-1"><span class="text-red-500 font-bold">*</span>{{
              $t('employeeList.modal.fields.firstName') }}</label>
            <input type="text" v-model="formData.first_name" class="border rounded p-2 w-full" />
          </div>
          <div>
            <label class="block mb-1"><span class="text-red-500 font-bold">*</span>{{
              $t('employeeList.modal.fields.lastName') }}</label>
            <input type="text" v-model="formData.last_name" class="border rounded p-2 w-full" />
          </div>
          <div>
            <label class="block mb-1"><span class="text-red-500 font-bold">*</span>{{
              $t('employeeList.modal.fields.email')
            }}</label>
            <input type="email" v-model="formData.email" class="border rounded p-2 w-full" />
          </div>
          <div>
            <label class="block mb-1"><span class="text-red-500 font-bold">*</span>{{
              $t('employeeList.modal.fields.dateOfBirth') }}</label>
            <input type="date" v-model="formData.birthdate" class="border rounded p-2 w-full" />
          </div>
          <div>
            <label class="block mb-1">{{ $t('employeeList.modal.fields.team') }}</label>
            <select v-model="formData.team_id" class="border rounded p-2 w-full">
              <option value="" disabled>{{ $t('employeeDetails.placeholders.selectTeam') }}</option>
              <option v-for="team in fetchedTeams" :key="team.id" :value="team.id">{{ team.team_name }}</option>
              <option :value="null">No team</option>
            </select>
          </div>
          <div>
            <label class="block mb-1">{{ "Supervisor" }}</label>
            <input v-model="supervisorSearch" @input="filterSupervisors" @focus="showDropdown = true" type="text"
              placeholder="Select Supervisor" class="border rounded p-2 w-full">
            <ul v-if="showDropdown && filteredSupervisors.length > 0" ref="dropdown"
              class="border rounded mt-2 max-h-48 overflow-y-auto">
              <li v-for="supervisor in filteredSupervisors" :key="supervisor.id" @click="selectedSupervisor(supervisor)"
                class="cursor-pointer hover:bg-gray-100 p-2">
                {{ supervisor.first_name + " " + supervisor.last_name }}
              </li>
            </ul>
          </div>
          <div>
            <label class="block mb-1"><span class="text-red-500 font-bold">*</span>{{
              $t('employeeList.modal.fields.role')
            }}</label>
            <input type="text" v-model="formData.role" class="border rounded p-2 w-full" />
          </div>
          <div>
            <label class="block mb-1"><span class="text-red-500 font-bold">*</span>{{
              $t('employeeList.modal.fields.joinDate') }}</label>
            <input type="date" v-model="formData.join_date" class="border rounded p-2 w-full" />
          </div>
          <div>
            <input type="checkbox" v-model="formData.is_supervisor" />{{ $t('employeeList.modal.userType.supervisor')
            }}
            <template v-if="authStore.user.Privileges.is_admin">
              <input type="checkbox" v-model="formData.is_admin" />{{
                $t('employeeList.modal.userType.admin') }}
            </template>
          </div>
          <div>
            <label class="block mb-1"><span class="text-red-500 font-bold">*</span>{{
              $t('employeeList.modal.fields.pto')
            }}</label>
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
      @save="handleUpdate" @delete="openConfirmModal" />
    <ConfirmModal :isVisible="isConfirmModalVisible" :confirmFunc="handleDelete" confirmString="Delete"
      @close="isConfirmModalVisible = false">
      <p>Are you sure you want to delete?</p>
    </ConfirmModal>
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
import ConfirmModal from '@/modal/ConfirmModal.vue';
import EmployeeDetailsModal from '@/modal/EmployeeDetailsModal.vue';
import CalendarModal from '@/modal/CalendarModal.vue';
import { useAuthStore } from '@/stores/authStore';
import { onClickOutside } from '@vueuse/core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiSort } from '@mdi/js';
import LoopingRhombusesSpinner from '../../modal/Loading.vue';

const apiUrl = import.meta.env.VITE_API_URL;

axios.defaults.withCredentials = true;

const authStore = useAuthStore();

const searchTerm = ref('');
const isAddUserModalVisible = ref(false);
const isEmployeeDetailsModalVisible = ref(false);
const isCalendarModalVisible = ref(false);
const isConfirmModalVisible = ref(false);
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

const path = mdiSort;

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

const openConfirmModal = () => {
  isConfirmModalVisible.value = true;
}

//adding a new user
const handleSubmit = async () => {
  if (!formData.email || !formData.first_name || !formData.last_name || !formData.birthdate || !formData.join_date || !formData.role) {
    alert('Please fill out all required fields.');
    return;
  }
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
      isConfirmModalVisible.value = false;
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
    fetchedSupervisors.value = response.data;
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

// NOTE: May delete after, depreciated after removing clear supervisor button from add user
// const clearSupervisor = () => {
//   formData.supervisor_id = '';  // Reset the supervisor ID
//   supervisorSearch.value = '';   // Clear the input field
//   filteredSupervisors.value = [];  // Clear the filtered supervisors list
//   showDropdown.value = false;
//   filterSupervisors();
// };

const closeDropdown = () => {
  filteredSupervisors.value = [];  // Close the dropdown by clearing the filtered list
  showDropdown.value = false;
  filterSupervisors();
};

// handle click outside of dropdown of supervisors
onClickOutside(dropdown, closeDropdown);

const displayedEmployees = computed(() => {
  return isSorted.value ? sortedEmployees.value : filteredEmployees.value;
});

//sorting functions
const isSorted = ref(false);
const isNameSorted = ref(false);
const isNameSortedRev = ref(false);
const isTeamSorted = ref(false);
const isTeamSortedRev = ref(false);
const isRoleSorted = ref(false);
const isRoleSortedRev = ref(false);
const isJoinDateSorted = ref(false);
const isJoinDateSortedRev = ref(false);
const isLastDateSorted = ref(false);
const isLastDateSortedRev = ref(false);
const isPrivSorted = ref(false);
const isPrivSortedRev = ref(false);
const isLastLoginSorted = ref(false);
const isLastLoginSortedRev = ref(false);
const isEmailSorted = ref(false);
const isEmailSortedRev = ref(false);
const sortedEmployees = ref([]);

function handleNameSort() {

  // If not already sorted, sort in ascending order
  if (!isNameSorted.value) {
    resetSort();
    sortedEmployees.value = [...filteredEmployees.value].sort((a, b) => {
      return a.first_name.localeCompare(b.first_name);
    });
    isSorted.value = true;
    return isNameSorted.value = true;
  } else {
    // If already sorted, reverse the order
    sortedEmployees.value = [...sortedEmployees.value].reverse();
    return isNameSortedRev.value = true;
  }
}

function handleTeamSort() {
  if (!isTeamSorted.value) {
    resetSort();
    sortedEmployees.value = [...filteredEmployees.value].sort((a, b) => {
      return b.team_id - a.team_id;
    });
    isTeamSorted.value = true;
    return isSorted.value = true;
  } else {
    sortedEmployees.value = [...sortedEmployees.value].reverse();
    return isTeamSortedRev.value = true;
  }
}

function handleRoleSort() {
  if (!isRoleSorted.value) {
    resetSort();
    sortedEmployees.value = [...filteredEmployees.value].sort((a, b) => {
      return a.role.localeCompare(b.role);
    });
    isSorted.value = true;
    return isRoleSorted.value = true;
  } else {
    sortedEmployees.value = [...sortedEmployees.value].reverse();
    return isRoleSortedRev.value = true;
  }
}

function handleJoinDateSort() {
  if (!isJoinDateSorted.value) {
    resetSort();
    sortedEmployees.value = [...filteredEmployees.value].sort((a, b) => {
      return new Date(b.join_date) - new Date(a.join_date);
    });
    isSorted.value = true;
    return isJoinDateSorted.value = true;
  } else {
    sortedEmployees.value = [...sortedEmployees.value].reverse();
    return isJoinDateSortedRev.value = true;
  }
}

function handleLastDateSort() {
  if (!isLastDateSorted.value) {
    resetSort();
    sortedEmployees.value = [...filteredEmployees.value].sort((a, b) => {
      const dateA = a.leave_date ? new Date(a.leave_date) : new Date(0);
      const dateB = b.leave_date ? new Date(b.leave_date) : new Date(0);
      return dateB - dateA;
    });
    isSorted.value = true;
    return isLastDateSorted.value = true;
  } else {
    sortedEmployees.value = [...sortedEmployees.value].reverse();
    return isLastDateSortedRev.value = true;
  }
}

function handlePrivilegesSort() {
  if (!isPrivSorted.value) {
    resetSort();
    const dual = [];
    const admin = [];
    const supervisor = [];
    const user = [];
    for (let employee of filteredEmployees.value) {
      if (employee.Privileges.is_admin && employee.Privileges.is_supervisor) {
        dual.push(employee);
      } else if (employee.Privileges.is_admin) {
        admin.push(employee);
      } else if (employee.Privileges.is_supervisor) {
        supervisor.push(employee);
      } else {
        user.push(employee);
      }
    }
    sortedEmployees.value = [...dual, ...admin, ...supervisor, ...user];

    isSorted.value = true;
    return isPrivSorted.value = true;
  } else {
    sortedEmployees.value = [...sortedEmployees.value].reverse();
    return isPrivSortedRev.value = true;
  }
}

function handleLastLoginSort() {
  if (!isLastLoginSorted.value) {
    resetSort();
    sortedEmployees.value = [...filteredEmployees.value].sort((a, b) => {
      const dateA = a.last_login ? new Date(a.last_login) : new Date(0);
      const dateB = b.last_login ? new Date(b.last_login) : new Date(0);

      if (!a.last_login && b.last_login) return -1;
      if (a.last_login && !b.last_login) return 1;

      return dateB - dateA
    });
    isSorted.value = true;
    return isLastLoginSorted.value = true;
  } else {
    sortedEmployees.value = [...sortedEmployees.value].reverse();
    return isLastLoginSortedRev.value = true;
  }
}

function handleEmailSort() {
  if (!isEmailSorted.value) {
    resetSort();
    sortedEmployees.value = [...filteredEmployees.value].sort((a, b) => {
      return a.email.localeCompare(b.email);
    });
    isSorted.value = true;
    return isEmailSorted.value = true;
  } else {
    sortedEmployees.value = [...sortedEmployees.value].reverse();
    return isEmailSortedRev.value = true;
  }
}

function resetSort() {
  isSorted.value = false;
  isNameSorted.value = false;
  isNameSortedRev.value = false;
  isTeamSorted.value = false;
  isTeamSortedRev.value = false;
  isRoleSorted.value = false;
  isRoleSortedRev.value = false;
  isJoinDateSorted.value = false;
  isJoinDateSortedRev.value = false;
  isLastDateSorted.value = false;
  isLastDateSortedRev.value = false;
  isPrivSorted.value = false;
  isPrivSortedRev.value = false;
  isLastLoginSorted.value = false;
  isLastLoginSortedRev.value = false;
  isEmailSorted.value = false;
  isEmailSortedRev.value = false;
}

const handleFetchAll = async () => {
  isLoading.value = true;
  await handleFetchEmployees();
  await handleFetchTeams();
  await fetchSupervisors();
  isLoading.value = false;
}

onMounted(() => {
  handleFetchAll();
  filterSupervisors();
});
</script>