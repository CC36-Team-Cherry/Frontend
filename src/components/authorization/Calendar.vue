<template>
  <div class="p-4 bg-gray-100 h-full">
    <!-- Header Section -->
    <div class="grid grid-cols-6 gap-4 mb-4">
      <!-- Selection -->
      <div>
        <label class="block mb-1 font-bold">{{ $t('calendar.selection') }}</label>
        <input
          type="text"
          placeholder="YYYY-MM-DD - YYYY-MM-DD"
          v-model="selectionRange"
          class="border border-gray-300 rounded p-2 w-full"
        />
      </div>
      <!-- Type -->
      <div>
        <label class="block mb-1 font-bold">{{ $t('calendar.type') }}</label>
        <select v-model="attendanceType" class="border border-gray-300 rounded p-2 w-full">
          <option value="" disabled>Select Type</option>
          <option value="general">{{ $t('calendar.types.general') }}</option>
          <option value="pto">{{ $t('calendar.types.pto') }}</option>
          <option value="halfpto">{{ $t('calendar.types.halfPto') }}</option>
          <!-- Special PTO options dynamically inserted -->
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
        <label class="block mb-1 font-bold">{{ $t('calendar.startTime') }}</label>
        <input
          type="time"
          v-model="startTime"
          class="border border-gray-300 rounded p-2 w-full"
        />
      </div>
      <!-- End Time -->
      <div>
        <label class="block mb-1 font-bold">{{ $t('calendar.endTime') }}</label>
        <input
          type="time"
          v-model="endTime"
          class="border border-gray-300 rounded p-2 w-full"
        />
      </div>
      
      <!-- Attendance -->
      <div>
        <label class="block mb-1 font-bold">{{ $t('calendar.attendance') }}</label>
        <button
          @click="logAttendance"
          class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 w-full"
        >
          {{ selectedEventId ? $t('calendar.updateAttendance') : $t('calendar.logAttendance') }}
        </button>
      </div>
      <div>
        <div>
          <label class="block mb-1 font-bold">{{ "Supervisor" }}</label>
            <select 
              v-model="selectedSupervisorId" 
              class="border border-gray-300 rounded p-2 w-full"
            >
              <option value="" disabled>Select Supervisor</option>
              <!-- Loop through supervisors to create the dropdown -->
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
          class="border-2"
        />
        <div>
          <label class="block mb-1 font-bold">{{ Submit }}</label>
          <button
            @click="submitHandler"
            class="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 w-full"
          >
            {{ "Submit" }}
          </button>
        </div>
      </div>
<!-- Chart Section -->
<div class="mb-4">
  <canvas ref="attendanceChart" class="w-full h-64"></canvas>
</div>
    </div>
    <!-- Calendar Section -->
    <div ref="calendar"></div>
  </div>
</template>


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

const apiUrl = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

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
      totalHours: 0,         
      maxHours: 160,         
      selectedEventId: null,
      holidays: [], 
      locales: {
        'en-US': enLocale,
        'ja-JP': jaLocale,
      },
      specialPtos: [],
      selectedSpecialPtoType: '',
    };
  },
  mounted() {
    const authStore = useAuthStore();
    this.getSpecialPto();

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

    this.calendar = new Calendar(calendarEl, {
      plugins: [interactionPlugin, dayGridPlugin],
      initialView: 'dayGridMonth',
      locale: this.locales[locale.value],
      selectable: true,
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
    });

    this.calendar.render();

    this.$watch(
      () => locale.value,
      (newLocale) => {
        this.calendar.setOption('locale', this.locales[newLocale]);
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
    }
  },
  methods: {
    initializeChart() {
     const ctx = this.$refs.attendanceChart?.getContext('2d');
     if (!ctx) {
      console.error('Canvas element not found for attendance chart');
      return;
    }

  this.attendanceChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Worked Hours', 'Remaining Hours'],
      datasets: [
        {
          data: [this.totalHours, this.maxHours - this.totalHours],
          backgroundColor: ['#4caf50', '#e0e0e0'],
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

  console.log('Updating chart data with totalHours:', this.totalHours, 'and maxHours:', this.maxHours);

  const workedHours = this.totalHours || 0;
  const remainingHours = this.maxHours - workedHours;

  if (isNaN(workedHours) || isNaN(remainingHours)) {
    console.error('Invalid chart data:', { workedHours, remainingHours });
    return;
  }

  try {
    this.attendanceChart.data.datasets[0].data = [workedHours, remainingHours];
    this.attendanceChart.update();
    console.log('Chart updated successfully with:', { workedHours, remainingHours });
  } catch (err) {
    console.error('Error updating chart:', err);
  }
},

fetchAttendanceData(accountId) {
  axios
    .get(`${apiUrl}/accounts/${accountId}/attendance`)
    .then((response) => {
      console.log("Response data:", response.data); // Debug della risposta

      this.events = response.data.map((record) => ({
        id: record.id,
        title: record.punch_in && record.punch_out
          ? `${record.punch_in.split('T')[1].slice(0, 5)} - ${record.punch_out.split('T')[1].slice(0, 5)}`
          : 'No Time Logged',
        start: record.day,
        backgroundColor: this.getEventColor(record),
        extendedProps: {
          startTime: record.punch_in ? record.punch_in.split('T')[1].slice(0, 5) : null,
          endTime: record.punch_out ? record.punch_out.split('T')[1].slice(0, 5) : null,
          totalHours: record.total_hours || 0,
        },
      }));

      
      const calculatedTotalHours = this.events.reduce(
        (sum, event) => sum + (event.extendedProps.totalHours || 0),
        0
      );

      console.log("Calculated Total Hours:", calculatedTotalHours);

      if (!isNaN(calculatedTotalHours) && calculatedTotalHours >= 0) {
        this.totalHours = calculatedTotalHours;
        console.log("Updated this.totalHours:", this.totalHours); 
        this.updateChart();
      } else {
        console.error("Invalid total hours data:", calculatedTotalHours);
      }

      
      this.calendar.getEvents().forEach((event) => event.remove());
      [...this.holidays, ...this.events].forEach((event) => this.calendar.addEvent(event));
    })
    .catch((error) => {
      console.error("Error fetching attendance records:", error.response?.data || error.message);
    });
},

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

      console.log("specialPtos", this.specialPtos)
      console.log("selectedSpecialPtoType: ", this.selectedSpecialPtoType)

      switch (this.attendanceType) {

        case "general":
          const selectedDate = this.selectionRange.split(' - ');
          const month = selectedDate[0] ? new Date(selectedDate[0]).getMonth() + 1 : new Date().getMonth() + 1;
          const year = selectedDate[0] ? new Date(selectedDate[0]).getFullYear() : new Date().getFullYear();

          const generalApproval = {
            account_id: authStore.user.id,
            supervisor_id: this.selectedSupervisorId,
            month: month,
            year: year,
            content: this.memo,
            status: 'pending',
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

      await authStore.fetchPendingApprovals();

    },
    async getSpecialPto() {

      const authStore = useAuthStore();

    try {
      const response = await axios.get(`${apiUrl}/accounts/${authStore.user.id}/specialPto`);
      this.specialPtos = response.data.map(specialPto => ({
        ...specialPto,
        attendanceType: "Special PTO"
      }));

      console.log(this.specialPtos)
    } catch(err) {
      console.error('Error fetching special pto:', err);
    }
  }
  }
}
</script>