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
          <option value="specialPto">{{ $t('calendar.types.specialPto') }}</option>
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

const apiUrl = import.meta.env.VITE_API_URL;

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
      selectedEventId: null,
      locales: {
        'en-US': enLocale,
        'ja-JP': jaLocale,
      },
    };
  },
  mounted() {
    const authStore = useAuthStore();

    if (!authStore.user || !authStore.user.id) {
      console.error("User ID is not defined in authStore");
      return;
    }

    this.fetchSupervisors();

    const activeAccountSupervisor = authStore.user.supervisor_id
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
      select: (selectionInfo) => {
        const startDate = new Date(selectionInfo.startStr);
        const endDate = new Date(selectionInfo.endStr);
        const dates = [];

        
        while (startDate < endDate) {
          if (startDate.getDay() !== 0 && startDate.getDay() !== 6) {
            dates.push(new Date(startDate));
          }
          startDate.setDate(startDate.getDate() + 1);
        }

        this.selectionRange = dates.map(date => date.toISOString().split('T')[0]).join(', ');
      },
      events: this.events,
      editable: true,
      eventClick: (info) => {
        this.handleEventClick(info.event);
      },
      eventContent: (arg) => {
        if (arg.event.extendedProps.startTime && arg.event.extendedProps.endTime) {
          return {
            html: `
              <div style="text-align: center; font-size: 0.9em; color: white; background-color: ${
                arg.event.backgroundColor
              }; padding: 5px; border-radius: 4px;">
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
  methods: {
    fetchAttendanceData(accountId) {
      axios
        .get(`http://localhost:3000/accounts/${accountId}/attendance`)
        .then((response) => {
          this.events = response.data.map((record) => ({
            id: record.id,
            title: `${record.punch_in.split('T')[1].slice(0, 5)} - ${record.punch_out.split('T')[1].slice(0, 5)}`,
            start: record.day,
            backgroundColor: this.getEventColor(record),
            extendedProps: {
              startTime: record.punch_in.split('T')[1].slice(0, 5), 
              endTime: record.punch_out.split('T')[1].slice(0, 5), 
            },
          }));

          this.calendar.getEvents().forEach((event) => event.remove());
          this.events.forEach((event) => this.calendar.addEvent(event));
        })
        .catch((error) => {
          console.error('Error fetching attendance records:', error);
        });
    },
    handleEventClick(event) {
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

        const attendanceData = {
          account_id: authStore.user.id,
          day: new Date(`${day}T00:00:00.000Z`).toISOString(),
          punch_in: punchIn,
          punch_out: punchOut,
          absence: this.attendanceType === 'absence',
          full_pto: this.attendanceType === 'pto',
          half_pto: this.attendanceType === 'halfPto',
          special_pto: this.attendanceType === 'specialPto',
          break_amount: 0,
          totalHours: 0,
        };

        if(this.selectedEventId) {
          return axios.put(`http://localhost:3000/accounts/${authStore.user.id}/attendance/${this.selectedEventId}`,attendanceData)
        } else {
         return axios.post(`http://localhost:3000/accounts/${authStore.user.id}/attendance`, attendanceData);
        }
      });

      Promise.all(attendancePromises)
        .then(() => {
          this.fetchAttendanceData(authStore.user.id);
          this.clearForm();
        })
        .catch((error) => {
          console.error('Error logging attendance:', error.response?.data || error.message);
        });

    },
    getEventColor(data) {
      if (data.absence) return 'red';
      if (data.full_pto) return 'orange';
      if (data.special_pto) return 'green';
      return 'blue';
    },
    getEventTypeFromColor(color) {
      switch (color) {
        case 'red':
          return 'absence';
        case 'orange':
          return 'pto';
        case 'green':
          return 'specialPto';
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
      try {
        const response = await axios.get(`${apiUrl}/supervisors`);
        console.log(response.data)
        this.supervisors = response.data; // Assume endpoint returns a list of supervisor objects
      } catch (err) {
        console.error('Error fetching supervisors:', error);
      }
    }
    ,
    async submitHandler() {

        const authStore = useAuthStore();

        const selectedDate = this.selectionRange.split(" - ");
        const month = selectedDate[0] ? new Date(selectedDate[0]).getMonth() + 1 : new Date().getMonth() + 1;  // Extracting the month
        const year = selectedDate[0] ? new Date(selectedDate[0]).getFullYear() : new Date().getFullYear();

        const approvalData = {
          account_id: authStore.user.id,
          supervisor_id: this.selectedSupervisorId,
          month: month,
          year: year,
          content: this.memo,
          status: "pending", 
        };

        console.log(approvalData);

        try {
          // console.log(selectedSupervisor);
          // const selectedSupervisor = selectedSupervisor.value;
          const response = await axios.post(`${apiUrl}/approvals/monthAttendance`, approvalData);
          console.log(response.data);

        } catch (err) {
          console.error('Error submitting approval:', err);
        }
      }
  },
};

</script>
