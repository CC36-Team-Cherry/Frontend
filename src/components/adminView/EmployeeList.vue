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
        <template v-if="filteredEmployees.length > 0">
          <tr
            v-for="employee in filteredEmployees"
            :key="employee.id"
            @click="openEmployeeDetailsModal(employee)"
            class="cursor-pointer hover:bg-gray-100"
          >
            <td class="border p-2">{{ employee.first_name + ' ' + employee.last_name }}</td>
            <td class="border p-2">{{ employee.team_id || 'no team' }}</td>
            <td class="border p-2">{{ employee.role }}</td>
            <td class="border p-2">{{ employee.join_date.split('T')[0] }}</td>
            <td class="border p-2">{{ employee.leave_date || 'NA' }}</td>
            <td class="border p-2">
              {{
                employee.Privileges.is_admin
                  ? 'Admin'
                  : employee.Privileges.is_supervisor
                  ? 'Supervisor'
                  : 'none'
              }}
            </td>
            <td class="border p-2">{{ employee.leave_date ? 'Inactive' : 'Active' }}</td>
            <td class="border p-2">{{ employee.email }}</td>
            <td class="border p-2">
              <button
                class="bg-green-500 text-white px-2 py-1 rounded"
                @click.stop="openCalendarModal(employee)"
              >
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
            <label class="block mb-1">{{ $t('employeeList.modal.fields.role') }}</label>
            <input type="text" v-model="formData.role" class="border rounded p-2 w-full" />
          </div>
          <div>
            <label class="block mb-1">{{ $t('employeeList.modal.fields.joinDate') }}</label>
            <input type="date" v-model="formData.join_date" class="border rounded p-2 w-full" />
          </div>
          <div>
            <input
              type="checkbox"
              v-model="formData.is_supervisor"
            />{{ $t('employeeList.modal.userType.supervisor') }}
            <input
              type="checkbox"
              v-model="formData.is_admin"
            />{{ $t('employeeList.modal.userType.admin') }}
          </div>
          <div>
            <label class="block mb-1">{{ $t('employeeList.modal.fields.pto') }}</label>
            <input type="number" v-model="formData.remaining_pto" class="border rounded p-2 w-full" />
          </div>
        </div>
        <div class="mt-4">
          <button
            @click="handleSubmit()"
            type="button"
            class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            {{ $t('employeeList.modal.sendInvitation') }}
          </button>
        </div>
      </form>
    </Modal>
    <!-- Employee Details Modal -->
    <EmployeeDetailsModal
      v-if="selectedEmployee"
      :employee="selectedEmployee"
      :isVisible="isEmployeeDetailsModalVisible"
      @close="closeEmployeeDetailsModal"
      @save="handleUpdate"
      @delete="handleDelete"
    />
    <!-- Calendar Modal -->
    <CalendarModal
     v-if="isCalendarModalVisible"
     :isVisible="isCalendarModalVisible"
     :accountId="selectedUser.id"
     :employeeName="`${selectedUser.first_name} ${selectedUser.last_name}`"
    @close="closeCalendarModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import axios from 'axios';
import Modal from '@/modal/ModalView.vue';
import EmployeeDetailsModal from '@/modal/EmployeeDetailsModal.vue';
import CalendarModal from '@/modal/CalendarModal.vue';
import { useAuthStore } from '@/stores/authStore';

const apiUrl = import.meta.env.VITE_API_URL;

const authStore = useAuthStore();

const searchTerm = ref('');
const isAddUserModalVisible = ref(false);
const isEmployeeDetailsModalVisible = ref(false);
const isCalendarModalVisible = ref(false);

const fetchedEmployees = ref([]);
const selectedEmployee = ref(null);
const selectedUser = ref(null);

const formData = reactive({
  first_name: '',
  last_name: '',
  email: '',
  birthdate: '',
  team: '',
  role: '',
  join_date: '',
  is_supervisor: false,
  is_admin: false,
  remaining_pto: 0,
});

const openAddUserModal = () => (isAddUserModalVisible.value = true);
const closeAddUserModal = () => {
  isAddUserModalVisible.value = false;
  resetFormData();
};

const openEmployeeDetailsModal = (employee) => {
  selectedEmployee.value = employee;
  isEmployeeDetailsModalVisible.value = true;
};
const closeEmployeeDetailsModal = () => {
  isEmployeeDetailsModalVisible.value = false;
  selectedEmployee.value = null;
};

const openCalendarModal = (user) => {
  selectedUser.value = user;
  isCalendarModalVisible.value = true;
};
const closeCalendarModal = () => {
  isCalendarModalVisible.value = false;
  selectedUser.value = null;
};

const handleFetchEmployees = async () => {
  try {
    const response = await axios.get(`${apiUrl}/accounts/${authStore.user.company_id}`);
    fetchedEmployees.value = response.data;
  } catch (err) {
    console.error('Error fetching employees:', err);
  }
};

handleFetchEmployees();

const filteredEmployees = computed(() =>
  fetchedEmployees.value.filter((employee) =>
    (employee.first_name + employee.last_name)
      .toLowerCase()
      .includes(searchTerm.value.toLowerCase())
  )
);
</script>
