<template>
  <div class="bg-white shadow p-4 rounded">
    <div class="flex justify-between items-center mb-4">
      <input
        type="text"
        :placeholder="$t('employeeList.searchPlaceholder')"
        v-model="searchTerm"
        class="border rounded p-2 w-1/2"
      />
      <button class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const searchTerm = ref('');
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
//add comment for pushing all the stuff
const filteredEmployees = computed(() =>
  employees.value.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
);
</script>

