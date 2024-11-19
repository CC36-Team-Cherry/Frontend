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
        @click="openModal"
        class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
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
        <tr v-for="employee in filteredEmployees" :key="employee.id">
          <td class="border p-2">{{ employee.name }}</td>
          <td class="border p-2">{{ employee.team }}</td>
          <td class="border p-2">{{ employee.role }}</td>
          <td class="border p-2">{{ employee.joinDate }}</td>
          <td class="border p-2">{{ employee.lastDate }}</td>
          <td class="border p-2">{{ employee.type }}</td>
          <td class="border p-2">{{ employee.status }}</td>
          <td class="border p-2">{{ employee.email }}</td>
          <td class="border p-2">
            <button class="bg-green-500 text-white px-2 py-1 rounded">
              {{ $t('employeeList.view') }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <Modal :isVisible="isModalVisible" @close="closeModal">
      <h2 class="text-xl font-bold mb-4">{{ $t('employeeList.modal.modalTitle') }}</h2>
      <form @submit.prevent="submitForm">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-1">{{ $t('employeeList.modal.fields.firstName') }}</label>
            <input type="text" v-model="formData.firstName" class="border rounded p-2 w-full" />
          </div>
          <div>
            <label class="block mb-1">{{ $t('employeeList.modal.fields.lastName') }}</label>
            <input type="text" v-model="formData.lastName" class="border rounded p-2 w-full" />
          </div>
          <div>
            <label class="block mb-1">{{ $t('employeeList.modal.fields.email') }}</label>
            <input type="email" v-model="formData.email" class="border rounded p-2 w-full" />
          </div>
          <div>
            <label class="block mb-1">{{ $t('employeeList.modal.fields.dateOfBirth') }}</label>
            <input type="date" v-model="formData.dateOfBirth" class="border rounded p-2 w-full" />
          </div>
          <div>
            <label class="block mb-1">{{ $t('employeeList.modal.fields.team') }}</label>
            <input type="text" v-model="formData.team" class="border rounded p-2 w-full" />
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
            <input type="date" v-model="formData.joinDate" class="border rounded p-2 w-full" />
          </div>
          <div>
            <label class="block mb-1">{{ $t('employeeList.modal.fields.type') }}</label>
            <select v-model="formData.type" class="border rounded p-2 w-full">
              <option value="User">{{ $t('employeeList.modal.userType.user') }}</option>
              <option value="Admin">{{ $t('employeeList.modal.userType.admin') }}</option>
            </select>
          </div>
          <div>
            <label class="block mb-1">{{ $t('employeeList.modal.fields.pto') }}</label>
            <input type="number" v-model="formData.pto" class="border rounded p-2 w-full" />
          </div>
        </div>
        <div class="mt-4">
          <button type="submit" class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            {{ $t('employeeList.modal.sendInvitation') }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Modal from '@/modal/ModalView.vue';

const searchTerm = ref('');
const isModalVisible = ref(false);

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
  },
]);

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
  pto: '',
});

const openModal = () => {
  console.log('Opening modal...');
  isModalVisible.value = true;
};

const closeModal = () => {
  isModalVisible.value = false;
};

const submitForm = () => {
  console.log('New User Data:', formData.value);
  formData.value = {
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    team: '',
    supervisor: '',
    role: '',
    joinDate: '',
    type: '',
    pto: '',
  };
  closeModal();
};

const filteredEmployees = computed(() =>
  employees.value.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
);
</script>








