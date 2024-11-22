<template>
    <div
      v-if="isVisible"
      class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
    >
      <div
        class="bg-white p-6 rounded shadow-lg max-w-4xl w-full relative overflow-y-auto"
        style="max-height: 90%"
      >
        <!-- Close Button -->
        <button
          @click="onClose"
          class="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>
  
        <!-- Title -->
        <h2 class="text-2xl font-bold mb-6 text-center">{{ $t('employeeDetails.title') }}</h2>
  
        <!-- Modal Content -->
        <div class="grid grid-cols-2 gap-6">
          <!-- Account Info -->
          <div>
            <h3 class="text-lg font-semibold mb-4">
              --- {{ $t('employeeDetails.accountInfo') }} ---
            </h3>
            <div class="space-y-3">
              <div>
                <label class="font-semibold block">{{ $t('employeeDetails.fields.firstName') }}</label>
                <input
                  type="text"
                  v-model="formData.firstName"
                  class="border w-full rounded px-2 py-1"
                />
              </div>
              <div>
                <label class="font-semibold block">{{ $t('employeeDetails.fields.lastName') }}</label>
                <input
                  type="text"
                  v-model="formData.lastName"
                  class="border w-full rounded px-2 py-1"
                />
              </div>
              <div>
                <label class="font-semibold block">{{ $t('employeeDetails.fields.email') }}</label>
                <input
                  type="email"
                  v-model="formData.email"
                  class="border w-full rounded px-2 py-1"
                />
              </div>
              <div>
                <label class="font-semibold block">{{ $t('employeeDetails.fields.dateOfBirth') }}</label>
                <input
                  type="date"
                  v-model="formData.dateOfBirth"
                  class="border w-full rounded px-2 py-1"
                />
              </div>
              <div>
                <label class="font-semibold block">{{ $t('employeeDetails.fields.team') }}</label>
                <select
                  v-model="formData.team"
                  class="border w-full rounded px-2 py-1"
                >
                  <option value="" disabled>{{ $t('employeeDetails.placeholders.selectTeam') }}</option>
                  <option v-for="team in teams" :key="team" :value="team">{{ team }}</option>
                </select>
              </div>
              <div>
                <label class="font-semibold block">{{ $t('employeeDetails.fields.supervisor') }}</label>
                <input
                  type="text"
                  v-model="formData.supervisor"
                  class="border w-full rounded px-2 py-1"
                />
              </div>
            </div>
          </div>
  
          <!-- Attendance Settings -->
          <div>
            <h3 class="text-lg font-semibold mb-4">
              --- {{ $t('employeeDetails.attendanceSettings') }} ---
            </h3>
            <div class="space-y-3">
              <div>
                <label class="font-semibold block">{{ $t('employeeDetails.fields.pto') }}</label>
                <input
                  type="number"
                  v-model="formData.pto"
                  class="border w-full rounded px-2 py-1"
                />
              </div>
              <div>
                <label class="font-semibold block">{{ $t('employeeDetails.fields.specialHolidays') }}</label>
                <textarea
                  v-model="formData.specialHolidays"
                  class="border w-full rounded px-2 py-1"
                  placeholder="{{ $t('employeeDetails.placeholders.specialHolidays') }}"
                ></textarea>
              </div>
              <div>
                <label class="font-semibold block">{{ $t('employeeDetails.fields.holidayType') }}</label>
                <input
                  type="text"
                  class="border w-full rounded px-2 py-1"
                  placeholder="{{ $t('employeeDetails.placeholders.holidayType') }}"
                />
                <button
                  class="bg-blue-500 text-white py-1 px-4 rounded mt-2 hover:bg-blue-600"
                >
                  {{ $t('employeeDetails.buttons.addHoliday') }}
                </button>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Footer Buttons -->
        <div class="flex justify-between mt-6">
          <button
            class="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600"
            @click="onSave"
          >
            {{ $t('employeeDetails.buttons.save') }}
          </button>
          <button
            class="bg-red-500 text-white py-2 px-6 rounded hover:bg-red-600"
            @click="onDelete"
          >
            {{ $t('employeeDetails.buttons.delete') }}
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits, ref } from 'vue';
  
  const props = defineProps({
    employee: {
      type: Object,
      required: true,
    },
    isVisible: {
      type: Boolean,
      required: true,
    },
  });
  
  const emit = defineEmits(['close', 'save', 'delete']);
  
  const onClose = () => emit('close');
  const onSave = () => emit('save', formData.value);
  const onDelete = () => emit('delete', formData.value);
  
  const teams = ref(['Team A', 'Team B', 'Team C']);
  const formData = ref({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    team: '',
    supervisor: '',
    pto: 0,
    specialHolidays: '',
  });
  </script>
  
  
  
  
  
  