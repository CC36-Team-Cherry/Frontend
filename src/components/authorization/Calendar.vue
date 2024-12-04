<template>
  <div class="p-4 bg-gray-100 h-full">
    <!-- Header Section -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
      <!-- Left column for form inputs and chart -->
      <div class="md:col-span-8">
        <div class="grid grid-cols-1 gap-4 mb-4">
          <!-- Selection -->
          <div>
            <label class="block mb-1 font-bold text-xs">{{ $t('calendar.selection') }}</label>
            <input
              type="text"
              placeholder="YYYY-MM-DD - YYYY-MM-DD"
              v-model="selectionRange"
              class="border border-gray-300 rounded p-1 text-xs w-full"
            />
          </div>
          <!-- Type -->
          <div>
            <label class="block mb-1 font-bold text-xs">{{ $t('calendar.type') }}</label>
            <select v-model="attendanceType" class="border border-gray-300 rounded p-1 text-xs w-full">
              <option value="" disabled>Select Type</option>
              <option value="general">{{ $t('calendar.types.general') }}</option>
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
              <option value="absence">{{ $t('calendar.types.absence') }}</option>
            </select>
          </div>

          <!-- Start Time -->
          <div>
            <label class="block mb-1 font-bold text-xs">{{ $t('calendar.startTime') }}</label>
            <input
              type="time"
              v-model="startTime"
              class="border border-gray-300 rounded p-1 text-xs w-full"
              :disabled="isPtoSelected"
            />
          </div>

          <!-- End Time -->
          <div>
            <label class="block mb-1 font-bold text-xs">{{ $t('calendar.endTime') }}</label>
            <input
              type="time"
              v-model="endTime"
              class="border border-gray-300 rounded p-1 text-xs w-full"
              :disabled="isPtoSelected"
            />
          </div>

          <!-- Attendance -->
          <div>
            <label class="block mb-1 font-bold text-xs">{{ $t('calendar.attendance') }}</label>
            <button
              @click="logAttendance"
              :disabled="isPtoSelected || isHalfPtoSelected"
              :class="{
                'bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 w-full text-xs' : !isPtoSelected || !isHalfPtoSelected,
                'bg-gray-300 text-gray-500 py-1 px-3 rounded w-full cursor-not-allowed text-xs' : isPtoSelected || isHalfPtoSelected
                }"
              >
              <!-- TODO: Need to update calendar update attendance -->
              {{ selectedEventId ? "Update Attendance" : $t('calendar.logAttendance') }}
            </button>
          </div>

          <!-- Supervisor and Memo -->
          <div>
            <div>
              <label class="block mb-1 font-bold text-xs">{{ "Supervisor" }}</label>
              <select 
                v-model="selectedSupervisorId" 
                class="border border-gray-300 rounded p-1 text-xs w-full"
              >
                <option value="" disabled>Select Supervisor</option>
                <option 
                  v-for="supervisor in supervisors" 
                  :key="supervisor.id" 
                  :value="supervisor.id">
                  {{ supervisor.first_name + supervisor.last_name }}
                </option>
              </select>
            </div>
            <input
              v-model="memo"
              type="text"
              placeholder="Optional Memo"
              class="border-2 text-xs p-1 w-full"
            />
            <div>
              <label class="block mb-1 font-bold text-xs">{{ "Submit" }}</label>
              <button
                @click="submitHandler"
                class="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 w-full text-xs"
              >
                {{ "Submit" }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right column for PTO card and chart -->
      <div class="md:col-span-4 flex flex-col gap-4">
        <!-- PTO Card Section (above the calendar) -->
        <div class="relative flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg w-full p-3">
          <div class="mx-3 mb-0 border-b border-slate-200 pt-2 pb-1 px-1">
            <span class="text-xs text-slate-600 font-medium">
              PTO
            </span>
          </div>
          <div class="p-2">
            <p class="text-slate-600 leading-normal text-xs font-light">
              {{ remainingPto }}
            </p>
          </div>
        </div>

        <!-- Chart Section (moved above the calendar) -->
        <div class="mb-2 ml-20">
          <!-- Aggiungi una classe per la chart -->
          <canvas ref="attendanceChart" class="custom-chart-height w-full"></canvas>
        </div>
      </div>
    </div>

    <!-- Calendar Section -->
    <div class="mt-4 md:col-span-12 bg-white shadow-sm border border-slate-200 rounded-lg p-2">
      <div ref="calendar"></div>
    </div>
  </div>
</template>

<style scoped>
  /* Imposta altezza più piccola per la chart */
  .custom-chart-height {
    height: 250px !important; /* Altezza definitiva per la chart */
  }
</style>



<script>
import { Calendar } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import enLocale from '@fullcalendar/core/locales/en-gb';
import jaLocale from '@fullcalendar/core/locales/ja';
import axios from 'axios';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/authStore';
import Chart from 'chart.js/auto';
import { ref } from 'vue';

const apiUrl = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

const totalHours = ref(0);
const selectedMonth = ref(null);

export default {
  
  name: 'FullCalendarComponent',
  data() {
    return {
      selectionRange: '',
      attendanceType: '',
      startTime: '',
      endTime: '',
      calendar: null,
      events: [],
      supervisors: [],
      selectedSupervisorId: '',
      memo: '',
      attendanceChart: null,          
      maxHours: 160,         
      selectedEventId: null,
      holidays: [], 
      locales: {
        'en-US': enLocale,
        'ja-JP': jaLocale,
      },
      specialPtos: [],
      selectedSpecialPtoType: '',
      remainingPto: null,
    };
  },
  computed: {
    isPtoSelected() {
      return this.attendanceType === 'pto' || this.attendanceType === 'Special PTO'
    },
    isHalfPtoSelected() {
      return this.attendanceType ==='halfpto'
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
  

  const activeAccountSupervisor = authStore.user.supervisor_id;
  if (activeAccountSupervisor) {
    this.selectedSupervisorId = activeAccountSupervisor;
  }

  const calendarEl = this.$refs.calendar;
  const { locale } = useI18n();

  // Inizializzazione del calendario
  this.calendar = new Calendar(calendarEl, {
    plugins: [interactionPlugin, dayGridPlugin],
    initialView: 'dayGridMonth',
    locale: this.locales[locale.value],
    selectable: true,
    //showNonCurrentDates: false,
    businessHours: {
      daysOfWeek: [1, 2, 3, 4, 5], 
    },
    events: [...this.holidays, ...this.events], 
    editable: true,
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
    eventClick: (info) => {
      this.handleEventClick(info.event);
    },
    eventContent: (arg) => {
      if (arg.event.extendedProps.isHoliday) {
        return {
          html: `
            <div style="text-align: center; font-size: 0.9em; color: black; background-color: rgba(255, 0, 0, 0.2); padding: 10px; border-radius: 4px;">
              <b>${arg.event.title}</b>
            </div>
          `,
        };
      }
      if (arg.event.extendedProps.startTime && arg.event.extendedProps.endTime) {
        return {
          html: `
            <div style="text-align: center; font-size: 0.9em; color: black; background-color: ${
              arg.event.backgroundColor
            }; padding: 0px; border-radius: 4px;">
              <b>${arg.event.extendedProps.startTime} - ${arg.event.extendedProps.endTime}</b>
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
  console.log('Handling month change:', startDate);


  const year = startDate.getFullYear();
  const month = startDate.getMonth() + 1;

  this.maxHours = this.calculateMaxHours(year, month);
  console.log('Updated maxHours:', this.maxHours);

  
  totalHours.value = 0;

 
  const authStore = useAuthStore();
  this.fetchAttendanceData(authStore.user.id);
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

  
  calculateMaxHours(year, month) {
    const daysInMonth = new Date(year, month, 0).getDate(); 
    let workingDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month , day); 
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isHoliday = this.isHoliday(date); 

      if (!isWeekend && !isHoliday) {
        workingDays++;
      }
    }

    return workingDays * 8;
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

  this.attendanceChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Worked Hours', 'Remaining Hours', 'Overworked'],
      datasets: [
        {
          data: [totalHours.value, this.maxHours, this.extraHours], 
          backgroundColor: ['#4caf50', '#e0e0e0', '#1b5e20'], 
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
      },
    },
  });
  console.log('Chart initialized successfully');
},

updateChart() {
  if (!this.attendanceChart) {
    console.error('Attendance chart is not initialized');
    return;
  }

  const workedHours = totalHours.value;
  const extraHours = workedHours > this.maxHours ? workedHours - this.maxHours : 0; 
  const remainingHours = Math.max(this.maxHours - workedHours, 0); 

  try {
    
    this.attendanceChart.data.datasets[0].data = [
      workedHours - extraHours, 
      remainingHours,           
      extraHours,               
    ];

    
    this.attendanceChart.data.datasets[0].backgroundColor = [
      '#4caf50', 
      '#e0e0e0', 
      '#1b5e20', 
    ];

    
    this.attendanceChart.update();

    console.log('Chart updated successfully with:', {
      workedHours,
      remainingHours,
      extraHours,
    });
  } catch (err) {
    console.error('Error updating chart:', err);
  }
},
async fetchAttendanceData(accountId) {
  try {
    const response = await axios.get(`${apiUrl}/accounts/${accountId}/attendance`);

    console.log("Response data:", response.data); 
    
    const currentDate = this.calendar.getDate(); 
    const currentMonth = currentDate.getMonth() + 1; 
    const currentYear = currentDate.getFullYear();

    
    const filteredAttendance = response.data.filter((record) => {
      const recordDate = new Date(record.day);
      return (
        recordDate.getMonth() + 1 === currentMonth &&
        recordDate.getFullYear() === currentYear
      );
    });
    
    this.events = filteredAttendance.map((record) => {
      const startTime = record.punch_in ? record.punch_in.split('T')[1].slice(0, 5) : null;
      const endTime = record.punch_out ? record.punch_out.split('T')[1].slice(0, 5) : null;

      let totalHours = 0;
      if (startTime && endTime) {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);


        totalHours = (endHour * 60 + endMinute - (startHour * 60 + startMinute)) / 60;

        
        if (totalHours < 0) {
          totalHours = 0;
        }
      }

      return {
        id: record.id,
        title: startTime && endTime ? `${startTime} - ${endTime}` : 'No Time Logged',
        start: record.day,
        backgroundColor: this.getEventColor(record),
        extendedProps: {
          startTime,
          endTime,
          totalHours,
        },
      };
    });

    
    const calculatedTotalHours = this.events.reduce(
      (sum, event) => sum + (event.extendedProps?.totalHours || 0),
      0
    );

    console.log("Calculated Total Hours:", calculatedTotalHours);

    if (!isNaN(calculatedTotalHours) && calculatedTotalHours >= 0) {
      totalHours.value = calculatedTotalHours; 
      console.log("Updated totalHours:", totalHours.value);
    } else {
      console.error("Invalid total hours data:", calculatedTotalHours);
    }

    
    this.calendar.getEvents().forEach((event) => event.remove());
    [...this.holidays, ...this.events].forEach((event) => this.calendar.addEvent(event));
  } catch (error) {
    console.error("Error fetching attendance records:", error.response?.data || error.message);
  }
}
,

    handleEventClick(event) {
      if (event.extendedProps.isHoliday) return; 
      this.selectedEventId = event.id;
      this.selectionRange = event.start.toISOString().split('T')[0];
      this.startTime = event.extendedProps.startTime || '';
      this.endTime = event.extendedProps.endTime || '';
      this.attendanceType = this.getEventTypeFromColor(event.backgroundColor);
    },
  logAttendance() {
    const authStore = useAuthStore();
    const days = this.selectionRange.split(', ');

    const attendancePromises = days.map((day) => {
    const punchIn = `${day}T${this.startTime}:00Z`;
    const punchOut = `${day}T${this.endTime}:00Z`;

    
    const [startHour, startMinute] = this.startTime.split(':').map(Number);
    const [endHour, endMinute] = this.endTime.split(':').map(Number);

    
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    const totalHours = (endTotalMinutes - startTotalMinutes) / 60;
    
    const attendanceData = {
      account_id: authStore.user.id,
      day: `${day}T00:00:00.000Z`,
      punch_in: punchIn,
      punch_out: punchOut,
      absence: this.attendanceType === 'absence',
      full_pto: this.attendanceType === 'pto',
      half_pto: this.attendanceType === 'halfpto',
      special_pto: this.attendanceType === 'specialPto',
      break_amount: 0,
      totalHours: isNaN(totalHours) || totalHours < 0 ? 0 : totalHours,
    };

    console.log('Attendance Data:', attendanceData);
    console.log(totalHours);

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
    })
    .catch((error) => {
      console.error('Error logging attendance:', error.response?.data || error.message);
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
      ];
    },
    isHoliday(date) {
      const formattedDate = date.toISOString().split('T')[0];
      return this.holidays.some((holiday) => holiday.start === formattedDate);
    },
    getEventColor(data) {
      if (data.absence) return 'red';
      if (data.full_pto) return 'orange';
      if (data.special_pto) return 'green';
      if (data.half_pto) return 'yellow';
      return 'lightblue';
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
    clearForm() {
      this.selectionRange = '';
      this.attendanceType = '';
      this.startTime = '';
      this.endTime = '';
      this.selectedEventId = null;
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

      const selectedDate = new Date(selectedMonth.value);
      const currentMonth = (selectedDate.getMonth() + 1);
      const currentYear = selectedDate.getFullYear();
      const nextMonth = currentMonth === 12 ? 12 : currentMonth + 1;

      // Check if a request already exists for the selected month and year
      const existingRequest = requests.sent.find(request => {
        const [month, year] = request.date.split(' / ').map(Number);  // Split date into month and year
        return year === currentYear && month === nextMonth;
      });

      if (existingRequest) {
        // If an approval request already exists, show a message and prevent submission
        alert('A request for this month has already been submitted for approval.');
        return; // Exit the function without submitting the new request
      }

      switch (this.attendanceType) {

        case "general":    

          const generalApproval = {
            account_id: authStore.user.id,
            supervisor_id: this.selectedSupervisorId,
            month: nextMonth,
            year: currentYear,
            content: this.memo,
            status: 'Pending',
          };

          try {
            const response = await axios.post(`${apiUrl}/approvals/monthAttendance`, generalApproval);
            console.log(response.data);
          } catch (err) {
            console.error('Error general attendance approval:', err);
          }
        break;

        case "pto":

          const selectedPtoDates = this.selectionRange.split(', ');

          // const ptoDay = new Date(this.selectionRange).toISOString();
          // console.log(ptoDay)

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

              console.log("FE send ptoApproval: ", ptoApproval);
              
              const response = await axios.post(`${apiUrl}/approvals/pto`, ptoApproval);
              console.log("BE receive sent pto Approval: ", response);
            }

          } catch (err) {
            console.error('Error submitting pto approval: ', err)
          }
        break;

        case "halfpto":
          const halfPtoDate = new Date(this.selectionRange)
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
            console.log(response.data);
          } catch (err) {
            console.error('Error submitting pto approval: ', err)
          }

        break;

        case "Special PTO":
          const specialPtoDay = new Date(this.selectionRange).toISOString();
          
          const specialPtoApproval = {
            account_id: authStore.user.id,
            supervisor_id: this.selectedSupervisorId,
            content: this.memo,
            status: 'Pending',
            day: specialPtoDay, 
            type: this.selectedSpecialPtoType,
          }
          
          console.log(specialPtoApproval);
          
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
      } catch (err) {
        console.error('Error fetching approvals:', err);
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
      console.log("frontend response for pto: ", response.data)
      this.remainingPto = response.data.remaining_pto;
    } catch(err) {
      console.error('Error fetching remaining PTO: ', err);
    }
  }
 }
};

</script>
