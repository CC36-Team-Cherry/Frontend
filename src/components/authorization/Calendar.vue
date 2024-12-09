<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Left Section: Chart and Calendar -->
    <div class="flex-1 flex flex-col p-2">
      <!-- Chart and PTO Card -->
      <div class="grid grid-cols-3 justify-items-stretch gap-2 mb-2">
        <!-- Total Hours Worked Card -->
        <div class="bg-white shadow-sm border border-slate-200 rounded-lg p-2 pr-3 flex flex-row justify-evenly items-center ">
          <!-- Chart -->
          <div class="flex-1">
            <canvas ref="attendanceChart" class="w-full custom-chart-height" style="height: 80px;"></canvas>
          </div>
          <!-- Hours Worked Title -->
          <div>
            <div class="text-3xl text-slate-600">Total Worked</div>
            <div class="text-xs">Current Month</div>
          </div>
          <hr class="w-px h-10 border-l border-slate-300 mx-4">
          <!-- Hours Worked -->
          <div class="text-3xl text-slate-600"> {{ calculatedTotalHours.toFixed(2) }} Hrs</div>
        </div>
        <!-- OT Card -->
        <div class="bg-white shadow-sm border border-slate-200 rounded-lg p-2 flex flex-row justify-evenly items-center">
          <div>
            <div class="text-3xl text-slate-600">Overtime</div>
            <div class="text-xs">Current Month</div>
          </div>
          <hr class="w-px h-10 border-l border-slate-300 mx-4">
          <div class="text-3xl text-slate-600"> {{ extraHours }} Hrs</div>
        </div>
        <!-- PTO Card -->
        <div class="bg-white shadow-sm border border-slate-200 rounded-lg p-2 flex flex-row justify-evenly items-center">
          <div>
            <div class="text-3xl text-slate-600">Paid Time Off</div>
            <div class="text-xs">Total Remaining</div>
          </div>
          <hr class="w-px h-10 border-l border-slate-300 mx-4">
          <div class="text-3xl text-slate-600">{{ remainingPto }} Days</div>
        </div>
      </div>

      <!-- Calendar Section -->
      <div class="flex-1 bg-white shadow-sm border border-slate-200 rounded-lg p-4 overflow-y-auto">
        <div ref="calendar" class="h-full"></div>
      </div>
    </div>
    <!-- Right Sidebar -->
    <div class="bg-white shadow-sm border border-slate-200 rounded-lg p-2 flex flex-col" style="width: 240px; max-width: 240px;">
      <!-- Tabs --> 
      <div class="flex mb-3">
        <button
          @click="tab = 'attendance', attendanceType = 'general'"
          :class="{'bg-blue-500 text-white': tab === 'attendance', 'text-blue-500': tab !== 'attendance'}"
          class="px-4 py-2 text-sm font-bold flex-1 rounded"
        >
          Attendance
        </button>
        <button
          @click="tab = 'pto', attendanceType = 'pto'"
          :class="{'bg-blue-500 text-white': tab === 'pto', 'text-blue-500': tab !== 'pto'}"
          class="px-4 py-2 text-sm font-bold flex-1 rounded"
        >PTO</button>
      </div>

      <!-- Attendance Form Tab -->
      <div v-if="tab === 'attendance'">
        <div class="mb-3">
          <label class="block mb-1 font-bold text-sm">{{ $t('calendar.selection') }}</label>
          <input
            type="text"
            placeholder="YYYY-MM-DD - YYYY-MM-DD"
            v-model="selectionRange"
            class="border border-gray-300 rounded p-1 text-xs w-full"
          />
        </div>
        <div class="mb-3">
          <label class="block mb-1 font-bold text-sm">{{ $t('calendar.type') }}</label>
          <select v-model="attendanceType" class="border border-gray-300 rounded p-1 text-xs w-full">
            <option value="general">{{ $t('calendar.types.general') }}</option>
            <option value="absence">{{  $t('calendar.types.absence') }}</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="block mb-1 font-bold text-sm">{{  $t('calendar.startTime') }}</label>
          <input
            type="time"
            v-model="startTime"
            class="border border-gray-300 rounded p-1 text-xs w-full"
          />
        </div>
        <div class="mb-3">
          <label class="block mb-1 font-bold text-sm">{{ $t('calendar.endTime') }}</label>
          <input
            type="time"
            v-model="endTime"
            class="border border-gray-300 rounded p-1 text-xs w-full"
          />
        </div>
        <div class="mb-3">
  <label class="block mb-1 font-bold text-sm">{{ $t('calendar.breakTime') }}</label>
  <div class="flex gap-2 items-center">
    <!-- Hours Input -->
    <div class="flex items-center">
      <button 
        @click="decreaseBreakHours" 
        class="px-2 py-1 rounded border text-xs bg-gray-100 border-gray-300 hover:bg-blue-500 hover:text-white">
        -
      </button>
      <input 
        type="number"
        v-model="breakHours" 
        @input="validateHours"
        @focus="selectAll($event)" 
        class="no-spinner px-3 py-1 text-center border text-xs bg-white border-gray-300 w-10" 
        min="0" 
        max="23">
      <button 
        @click="increaseBreakHours" 
        class="px-2 py-1 rounded border text-xs bg-gray-100 border-gray-300 hover:bg-blue-500 hover:text-white">
        +
      </button>
      <span class="ml-1 text-sm">hr</span>
    </div>

    <!-- Minutes Input -->
    <div class="flex items-center">
      <button 
        @click="decreaseBreakMinutes" 
        class="px-2 py-1 rounded border text-xs bg-gray-100 border-gray-300 hover:bg-blue-500 hover:text-white">
        -
      </button>
      <input 
        type="number" 
        v-model="breakMinutes" 
        @input="validateMinutes"
        @focus="selectAll($event)" 
        class="no-spinner px-3 py-1 text-center border text-xs bg-white border-gray-300 w-10" 
        min="0" 
        max="59">
      <button 
        @click="increaseBreakMinutes" 
        class="px-2 py-1 rounded border text-xs bg-gray-100 border-gray-300 hover:bg-blue-500 hover:text-white">
        +
      </button>
      <span class="ml-1 text-sm">min</span>
    </div>
  </div>
