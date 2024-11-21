<template>
    <div v-if="isVisible" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
      <div class="bg-white p-6 rounded shadow-lg w-3/4 h-3/4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">{{ employee.name }}'s Attendance Calendar</h2>
          <button @click="$emit('close')" class="text-red-500 text-xl">
            &times;
          </button>
        </div>
        <!-- Calendar Section -->
        <div class="overflow-auto h-full">
          <div ref="calendar"></div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { Calendar } from '@fullcalendar/core';
  import interactionPlugin from '@fullcalendar/interaction';
  import dayGridPlugin from '@fullcalendar/daygrid';
  
  export default {
    name: 'CalendarModal',
    props: {
      isVisible: {
        type: Boolean,
        required: true,
      },
      employee: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        calendar: null,
      };
    },
    mounted() {
      if (this.employee) {
        const calendarEl = this.$refs.calendar;
  
        this.calendar = new Calendar(calendarEl, {
          plugins: [interactionPlugin, dayGridPlugin],
          initialView: 'dayGridMonth',
          headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek',
          },
          events: this.generateEvents(this.employee.attendance),
        });
  
        this.calendar.render();
      }
    },
    methods: {
      generateEvents(attendance) {
        return attendance.map((record) => ({
          title: record.status,
          start: record.date,
          backgroundColor: record.status === 'Present' ? 'green' : 'red',
          display: 'background',
        }));
      },
    },
    watch: {
      employee: {
        immediate: true,
        handler(newEmployee) {
          if (this.calendar && newEmployee) {
            this.calendar.removeAllEvents();
            this.calendar.addEventSource(this.generateEvents(newEmployee.attendance));
          }
        },
      },
    },
  };
  </script>
  
  
  
  

  
  
  