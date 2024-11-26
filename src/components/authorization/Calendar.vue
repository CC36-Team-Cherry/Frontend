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
          {{ $t('calendar.logAttendance') }}
        </button>
      </div>
      <!-- Submission -->
      <div>
        <label class="block mb-1 font-bold">{{ $t('calendar.submission') }}</label>
        <select v-model="submissionSupervisor" class="border border-gray-300 rounded p-2 w-full">
          <option value="" disabled>{{ $t('calendar.supervisorPlaceholder') }}</option>
          <option v-for="supervisor in supervisors" :key="supervisor" :value="supervisor">
            {{ supervisor }}
          </option>
        </select>
        <button
          @click="submitAttendance"
          class="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 w-full mt-2"
        >
          {{ $t('calendar.submit') }}
        </button>
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
import { useRoute } from 'vue-router';

export default {
  name: 'FullCalendarComponent',
  data() {
    return {
      selectionRange: '',
      attendanceType: '',
      startTime: '',
      endTime: '',
      submissionSupervisor: '',
      supervisors: ['Default Supervisor', 'User A', 'User B'],
      calendar: null,
      events: [],
      selectedEventId: null,
      accountId: null,
      locales: {
        'en-US': enLocale,
        'ja-JP': jaLocale,
      },
    };
  },
  mounted() {
    const calendarEl = this.$refs.calendar;
    const { locale } = useI18n();
    const route = useRoute();

    this.accountId = route.params.accountId;

    this.calendar = new Calendar(calendarEl, {
      plugins: [interactionPlugin, dayGridPlugin],
      initialView: 'dayGridMonth',
      locale: this.locales[locale.value],
      selectable: true,
      select: (selectionInfo) => {
        const correctedEndDate = new Date(selectionInfo.endStr);
        correctedEndDate.setDate(correctedEndDate.getDate() - 1);
        const endStr = correctedEndDate.toISOString().split('T')[0];
        this.selectionRange = `${selectionInfo.startStr} - ${endStr}`;
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

    this.fetchAttendanceData();
  },
  methods: {
    fetchAttendanceData() {
      axios
        .get(`http://localhost:3000/accounts/${this.accountId}/attendance`)
        .then((response) => {
          this.events = response.data.map((record) => ({
            id: record.id,
            title: record.absence ? 'Absence' : 'Attendance',
            start: record.day,
            backgroundColor: this.getEventColor(record),
            extendedProps: {
              startTime: record.punch_in
                ? new Date(record.punch_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'N/A',
              endTime: record.punch_out
                ? new Date(record.punch_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'N/A',
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
  const day = this.selectionRange.split(' - ')[0];

  // Converti l'orario di `startTime` e `endTime` al formato corretto con il fuso orario locale
  const punchIn = new Date(`${day}T${this.startTime}:00`);
  const punchOut = new Date(`${day}T${this.endTime}:00`);

  const attendanceData = {
    account_id: this.accountId,
    day,
    punch_in: punchIn.toISOString(), // Ora convertita a ISO per il backend
    punch_out: punchOut.toISOString(), 
    absence: this.attendanceType === 'absence',
    full_pto: this.attendanceType === 'pto',
    half_pto: this.attendanceType === 'halfPto',
    special_pto: this.attendanceType === 'specialPto',
  };

  

  if (this.selectedEventId) {
    axios
      .put(`http://localhost:3000/accounts/${this.accountId}/attendance/${this.selectedEventId}`, attendanceData)
      .then(() => {
        this.fetchAttendanceData();
        this.clearForm();
      })
      .catch((error) => {
        console.error('Error editing attendance:', error.response?.data || error.message);
      });
  } else {
    axios
      .post(`http://localhost:3000/accounts/${this.accountId}/attendance`, attendanceData)
      .then((response) => {
        console.log('Risposta dal server:', response.data); 
        this.fetchAttendanceData();
        this.clearForm();
      })
      .catch((error) => {
        console.error('Error logging attendance:', error.response?.data || error.message);
      });
  }
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
  },
};
</script>