</div>
        <button
          @click="logAttendance"
          :class="{'bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 w-full text-base mb-3' : isFormValid,
            'bg-gray-300 text-gray-500 py-1 px-3 rounded w-full cursor-not-allowed text-base mb-3' : !isFormValid
          }"
        >
          {{  $t('calendar.logAttendance') }}
        </button>
        <button 
          @click="deleteGeneralAttendance" 
          :class="{'bg-gray-500 text-gray-300 py-1 px-3 rounded w-full text-base mb-3 cursor-not-allowed': !selectionRange,
          'bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 w-full text-base mb-3': selectionRange}"
          :disabled="!selectionRange"
        >
          Clear Attendance
        </button>
      </div>

      <!-- PTO Tab -->
      <div v-if="tab === 'pto'">
        <div>
          <label class="block mb-1 font-bold text-sm">{{  $t('calendar.selection') }}</label>
          <input
            type="text"
            placeholder="YYYY-MM-DD - YYYY-MM-DD"
            v-model="selectionRange"
            class="border border-gray-300 rounded p-1 text-xs w-full mb-3"
          />
        </div>
        <div class="mb-3">
          <label class="block mb-1 font-bold text-sm">{{ $t('calendar.type') }}</label>
          <select v-model="attendanceType" class="border border-gray-300 rounded p-1 text-xs w-full">
            <option value="pto">{{ $t('calendar.types.pto') }}</option>
            <option value="halfpto">{{ $t('calendar.types.halfPto') }}</option>
            <optgroup v-if="specialPtos.length > 0" label="Special PTO">
              <option
                v-for="specialPto in specialPtos"
                :key="specialPto.id"
                :value="specialPto.attendanceType"
              >
                {{ specialPto.type }}
              </option>
            </optgroup>
          </select>
        </div>
        <div v-show="isHalfPtoSelected" class="mb-3">
          <label class="block mb-1 font-bold text-sm">{{  $t('calendar.startTime') }}</label>
          <input
            type="time"
            v-model="startTime"
            class="border border-gray-300 rounded p-1 text-xs w-full"
          />
        </div>
        <div v-show="isHalfPtoSelected" class="mb-3">
          <label class="block mb-1 font-bold text-sm">{{ $t('calendar.endTime') }}</label>
          <input
            type="time"
            v-model="endTime"
            class="border border-gray-300 rounded p-1 text-xs w-full"
            :disabled="isHalfPtoSelected"
          />
        </div>
        <div class="mb-3">
          <label class="block mb-1 font-bold text-sm">Supervisor</label>
          <select
            v-model="selectedSupervisorId"
            class="border border-gray-300 rounded p-1 text-xs w-full"
          >
            <option value="" disabled>Select Supervisor</option>
            <option
              v-for="supervisor in supervisors"
              :key="supervisor.id"
              :value="supervisor.id"
            >
              {{ supervisor.first_name + " " + supervisor.last_name }}
            </option>
          </select>
        </div>
        <div class="mb-3">
          <label class="block mb-1 font-bold text-sm">Memo</label>
          <input
            v-model="memo"
            type="text"
            placeholder="Optional Memo"
            class="border border-gray-300 rounded p-1 text-xs w-full"
          />
        </div>  
        <button
          @click="submitHandler"
          :class="{'bg-cyan-500 text-white py-1 rounded hover:bg-green-600 w-full text-base mb-3' : isSubmitFormValid, 
            'bg-gray-300 text-gray-500 py-1 px-3 rounded w-full cursor-not-allowed text-base mb-3': !isSubmitFormValid
          }"
          :disabled="!isSubmitFormValid"
        >
          Submit
        </button>
      </div>

      <!-- Monthly Submit Button -->
      <div class="flex flex-col items-start space-y-4 mt-auto">
        <div class="text-lg mt-auto">
          {{"Approval Status"}}
        </div>
        <div class="text-lg"> 
          {{ monthSubmitApprovalStatus }}
        </div>
        <button
          class="bg-green-500 text-white py-1 px-3 rounded hover:bg-gray-600 w-full text-lg mb-2 h-16"
          @click.stop="openSubmitMonthModal"
        >
          Monthly Submit
        </button>
      </div>

      <SubmitMonthModal 
        :isVisible="isSubmitMonthModalVisible"
        :supervisors="supervisors"
        :selectedSupervisorId="selectedSupervisorId"
        :memo="memo"
        @submit="submitMonthApproval"
        @close="closeSubmitMonthModal"
      />

    </div>
  </div>
</template>

<style scoped>
.custom-chart-height {
  height: 80px !important;
}
</style>

