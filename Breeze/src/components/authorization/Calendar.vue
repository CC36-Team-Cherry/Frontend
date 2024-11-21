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
      currentLocale: 'en',
      locales: {
        en: enLocale,
        ja: jaLocale,
      },
    };
  },
  mounted() {
    const calendarEl = this.$refs.calendar;

    this.calendar = new Calendar(calendarEl, {
      plugins: [interactionPlugin, dayGridPlugin],
      initialView: 'dayGridMonth',
      locale: this.locales[this.currentLocale],
      selectable: true,
      select: (selectionInfo) => {
        const correctedEndDate = new Date(selectionInfo.endStr);
        correctedEndDate.setDate(correctedEndDate.getDate() - 1); 
        const endStr = correctedEndDate.toISOString().split('T')[0];
        this.selectionRange = `${selectionInfo.startStr} - ${endStr}`;
      },
      events: this.events,
      eventContent: (arg) => {
        if (arg.event.extendedProps.startTime && arg.event.extendedProps.endTime) {
          return {
            html: `
              <div style="text-align: center; font-size: 0.9em; color: white;">
                <b>${arg.event.extendedProps.startTime} - ${arg.event.extendedProps.endTime}</b>
              </div>
            `,
          };
        }
      },
    });

    this.calendar.render();
  },
  methods: {
    logAttendance() {
      if (!this.selectionRange || !this.attendanceType || !this.startTime || !this.endTime) {
        alert('Please fill out all required fields');
        return;
      }

      const [start, end] = this.selectionRange.split(' - ');
      const startDate = new Date(start);
      const endDate = new Date(end);

      const events = [];
      while (startDate <= endDate) {
        const day = startDate.toISOString().split('T')[0];
        const dayOfWeek = startDate.getDay();

        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          events.push({
            title: `${this.attendanceType.toUpperCase()}`,
            start: day,
            backgroundColor: this.getEventColor(this.attendanceType),
            extendedProps: {
              startTime: this.startTime,
              endTime: this.endTime,
            },
            display: 'background',
          });
        }

        startDate.setDate(startDate.getDate() + 1);
      }

      events.forEach((event) => {
        this.events.push(event);
        this.calendar.addEvent(event);
      });

      this.clearForm();
    },
    submitAttendance() {
      if (!this.submissionSupervisor) {
        alert('Please select a supervisor');
        return;
      }
      alert(`Attendance submitted to ${this.submissionSupervisor}`);
    },
    getEventColor(type) {
      switch (type) {
        case 'general':
          return 'blue';
        case 'pto':
          return 'orange';
        case 'specialPto':
          return 'green';
        default:
          return 'gray';
      }
    },
    clearForm() {
      this.selectionRange = '';
      this.attendanceType = '';
      this.startTime = '';
      this.endTime = '';
    },
    switchLocale(locale) {
      this.currentLocale = locale;
      this.calendar.setOption('locale', this.locales[this.currentLocale]);
    },
  },
};
</script>





  
  
  
  
  
  
  
  
  
  
  
  


