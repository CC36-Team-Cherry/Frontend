<template>
  <div v-if="isVisible" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <div class="bg-white p-6 rounded shadow-lg max-w-4xl w-full relative overflow-y-auto" style="max-height: 90%">
      <!-- Close Button -->
      <button @click="onClose" class="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
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
              <input type="text" v-model="formData.first_name"
                class="border w-full rounded px-2 py-1" />
            </div>
            <div>
              <label class="font-semibold block">{{ $t('employeeDetails.fields.lastName') }}</label>
              <input type="text" v-model="formData.last_name"
                class="border w-full rounded px-2 py-1" />
            </div>
            <div>
              <label class="font-semibold block">{{ $t('employeeDetails.fields.email') }}</label>
              <input type="email" v-model="formData.email"
                class="border w-full rounded px-2 py-1" />
            </div>
            <div>
              <label class="font-semibold block">{{ $t('employeeDetails.fields.dateOfBirth') }}</label>
              <input type="date" v-model="formData.birthdate" class="border w-full rounded px-2 py-1" />
            </div>
            <div>
              <label class="font-semibold block">{{ $t('employeeDetails.fields.team') }}</label>
              <select v-model="formData.team_id" class="border rounded p-2 w-full">
              <option value="" disabled>{{ $t('employeeDetails.placeholders.selectTeam') }}</option>
              <option v-for="team in teams" :key="team.id" :value="team.id">{{ team.team_name }}</option>
            </select>
            </div>
            <div>
              <label class="font-semibold block">{{ $t('employeeDetails.fields.supervisor') }}</label>
              <input type="text" v-model="formData.supervisor"
                class="border w-full rounded px-2 py-1" />
            </div>
            <div>
              <label class="font-semibold block">Role</label>
              <input type="text" v-model="formData.role"
                class="border w-full rounded px-2 py-1" />
            </div>
            <div>
              <label class="font-semibold block">Join Date</label>
              <input type="date" v-model="formData.join_date"
                class="border w-full rounded px-2 py-1" />
            </div>
            <div>
              <label class="font-semibold block">Leave Date</label>
              <input type="date" v-model="formData.leave_date" 
              class="border w-full rounded px-2 py-1" />
            </div>
            <div>
              <input type="checkbox" v-model="formData.is_supervisor"> Supervisor
              <input type="checkbox" v-model="formData.is_admin"> Admin
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
                  :placeholder="employee.PTO?.remaining_pto || 0"
                  class="border w-full rounded px-2 py-1"
                />
              </div>
              <div>
                <label class="font-semibold block">{{ $t('employeeDetails.fields.specialHolidays') }}</label>
                <div>
                    <ul class="flex flex-col">
                        <li 
                            v-for="(specialPto, index) in specialPto" 
                            :key="specialPto.id"
                            class="flex justify-around"
                        >
                            <input
                                v-if="editingIndex === index"
                                v-model="specialPto[index].type"
                                @blur="stopEditing"
                                @keyup.enter="stopEditing"
                            />
                            <span 
                                v-else
                            >
                            {{ specialPto.type }}</span>
                            <button 
                                @click="startEditing(index)" 
                                v-if="editingIndex !== index"
                                class="border-2"
                            >
                                Edit
                            </button>
                            <button 
                                @click="deleteSpecialPto(specialPto.id)"
                                class="border-2"
                            >
                                Delete
                            </button>
                        </li>
                    </ul>
                    <div class="flex justify-around">
                        <input
                            v-model="newSpecialPto"
                            type="text"
                            placeholder="Enter Special PTO"
                            class="border-2"
                        />
                        <button
                            @click="addSpecialPto"
                            class="border-2"
                            type="button"
                        >
                            Add
                        </button>
                    </div>
                </div>
              </div>
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
              <input type="number" v-model="formData.remaining_pto"
                class="border w-full rounded px-2 py-1" />
            </div>
            <div>
              <label class="font-semibold block">{{ $t('employeeDetails.fields.specialHolidays') }}</label>
              <textarea v-model="formData.special_holidays" class="border w-full rounded px-2 py-1"
                placeholder="{{ $t('employeeDetails.placeholders.specialHolidays') }}"></textarea>
            </div>
            <div>
              <label class="font-semibold block">{{ $t('employeeDetails.fields.holidayType') }}</label>
              <input type="text" class="border w-full rounded px-2 py-1"
                placeholder="{{ $t('employeeDetails.placeholders.holidayType') }}" />
              <button class="bg-blue-500 text-white py-1 px-4 rounded mt-2 hover:bg-blue-600">
                {{ $t('employeeDetails.buttons.addHoliday') }}
              </button>
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
import { defineProps, defineEmits, ref, reactive, onMounted } from 'vue';

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
});

  const specialPto = ref([]);
  const newSpecialPto = ref('');

  const getSpecialPto = async () => {
    try {
      const response = await axios.get(`${apiUrl}/accounts/${props.employee.id}/specialPto`);
      console.log(response.data);
      specialPto.value = response.data;
    } catch(err) {
      console.error('Error fetching special pto:', err);
    }
  }

  // Add new special PTO 
  const addSpecialPto = async () => {
    try {
      // const newSpecialPto = newSpecialPto.value;
      console.log(newSpecialPto.value)
      const response = await axios.post(`${apiUrl}/accounts/${props.employee.id}/specialPto`, 
        {content: newSpecialPto.value}
      );

      // TODO: Confirm if correct
      specialPto.value.push({type: newSpecialPto.value, // The content of the new special PTO
        });

      console.log('New special pto saved', toRaw(response));

      // Reset input 
      newSpecialPto.value = ''; 

    } catch (err) {
      console.error(err);
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
  formData.leave_date = new Date(props.employee.leave_date).toISOString().split('T')[0];
  formData.is_admin = Boolean(props.employee.Privileges.is_admin);
  formData.is_supervisor = Boolean(props.employee.Privileges.is_supervisor);
  formData.team_id = props.employee.team_id;
  
      // Get special pto for selected user
    getSpecialPto();

    if (props.employee.birthdate) {
      formData.dateOfBirth = props.employee.birthdate.split('T')[0];
    }
    if (props.employee.PTO.remaining_pto) {
      formData.pto = Number(props.employee.PTO.remaining_pto);
    }
  });
  </script>