<script>
import { Calendar } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import enLocale from '@fullcalendar/core/locales/en-gb';
import jaLocale from '@fullcalendar/core/locales/ja';
import axios from 'axios';
import i18n from '../../i18n.ts';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/authStore';
import Chart from 'chart.js/auto';
import { ref } from 'vue';
import SubmitMonthModal from '@/modal/SubmitMonthModal.vue';
import { useToast } from "vue-toastification";
const toast = useToast();
const { t } = i18n.global;

const apiUrl = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

const totalHours = ref(0);
const selectedMonth = ref(null);
const currentUserAtten = ref(null);

export default {  
  components: {
    SubmitMonthModal,
  },  
  data() {
    return {
      calculatedTotalHours: totalHours,
      selectionRange: '',
      extraHours: 0,
      attendanceType: 'general',
      startTime: '',
      endTime: '',
      calendar: null,
      events: [],
      supervisors: [],
      selectedSupervisorId: null,
      memo: '',
      attendanceChart: null,          
      maxHours: 0,         
      selectedEventId: null,
      holidays: [], 
      locales: {
        'en-US': enLocale,
        'ja-JP': jaLocale,
      },
      specialPtos: [],
      selectedSpecialPtoType: '',
      remainingPto: null,
      tab: 'attendance',
      isSubmitMonthModalVisible: false,
      selectedBreakTime: null,
      breakHours: 0,
      breakMinutes: 0,
    };
  },
  computed: {
    isPtoSelected() {
      return this.attendanceType === 'pto' || this.attendanceType === 'Special PTO'
    },
    isHalfPtoSelected() {
      return this.attendanceType ==='halfpto'
    },
    isMonthSubmitSelected() {
      return this.attendanceType === 'monthSubmit'
    },
    isFormValid() {

      const isDateSelected = this.selectionRange !== '';
      const isAttendanceTypeSelected = this.attendanceType !== '';
      const isStartTimeSelected = this.startTime !== ''
      const isEndTimeSelected = this.endTime !== '';

      // Ensure all fields are filled
      return (
        isDateSelected &&  // Date range is selected
        isAttendanceTypeSelected &&  // Attendance type is selected
        isStartTimeSelected && 
        isEndTimeSelected
      )
    },
    isSubmitFormValid() {

      const isDateSelected = this.selectionRange !== '';
      const isAttendanceTypeSelected = this.attendanceType !== '';
      const isSupervisorSelected = this.selectedSupervisorId !== null;

      return (
        isDateSelected && 
        isAttendanceTypeSelected &&
        isSupervisorSelected
      )
    },
    monthSubmitApprovalStatus() {

      const authStore = useAuthStore();
      const requests = authStore.approvals.sent;
      console.log("monthSubmitApprovalStatus: ", requests)

      const selectedDate = new Date(selectedMonth.value);
      selectedDate.setDate(selectedDate.getDate() + 7);
      const currentMonth = selectedDate.getMonth() === 0 ? selectedDate.getMonth() + 1 : selectedDate.getMonth() + 1;
      const currentYear = selectedDate.getFullYear();
      
      const existingRequest = requests.find(request => {
        const [month, year] = request.date.split('-').map(Number); // Split date into month and year
        return year === currentYear && month === currentMonth;
      });

      // Return the status of the existing request if found, otherwise return 'No Request'
      if (existingRequest) {
        console.log("Existing Request Status:", existingRequest.status);
        return existingRequest.status;
      } else {
        console.log("No Request Found");
        return 'No Request'; // Return a default value when no request exists
      }
    }
  },

  mounted() {
  const authStore = useAuthStore();
  this.getSpecialPto();
  this.fetchRemainingPto();

  if (!authStore.user || !authStore.user.id) {
    console.error("User ID is not defined in authStore");
    return;
  }

  this.initializeChart();
  this.fetchSupervisors();
  this.holidays = this.generateJapaneseHolidays(new Date().getFullYear()); 

  const activeAccountSupervisorId = authStore.user.supervisor_id;
  console.log("store values", authStore.user)
  console.log("active account supervisor id", activeAccountSupervisorId)
  if (activeAccountSupervisorId) {
    this.selectedSupervisorId = activeAccountSupervisorId;
  }

  const calendarEl = this.$refs.calendar;
  const { locale } = useI18n();

  this.selectedDates = [];
  // Inizializzazione del calendario
  this.calendar = new Calendar(calendarEl, {
    plugins: [interactionPlugin, dayGridPlugin],
    initialView: 'dayGridMonth',
    locale: this.locales[locale.value],
    selectable: true,
    unselectAuto: false,
    businessHours: {
      daysOfWeek: [1, 2, 3, 4, 5], 
    },
    events: [...this.holidays, ...this.events], 
    editable: true,
    eventStartEditable: false,
    eventDurationEditable: false,
    select: (selectionInfo) => {
      const startDate = new Date(selectionInfo.startStr);
      const endDate = new Date(selectionInfo.endStr);
      const dates = [];

      while (startDate < endDate) {
        if (
          startDate.getDay() !== 0 &&
          startDate.getDay() !== 6 &&
          !this.isHoliday(startDate)
        ) {
          dates.push(new Date(startDate));
        }
        startDate.setDate(startDate.getDate() + 1);
      }

      this.selectionRange = dates
        .map((date) => date.toISOString().split('T')[0])
        .join(', ');
    },
    // eventClick: (info) => {
    //   this.handleEventClick(info.event);
    // },
    eventContent: (arg) => {
      if (arg.event.extendedProps.isHoliday) {
  return {
    html: `
      <div style="text-align: left; font-size: 1vw; color: black; background-color: rgba(255, 0, 0, 0.2); padding: .5vw; border-radius: 4px; width: 100%; word-wrap: break-word; white-space: normal;">
        <b>${arg.event.title}</b>
      </div>
    `,
  };
}

// Gestione degli eventi con orari di ingresso e uscita
if (arg.event.extendedProps.startTime && arg.event.extendedProps.endTime) {
    const breakTime = arg.event.extendedProps.breakTime
      ? `<small style="font-size: 0.8vw; color: gray;">Break: ${arg.event.extendedProps.breakTime}</small>`
      : '';
    return {
      html: `
        <div style="text-align: left; font-size: 1vw; color: black; background-color: ${arg.event.backgroundColor}; padding: .5vw; border-radius: 4px; width: 100%; word-wrap: break-word; white-space: normal;">
          <b>${arg.event.extendedProps.startTime} - ${arg.event.extendedProps.endTime}</b><br>
          ${breakTime}
        </div>
      `,
    };
  }

// Gestione degli eventi PTO
if (arg.event.extendedProps.status) {
  return {
    html: `
      <div style="text-align: center; font-size: 1vw; color: white; background-color: ${arg.event.backgroundColor}; padding: .5vw; border-radius: 4px; width: 100%; word-wrap: break-word; white-space: normal;">
        <b>${arg.event.title}</b><br><i>${arg.event.extendedProps.status}</i>
      </div>
    `,
  };
}

},
    datesSet: (info) => {
      console.log('Month changed:', info.start); 
      this.handleMonthChange(info.start); // Funzione per gestire il cambio mese
      selectedMonth.value = info.start;
    },
  });

  console.log(this.calendar);
  this.calendar.render();

  
  this.$watch(
    () => locale.value,
    async (newLocale) => {
      this.calendar.setOption('locale', this.locales[newLocale]);
    }
  );

  
  this.$watch(
    () => totalHours.value,
    (newTotalHour) => {
      if (newTotalHour !== null) this.updateChart();
    }
  );

  this.fetchAttendanceData(authStore.user.id);
  },
  watch: {
    // Watch for changes in the attendanceType
    attendanceType(newType) {
      if (newType === 'Special PTO') {
        // Find the corresponding special PTO from the list and set the selectedSpecialPtoType
        const selectedPto = this.specialPtos.find(p => p.attendanceType === this.attendanceType);
        if (selectedPto) {
          this.selectedSpecialPtoType = selectedPto.type;
        }
      } else {
        // If not a specialPto, clear the selectedSpecialPtoType
        this.selectedSpecialPtoType = '';
      }
    },
    startTime(newStartTime) {
      if (this.attendanceType === 'halfpto' && newStartTime) {
        this.setEndTimeFourHoursAhead();
      }
    },
    endTime(newEndTime) {
      if (this.attendanceType === 'halfpto' && newEndTime) {
        this.setStartTimeFourHoursBefore();
      }
    }
  },
  methods: {
  handleMonthChange(startDate) {
  
  const year = startDate.getFullYear();
  const month = startDate.getMonth() + 1; //for now i put +2 because it looks 2 months before every time
  console.log("year and month", year, month);

  this.maxHours = this.calculateMaxHours(year, month);
  console.log('Updated maxHours:', this.maxHours);
  
  totalHours.value = 0;
  const authStore = useAuthStore();
  this.fetchAttendanceData(authStore.user.id);
},

calculateMaxHours(year, month) {
    const daysInMonth = new Date(year, month, 0).getDate(); 
    console.log(daysInMonth);
    let workingDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day); 
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isHoliday = this.isHoliday(date); 

      if (!isWeekend && !isHoliday) {
        workingDays++;
      }
    }
    return workingDays * 8;
},

