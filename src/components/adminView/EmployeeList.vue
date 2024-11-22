<template>
  <div class="bg-white shadow p-4 rounded">
    <div class="flex justify-between items-center mb-4">
      <input
        type="text"
        :placeholder="$t('employeeList.searchPlaceholder')"
        v-model="searchTerm"
        class="border rounded p-2 w-1/2"
      />
      <button
        @click="openAddUserModal"
        class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
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
        <tr
          v-for="employee in filteredEmployees"
          :key="employee.id"
          @click="openEmployeeDetailsModal(employee)"
          class="cursor-pointer hover:bg-gray-100">
          <td class="border p-2">{{ employee.name }}</td>
          <td class="border p-2">{{ employee.team }}</td>
          <td class="border p-2">{{ employee.role }}</td>
          <td class="border p-2">{{ employee.joinDate }}</td>
          <td class="border p-2">{{ employee.lastDate }}</td>
          <td class="border p-2">{{ employee.type }}</td>
          <td class="border p-2">{{ employee.status }}</td>
          <td class="border p-2">{{ employee.email }}</td>
          <td class="border p-2">
            <button
              class="bg-green-500 text-white px-2 py-1 rounded"
              @click.stop="viewEmployeeDetails(employee)"
            >
              {{ $t('employeeList.view') }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <Modal :isVisible="isAddUserModalVisible" @close="closeAddUserModal">
  <h2 class="text-xl font-bold mb-4">{{ $t('employeeList.modal.modalTitle') }}</h2>
  <form @submit.prevent="submitNewUserForm">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block mb-1">{{ $t('employeeList.modal.fields.firstName') }}</label>
        <input
          type="text"
          v-model="formData.firstName"
          class="border rounded p-2 w-full"
        />
      </div>
      <div>
        <label class="block mb-1">{{ $t('employeeList.modal.fields.lastName') }}</label>
        <input
          type="text"
          v-model="formData.lastName"
          class="border rounded p-2 w-full"
        />
      </div>

      <div>
        <label class="block mb-1">{{ $t('employeeList.modal.fields.email') }}</label>
        <input
          type="email"
          v-model="formData.email"
          class="border rounded p-2 w-full"
        />
      </div>
      <div>
        <label class="block mb-1">{{ $t('employeeList.modal.fields.dateOfBirth') }}</label>
        <input
          type="date"
          v-model="formData.dateOfBirth"
          class="border rounded p-2 w-full"
        />
      </div>
      <div>
        <label class="block mb-1">{{ $t('employeeList.modal.fields.team') }}</label>
        <select
          v-model="formData.team"
          class="border rounded p-2 w-full"
        >
          <option value="" disabled>{{ $t('employeeDetails.placeholders.selectTeam') }}</option>
          <option v-for="team in teams" :key="team" :value="team">{{ team }}</option>
        </select>
      </div>
      <div>
        <label class="block mb-1">{{ $t('employeeList.modal.fields.supervisor') }}</label>
        <input
          type="text"
          v-model="formData.supervisor"
          class="border rounded p-2 w-full"
        />
      </div>
      <div>
        <label class="block mb-1">{{ $t('employeeList.modal.fields.role') }}</label>
        <input
          type="text"
          v-model="formData.role"
          class="border rounded p-2 w-full"
        />
      </div>
      <div>
        <label class="block mb-1">{{ $t('employeeList.modal.fields.joinDate') }}</label>
        <input
          type="date"
          v-model="formData.joinDate"
          class="border rounded p-2 w-full"
        />
      </div>
      <div>
        <label class="block mb-1">{{ $t('employeeList.modal.fields.type') }}</label>
        <select
          v-model="formData.type"
          class="border rounded p-2 w-full"
        >
          <option value="User">{{ $t('employeeList.modal.userType.user') }}</option>
          <option value="Admin">{{ $t('employeeList.modal.userType.admin') }}</option>
        </select>
      </div>
      <div>
        <label class="block mb-1">{{ $t('employeeList.modal.fields.pto') }}</label>
        <input
          type="number"
          v-model="formData.pto"
          class="border rounded p-2 w-full"
        />
      </div>
    </div>
    <div class="mt-4">
      <button
        type="submit"
        class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        {{ $t('employeeList.modal.sendInvitation') }}
      </button>
    </div>
  </form>
</Modal>
    <EmployeeDetailsModal
      v-if="selectedEmployee"
      :employee="selectedEmployee"
      :isVisible="isEmployeeDetailsModalVisible"
      @close="closeEmployeeDetailsModal"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Modal from '@/modal/ModalView.vue';
import EmployeeDetailsModal from '@/modal/EmployeeDetailsModal.vue';


const searchTerm = ref('');


const isAddUserModalVisible = ref(false);
const isEmployeeDetailsModalVisible = ref(false);


const employees = ref([
  {
    id: 1,
    name: 'Tim Peters',
    team: 'Team A',
    role: 'Developer',
    joinDate: '2022-01-01',
    lastDate: '',
    type: 'User',
    status: 'Active',
    email: 'timpeters@example.com',
    pto: 5,
    supervisor: 'Anna Smith',
  },
]);


const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
});

const selectedEmployee = ref(null);


const filteredEmployees = computed(() =>
  employees.value.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
);


const openAddUserModal = () => {
  isAddUserModalVisible.value = true;
};

const closeAddUserModal = () => {
  isAddUserModalVisible.value = false;
};

const submitNewUserForm = () => {
  console.log('New user data:', formData.value);
  closeAddUserModal();
};


const openEmployeeDetailsModal = (employee) => {
  selectedEmployee.value = employee;
  isEmployeeDetailsModalVisible.value = true;
};

const closeEmployeeDetailsModal = () => {
  isEmployeeDetailsModalVisible.value = false;
  selectedEmployee.value = null;
};
</script>










