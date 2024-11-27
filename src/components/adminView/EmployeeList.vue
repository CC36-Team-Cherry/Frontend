<template>
  <div class="bg-white shadow p-4 rounded">
    <div class="flex justify-between items-center mb-4">
      <input type="text" :placeholder="$t('employeeList.searchPlaceholder')" v-model="searchTerm"
        class="border rounded p-2 w-1/2" />
      <button @click="openAddUserModal" class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
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
          <th class="border p-2">{{ $t('employeeList.tableHeaders.type') }}</th>
          <th class="border p-2">{{ $t('employeeList.tableHeaders.status') }}</th>
          <th class="border p-2">{{ $t('employeeList.tableHeaders.email') }}</th>
          <th class="border p-2">{{ $t('employeeList.tableHeaders.att') }}</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="filteredEmployees.length > 0">
          <tr v-for="employee in filteredEmployees" :key="employee.id" @click="openEmployeeDetailsModal(employee)"
            class="cursor-pointer hover:bg-gray-100">
            <td class="border p-2">{{ employee.first_name + ' ' + employee.last_name }}</td>
            <td class="border p-2">{{ employee.team_id || 'no team' }}</td>
            <td class="border p-2">{{ employee.role }}</td>
            <td class="border p-2">{{ employee.join_date.split('T')[0] }}</td>
            <td class="border p-2">{{ employee.leave_date || 'NA' }}</td>
            <td class="border p-2">{{ employee.Privileges.is_admin ? 'Admin' : employee.Privileges.is_supervisor ?
              'Supervisor' : 'none' }}</td>
            <td class="border p-2">{{ employee.leave_date ? 'Inactive' : 'Active' }}</td>
            <td class="border p-2">{{ employee.email }}</td>
            <td class="border p-2">
              <button class="bg-green-500 text-white px-2 py-1 rounded" @click.stop="viewEmployeeDetails(employee)">
                {{ $t('employeeList.view') }}
              </button>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
    <Modal :isVisible="isAddUserModalVisible" @close="closeAddUserModal">
      <h2 class="text-xl font-bold mb-4">{{ $t('employeeList.modal.modalTitle') }}</h2>
      <form>
        <div class="grid grid-cols-2 gap-4">
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
            <select v-model="formData.team" class="border rounded p-2 w-full">
              <option value="" disabled>{{ $t('employeeDetails.placeholders.selectTeam') }}</option>
              <option v-for="team in teams" :key="team" :value="team">{{ team }}</option>
            </select>
          </div>
          <div>
            <label class="block mb-1">{{ $t('employeeList.modal.fields.supervisor') }}</label>
            <input type="text" v-model="formData.supervisor" class="border rounded p-2 w-full" />
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
            <!-- <label class="block mb-1">{{ $t('employeeList.modal.fields.type') }}</label> -->
            <input type="checkbox" v-model="formData.is_supervisor">{{ $t('employeeList.modal.userType.supervisor')
            }}</input>
            <input type="checkbox" v-model="formData.is_admin">{{ $t('employeeList.modal.userType.admin') }}</input>
            <!-- </select> -->
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
    <EmployeeDetailsModal v-if="selectedEmployee" :employee="selectedEmployee"
      :isVisible="isEmployeeDetailsModalVisible" @close="closeEmployeeDetailsModal" @save="handleUpdate" @delete="handleDelete"/>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from "axios";
import { auth } from '../../firebase/firebaseConfig.ts';
import { sendPasswordResetEmail } from 'firebase/auth';
import Modal from '@/modal/ModalView.vue';
import EmployeeDetailsModal from '@/modal/EmployeeDetailsModal.vue';
import { reactive } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const apiUrl = import.meta.env.VITE_API_URL;

const authStore = useAuthStore();

const searchTerm = ref('');


const isAddUserModalVisible = ref(false);
const isEmployeeDetailsModalVisible = ref(false);

//get employee list
let fetchedEmployees = ref([]);

async function handleFetchEmployees(companyId) {
  try {
    const response = await fetch(`${apiUrl}/accounts/${companyId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    if (response.ok) {
      const parsedRes = await response.json();
      fetchedEmployees.value = parsedRes;
    }
  } catch (err) {
    console.error("Error: ", err);
  }
}

handleFetchEmployees(authStore.user.company_id);

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
});

function resetFormData() {
  formData.first_name = '';
  formData.last_name = '';
  formData.email = '';
  formData.birthdate = '';
  formData.team = '';
  formData.supervisor = '';
  formData.remaining_pto = 0;
  formData.special_holidays = '';
  formData.role = '';
  formData.join_date = '';
  formData.leave_date = '';
  formData.is_supervisor = false;
  formData.is_admin = false;
}

const selectedEmployee = ref(null);

//employee search
const filteredEmployees = computed(() => {
  if (!fetchedEmployees.value) return []; // handles case where employeeList is null initially
  return fetchedEmployees.value.filter((employee) =>
    (employee.first_name + employee.last_name).toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});


const openAddUserModal = () => {
  isAddUserModalVisible.value = true;
};

const closeAddUserModal = () => {
  isAddUserModalVisible.value = false;
  resetFormData();
};

const handleSubmit = async () => {
  const email = formData.email;
  // post new user to backend
  await addUserBackend();
  // close the modal
  closeAddUserModal();
  // send email to the new user, delayed by two seconds to allow time for new account to post to Firebase
  await new Promise(resolve => {setTimeout(resolve, 2000)});
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
  };
  await axios.post(`${apiUrl}/accounts`, userData).catch((err) => {console.log(err)});
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

const handleDelete = async () => {
  try {
    const employeeId = selectedEmployee.value.id;
    console.log(employeeId);
    const response = await axios.delete(`${apiUrl}/accounts/${employeeId}`)
    if (response.status === 200) {
      console.log('Account deleted successfully');
      await handleFetchEmployees(1);
      closeEmployeeDetailsModal();
    } else {
      console.error('Failed to delete account');
    }
  } catch (err) {
    console.error("Error deleting employee: ", err)
  }
}
</script>