setEndTimeFourHoursAhead() {

    if (!this.startTime) return;

    // Parse the startTime into hours and minutes
    const [startHour, startMinute] = this.startTime.split(':').map(Number);
      
    // Add 4 hours to the start time
    let endHour = startHour + 4;
    let endMinute = startMinute;
    
    // Handle overflow if the hour exceeds 24 (e.g., 23:30 + 4 hours becomes 03:30 next day)
    if (endHour >= 24) {
      endHour -= 24; // Wrap around to the next day
    }

    // Format end time in "HH:MM" format
    this.endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
  },  
  setStartTimeFourHoursBefore() {
      if (!this.endTime) return;

      // Parse the endTime into hours and minutes
      const [endHour, endMinute] = this.endTime.split(':').map(Number);
      
      // Subtract 4 hours from the end time
      let startHour = endHour - 4;
      let startMinute = endMinute;

      // Handle underflow if the hour is less than 0 (e.g., 03:00 - 4 hours becomes 23:00 the previous day)
      if (startHour < 0) {
        startHour += 24; // Wrap around to the previous day
      }

      // Format start time in "HH:MM" format
      this.startTime = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;
  },
  isHoliday(date) {
    const formattedDate = date.toISOString().split('T')[0]; 
    return this.holidays.some((holiday) => holiday.start === formattedDate);
  },  
  initializeChart() {
     const ctx = this.$refs.attendanceChart?.getContext('2d');
     if (!ctx) {
      console.error('Canvas element not found for attendance chart');
      return;
    }

  console.log("Initializing chart with maxHours:", this.maxHours);

  this.attendanceChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      datasets: [
        {
          data: [0, this.maxHours], // Inizialmente: ore lavorate = 0, ore rimanenti = maxHours
          backgroundColor: ["#4caf50", "#e0e0e0"], // Verde chiaro per ore lavorate, grigio per ore rimanenti
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
      },
    },
  });
},

updateChart() {
  if (!this.attendanceChart) {
    console.error("Attendance chart is not initialized");
    return;
  }

  const workedHours = totalHours.value - (this.selectedBreakTime || 0) / 60;
  const extraHours = workedHours > this.maxHours ? workedHours - this.maxHours : 0; 
  const remainingHours = Math.max(this.maxHours - workedHours, 0); 

  console.log("Updating chart with data:", {
    workedHours,
    remainingHours,
    extraHours,
    maxHours: this.maxHours,
  });

  try {
    // Aggiorna i dati del grafico
    this.attendanceChart.data.datasets[0].data = [
      Math.max(workedHours - extraHours, 0), 
      remainingHours,           
      extraHours,               
    ];

    // Aggiorna i colori del grafico
    this.attendanceChart.data.datasets[0].backgroundColor = [
      "#4caf50", // Verde chiaro per ore lavorate
      "#e0e0e0", // Grigio per ore rimanenti
    ];

    this.extraHours = extraHours; // Mantieni la variabile per l'uso nella card
    this.attendanceChart.update();
    console.log("Chart updated successfully.");
  } catch (err) {
    console.error("Error updating chart:", err);
  }
},

async fetchAttendanceData(accountId) {
  try {
    const response = await axios.get(`${apiUrl}/accounts/${accountId}/attendance`);
    const response2 = await axios.get(`${apiUrl}/accounts/${accountId}/approvalsPTO`);

    currentUserAtten.value = response;

    const currentDate = this.calendar.getDate(); 
    const currentMonth = currentDate.getMonth() + 1; 
    const currentYear = currentDate.getFullYear();

    // Filtro per attendance del mese corrente
    const filteredAttendance = response.data.filter((record) => {
      const recordDate = new Date(record.day);
      return (
        recordDate.getMonth() + 1 === currentMonth &&
        recordDate.getFullYear() === currentYear
      );
    });

    // Mappatura degli eventi delle attendance
    const attendanceEvents = filteredAttendance.map((record) => {
      const startTime = record.punch_in ? record.punch_in.split('T')[1].slice(0, 5) : null;
      const endTime = record.punch_out ? record.punch_out.split('T')[1].slice(0, 5) : null;
      const totalHours = record.totalHours;
      const breakTime = record.break_amount ? `${record.break_amount} min` : "None";

      return {
        id: record.id,
        title: startTime && endTime ? `${startTime} - ${endTime}` : 'No Time Logged',
        start: record.day,
        backgroundColor: this.getEventColor(record), // Usa getEventColor per determinare il colore
        extendedProps: {
          startTime,
          endTime,
          totalHours,
          breakTime,
          attendanceType: record.absence ? "absence" : "general",
        },
      };
    });

    // Gestione delle PTO requests
    const ptoEvents = response2.data.approvalsSentData.map((pto) => {
      const title = `${pto.type}`;
      const backgroundColor = this.getEventColor(pto); // Usa getEventColor per determinare il colore

      return {
        id: pto.id,
        title: title,
        start: pto.date,
        backgroundColor: backgroundColor,
        extendedProps: {
          status: pto.status,
          memo: pto.memo,
          attendanceType: pto.type === "Special PTO" ? "Special PTO" : pto.type === "Half PTO" ? "halfpto" : "pto", // Aggiungi attendanceType
        },
      };
    });

      // Aggiungi gli eventi delle attendance e delle PTO al calendario
      this.events = [...attendanceEvents, ...ptoEvents];

    // Calcola il totale delle ore per le attendance
    const calculatedTotalHours = this.events.reduce((sum, event) => {
  const isAbsence = event.extendedProps?.attendanceType === 'absence';  // Check if the event is an absence
  const isPto = event.extendedProps?.attendanceType === 'pto';  // Check if the event is Full PTO
  const isHalfPto = event.extendedProps?.attendanceType === 'halfpto';  // Check if the event is Half PTO
  const isSpecialPto = event.extendedProps?.attendanceType === 'Special PTO';  // Check if the event is Special PTO

  if (isAbsence) return sum;

  if (isPto || isSpecialPto) {
    return sum + 8;  // Add 8 hours for Full PTO or Special PTO
  } else if (isHalfPto) {
    return sum + 4;  // Add 4 hours for Half PTO
  }

  // For general attendance, subtract the selected break time
  const eventTotalHours = (event.extendedProps?.totalHours || 0) - (this.selectedBreakTime || 0) / 60; 

  return sum + Math.max(eventTotalHours, 0); // Ensure no negative hours
}, 0);

      console.log("Calculated Total Hours:", calculatedTotalHours);

    if (!isNaN(calculatedTotalHours) && calculatedTotalHours >= 0) {
      totalHours.value = calculatedTotalHours;
    } else {
      console.error("Invalid total hours data:", calculatedTotalHours);
    }

      // Rimuove gli eventi esistenti e aggiunge quelli aggiornati
      this.calendar.getEvents().forEach((event) => event.remove());
      [...this.holidays, ...this.events].forEach((event) => this.calendar.addEvent(event));
    } catch (error) {
      console.error("Error fetching data:", error.response?.data || error.message);
    }
  },

// Usa la tua funzione esistente per determinare il colore
getEventColor(data) {
  if (data.absence) return 'red';  // Assenza
  if (data.status === "Approved") return 'blue';  // PTO completo
  if (data.special_pto) return 'green';  // PTO speciale
  if (data.status === "Pending") return 'gray';  // PTO parziale
  return 'lightblue';  // Colore di default
},

getEventTypeFromColor(color) {
  switch (color) {
    case 'red':
      return 'absence';
    case 'orange':
      return 'pto';
    case 'green':
      return 'specialPto';
    case 'yellow':
      return 'halfpto';
    default:
      return 'general';
  }
},
    handleEventClick(event) {
      if (event.extendedProps.isHoliday) return; 
      this.selectedEventId = event.id;
      this.selectionRange = event.start.toISOString().split('T')[0];
      this.startTime = event.extendedProps.startTime || '';
      this.endTime = event.extendedProps.endTime || '';
      this.attendanceType = this.getEventTypeFromColor(event.backgroundColor);

      console.log("attendanceType",attendanceType);
    },

    selectAll(event) {
    event.target.select();
  },
    validateHours() {
  if (this.breakHours === "" || this.breakHours === null) {
    this.breakHours = 0;
  } else if (this.breakHours > 23) {
    this.breakHours = 23;
  }
},

validateMinutes() {
  if (this.breakMinutes === "" || this.breakMinutes === null) {
    this.breakMinutes = 0;
  } else if (this.breakMinutes > 59) {
    this.breakMinutes = 59;
  }
},

increaseBreakHours() {
  if (this.breakHours === "" || this.breakHours === null) {
    this.breakHours = 0;
  } else if (this.breakHours < 23) {
    this.breakHours += 1;
  }
  this.updateSelectedBreakTime();
},

decreaseBreakHours() {
  if (this.breakHours > 0) {
    this.breakHours -= 1;
  } else {
    this.breakHours = 0;
  }
  this.updateSelectedBreakTime();
},

increaseBreakMinutes() {
  if (this.breakMinutes === "" || this.breakMinutes === null) {
    this.breakMinutes = 15;
  } else if (this.breakMinutes < 59) {
    this.breakMinutes += 15;
    if (this.breakMinutes > 59) {
      this.breakMinutes = 0;
    }
  }
  this.updateSelectedBreakTime();
},

decreaseBreakMinutes() {
  if (this.breakMinutes > 14) {
    this.breakMinutes -= 15;
  } else {
    this.breakMinutes = 0;
  }
  this.updateSelectedBreakTime();
},

updateSelectedBreakTime() {
  // Ensure breakHours and breakMinutes are numbers and calculate total time in minutes
  this.selectedBreakTime = (parseInt(this.breakHours, 10) || 0) * 60 + (parseInt(this.breakMinutes, 10) || 0);
},

  logAttendance() {
    const authStore = useAuthStore();
    const days = this.selectionRange.split(', ');

    const existingAttendance = currentUserAtten.value.data;

    const filteredDays = days.filter((day) => {
      const dayExists = existingAttendance.some(
        (record) => record.day === `${day}T00:00:00.000Z`
      );

      if (dayExists) {
        console.warn(`Attendance for ${day} already exists.`);
      }

      return !dayExists;
    });

    if (filteredDays.length === 0) {
      toast.warning(t('calendar.toast.attendanceWarning'));
      return;
    }

    if(this.startTime > this.endTime) {
      toast.warning(t('calendar.toast.invalidStartEndTimes'));
      return
    }

    const attendancePromises = filteredDays.map((day) => {
    const punchIn = `${day}T${this.startTime}:00Z`;
    const punchOut = `${day}T${this.endTime}:00Z`;

    
    const [startHour, startMinute] = this.startTime.split(':').map(Number);
    const [endHour, endMinute] = this.endTime.split(':').map(Number);


    let totalHours = 0;
    if (this.attendanceType === 'general') {
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;
      totalHours = (endTotalMinutes - startTotalMinutes - (this.selectedBreakTime || 0)) / 60;
    }
    // Aggiungi 8 ore se è PTO o Special PTO
    else if (this.attendanceType === 'pto' || this.attendanceType === 'specialPto') {
      totalHours = 8; // Per PTO e Special PTO aggiungi automaticamente 8 ore
    }
    // Aggiungi 4 ore se è Half PTO
    else if (this.attendanceType === 'halfpto') {
      totalHours = 4; // Per Half PTO aggiungi automaticamente 4 ore
    }
    // Se è Absence non aggiungere ore
    else if (this.attendanceType === 'absence') {
      totalHours = 0;
    }

    // Se le ore calcolate sono negative, impostale a 0
    totalHours = isNaN(totalHours) || totalHours < 0 ? 0 : totalHours;

    const attendanceData = {
      account_id: authStore.user.id,
      day: `${day}T00:00:00.000Z`,
      punch_in: punchIn,
      punch_out: punchOut,
      absence: this.attendanceType === 'absence',
      full_pto: this.attendanceType === 'pto',
      half_pto: this.attendanceType === 'halfpto',
      special_pto: this.attendanceType === 'specialPto',
      break_amount:  this.selectedBreakTime || 0,
      totalHours: totalHours, // Usa il valore calcolato per totalHours
    };

    if (this.selectedEventId) {
      
      return axios.put(
        `${apiUrl}/accounts/${authStore.user.id}/attendance/${this.selectedEventId}`,
        attendanceData
      );
    } else {
      
      return axios.post(
        `${apiUrl}/accounts/${authStore.user.id}/attendance`,
        attendanceData
      );
    }
  });

  Promise.all(attendancePromises)
    .then(() => {
      this.fetchAttendanceData(authStore.user.id);
      this.updateChart();
      this.clearForm();
      this.attendanceType = 'general';
    })
    .catch((error) => {
      console.error('Error logging attendance:', error.response?.data || error.message);
    });
},
deleteGeneralAttendance() {
  const authStore = useAuthStore();
  const days = this.selectionRange.split(', ');

  const existingAttendance = currentUserAtten.value.data;
  const attendanceToDelete = existingAttendance.filter((record) => {
  const isSelectedDay = days.some((day) => {
    const formattedDay = new Date(`${day}T00:00:00.000Z`).toISOString();
    return record.day === formattedDay;
  });
  return isSelectedDay && !record.absence && !record.full_pto && !record.half_pto && !record.special_pto;
});

  if (attendanceToDelete.length === 0) {
    toast.warning(t('calendar.toast.noAttDelete'));
    return;
  }

  const deletePromises = attendanceToDelete.map((record) => {
    return axios.delete(`${apiUrl}/accounts/attendance/${record.id}`);
  });

  Promise.all(deletePromises)
    .then(() => {
      toast.success(t('calendar.toast.attDeleted'));

      this.fetchAttendanceData(authStore.user.id);
      this.updateChart();
      this.clearForm();
    })
    .catch((err) => {
      console.error('Error deleting attendance records:', err.response?.data || err.message)
    });
},
    generateJapaneseHolidays(year) {
      return [
        { title: "New Year's Day", start: `${year}-01-01`, isHoliday: true },
        { title: 'Coming of Age Day', start: `${year}-01-08`, isHoliday: true },
        { title: 'National Foundation Day', start: `${year}-02-11`, isHoliday: true },
        { title: "Emperor's Birthday", start: `${year}-02-23`, isHoliday: true },
        { title: 'Spring Equinox', start: `${year}-03-21`, isHoliday: true },
        { title: 'Showa Day', start: `${year}-04-29`, isHoliday: true },
        { title: 'Constitution Memorial Day', start: `${year}-05-03`, isHoliday: true },
        { title: 'Greenery Day', start: `${year}-05-04`, isHoliday: true },
        { title: "Children's Day", start: `${year}-05-05`, isHoliday: true },
        { title: 'Marine Day', start: `${year}-07-15`, isHoliday: true },
        { title: 'Mountain Day', start: `${year}-08-11`, isHoliday: true },
        { title: 'Autumn Equinox', start: `${year}-09-23`, isHoliday: true },
        { title: 'Sports Day', start: `${year}-10-14`, isHoliday: true },
        { title: 'Culture Day', start: `${year}-11-03`, isHoliday: true },
        { title: 'Labor Thanksgiving Day', start: `${year}-11-23`, isHoliday: true },
        { title: 'Christmas Holiday', start: `${year}-12-28`, isHoliday: true },
        { title: 'Christmas Holiday', start: `${year}-12-29`, isHoliday: true },
        { title: 'Christmas Holiday', start: `${year}-12-30`, isHoliday: true },
        { title: 'Christmas Holiday', start: `${year}-12-31`, isHoliday: true },
        { title: 'Christmas Holiday', start: `2025-01-01`, isHoliday: true },
        { title: 'Christmas Holiday', start: `2025-01-02`, isHoliday: true },
        { title: 'Christmas Holiday', start: `2025-01-03`, isHoliday: true }
      ];
    },
    isHoliday(date) {
      const formattedDate = date.toISOString().split('T')[0];
      return this.holidays.some((holiday) => holiday.start === formattedDate);
    },
    clearForm() {
      this.selectionRange = '';
      this.attendanceType = '';
      this.startTime = '';
      this.endTime = '';
      this.selectedEventId = null;
      this.selectedBreakTime = null;
      this.breakHours = 0;
      this.breakMinutes = 0;
    },
    async fetchSupervisors() {
      const authStore = useAuthStore();
      try {
        const response = await axios.get(`${apiUrl}/supervisors`);
        this.supervisors = response.data.filter(supervisor => supervisor.id !== authStore.user.id);;
      } catch (err) {
        console.error('Error fetching supervisors:', err);
      }
    },
    async submitHandler() {

      const authStore = useAuthStore();
      const requests = authStore.approvals;

       // Check if PTO or HalfPTO is being requested and remainingPto is 0
      if ((this.attendanceType === "pto" || this.attendanceType === "halfpto") && this.remainingPto <= 0) {
        toast.warning(t('calendar.toast.notEnoughPTO'));
        return; 
      }

      switch (this.attendanceType) {

        case "pto":

          const selectedPtoDates = this.selectionRange.split(', ');

          // const ptoDay = new Date(this.selectionRange).toISOString();

          try {

            for (let day of selectedPtoDates) {
              const ptoApproval = {
              account_id: authStore.user.id,
              supervisor_id: this.selectedSupervisorId,
              content: this.memo,
              status: 'Pending',
              day: new Date(day).toISOString(), 
              all_day: true,
              }      
              const response = await axios.post(`${apiUrl}/approvals/pto`, ptoApproval);
              
            }

            // Update remainingPto after PTO request submission
            this.remainingPto -= selectedPtoDates.length; // Subtract the number of PTO days requested

          } catch (err) {
            console.error('Error submitting pto approval: ', err)
          }
        break;

        case "halfpto":

          const selectedHalfPtoDates = this.selectionRange.split(', ');

          if (selectedHalfPtoDates.length > 1) {
            toast.warning(t('calendar.toast.halfRequest'));
            console.error("Half PTO request cannot be submitted for multiple dates");
            return
}

          const halfPtoDate = new Date(this.selectionRange);
          const halfPtoDay = halfPtoDate.toISOString();
          const halfPtoStartTime = new Date(`${this.selectionRange}T${this.startTime}:00.000Z`).toISOString();
          const halfPtoEndTime = new Date(`${this.selectionRange}T${this.endTime}:00.000Z`).toISOString();

          const halfPtoApproval = {
            account_id: authStore.user.id,
            supervisor_id: this.selectedSupervisorId,
            content: this.memo,
            status: 'Pending',
            day: halfPtoDay, 
            all_day: false,
            hour_start: halfPtoStartTime,
            hour_end: halfPtoEndTime
          }

          try {
            
            const response = await axios.post(`${apiUrl}/approvals/pto`, halfPtoApproval);
        
            this.remainingPto -= 0.5; // Subtract half a day for a half PTO request

          } catch (err) {
            console.error('Error submitting pto approval: ', err)
          }

        break;

        case "Special PTO":
          
          const selectedSpecialPtoDates = this.selectionRange.split(', ');

          if (selectedSpecialPtoDates.length > 1) {
            toast.warning(t('calendar.toast.specialRequest'));
            console.error("Special PTO request cannot be submitted for multiple dates");
            return
          }

          const specialPtoDay = new Date(this.selectionRange).toISOString();
          
          const specialPtoApproval = {
            account_id: authStore.user.id,
            supervisor_id: this.selectedSupervisorId,
            content: this.memo,
            status: 'Pending',
            day: specialPtoDay, 
            type: this.selectedSpecialPtoType,
          }
                
          try {
            await axios.post(`${apiUrl}/approvals/specialPto`, specialPtoApproval);
          } catch (err) {
            console.error('Error submitting pto approval: ', err)
          }
        break

        default:
          console.log("Unkown attendance type");
      }    
      
      try {
        const response = await axios.get(`${apiUrl}/accounts/${authStore.user.id}/approvals`);
        requests.sent = response.data.approvalsSentData;
        requests.received = response.data.approvalsReceivedData;
        authStore.setApprovals(response.data.approvalsSentData, response.data.approvalsReceivedData);
        
        this.fetchAttendanceData(authStore.user.id);
        this.updateChart();
        this.clearForm();

      } catch (err) {
        console.error('Error fetching approvals:', err);
      }



    //   Promise.all(attendancePromises)
    //     .then(() => {
      
    //   this.fetchAttendanceData(authStore.user.id);
    //   this.updateChart();
    //   this.clearForm();
    // })
    // .catch((error) => {
    //   console.error('Error logging attendance:', error.response?.data || error.message);
    // });

    },
    // Submit handler for general attendance
    async submitMonthApproval({ supervisorId, memo }) {

      const authStore = useAuthStore();

      const selectedDate = new Date(selectedMonth.value);
      selectedDate.setDate(selectedDate.getDate() + 7);
      // const currentMonth = selectedDate.getMonth() + 1;
      const currentMonth = selectedDate.getMonth() === 0 ? selectedDate.getMonth() + 1 : selectedDate.getMonth() + 1;
      const currentYear = selectedDate.getFullYear();

      // Check if a request already exists for the selected month and year
      const requests = authStore.approvals.sent;
      // console.log("requests", requests)
      const existingRequest = requests.find(request => {
        const [month, year] = request.date.split('-').map(Number); // Split date into month and year
        return year === currentYear && month === currentMonth;
      });

      console.log("selected date :", selectedDate)
      console.log("current month :", currentMonth)
      console.log("current month :", currentYear)
      console.log("existing request :", existingRequest)

      if (existingRequest) {
        toast.error(t('calendar.toast.alreadySubmittedMonth'));
        return;
      }

      const generalApproval = {
        account_id: authStore.user.id,
        supervisor_id: supervisorId,
        month: currentMonth,
        year: currentYear,
        content: memo,
        status: 'Pending',
      };

    try {
      await axios.post(`${apiUrl}/approvals/monthAttendance`, generalApproval);
      const response = await axios.get(`${apiUrl}/accounts/${authStore.user.id}/approvals`);
      requests.sent = response.data.approvalsSentData;
      authStore.setApprovals(response.data.approvalsSentData);

      // Close the modal on success
      this.closeSubmitMonthModal();

      // Optionally, show a success message or update the state
      toast.success(t('calendar.toast.submittedMonth'));
    } catch (err) {
      console.error('Error submitting month approval request:', err);
      toast.error(t('calendar.toast.submitMonthFail'));
    }
  },
    async getSpecialPto() {

      const authStore = useAuthStore();

    try {
      const response = await axios.get(`${apiUrl}/accounts/${authStore.user.id}/specialPto`);
      this.specialPtos = response.data.map(specialPto => ({
        ...specialPto,
        attendanceType: "Special PTO"
      }));
    } catch(err) {
      console.error('Error fetching special pto:', err);
    }
  },
  async fetchRemainingPto() {

    const authStore = useAuthStore();

    try {
      const response = await axios.get(`${apiUrl}/accounts/${authStore.user.id}/remainingPto`);
      this.remainingPto = response.data.remaining_pto;
      console.log("frontend response for pto: ", response.data)
    } catch(err) {
      console.error('Error fetching remaining PTO: ', err);
    }
  },
  openSubmitMonthModal() {
    console.log("passing")
    this.isSubmitMonthModalVisible = true;
    this.fetchSupervisors();
  },
  closeSubmitMonthModal() {
    this.isSubmitMonthModalVisible = false;
    this.memo = '';
  },
 },
};

</script>
