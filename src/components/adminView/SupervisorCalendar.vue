<template>
  <div>
    <!-- User Selection Dropdown -->
    <div class="mb-4">
      <label for="user-select" class="block text-sm font-semibold">Select User</label>
      <select
        id="user-select"
        v-model="selectedUserId"
        @change="fetchAttendanceData"
        class="w-full p-2 border rounded"
      >
        <option value="" disabled selected>Select a user</option>
        <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
      </select>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-3 gap-4 mb-4">
      <div class="bg-white shadow-sm border border-slate-200 rounded-lg p-2 flex flex-row justify-evenly items-center">
        <div>
          <div class="text-3xl text-slate-600">Total Worked</div>
          <div class="text-xs">Current Month</div>
        </div>
        <hr class="w-px h-10 border-l border-slate-300 mx-4">
        <div class="text-3xl text-slate-600">{{ totalWorkedHours }} Hrs</div>
      </div>

      <div class="bg-white shadow-sm border border-slate-200 rounded-lg p-2 flex flex-row justify-evenly items-center">
        <div>
          <div class="text-3xl text-slate-600">Overtime</div>
          <div class="text-xs">Current Month</div>
        </div>
        <hr class="w-px h-10 border-l border-slate-300 mx-4">
        <div class="text-3xl text-slate-600">{{ overtimeHours }} Hrs</div>
      </div>

      <div class="bg-white shadow-sm border border-slate-200 rounded-lg p-2 flex flex-row justify-evenly items-center">
        <div>
          <div class="text-3xl text-slate-600">Paid Time Off</div>
          <div class="text-xs">Total Remaining</div>
        </div>
        <hr class="w-px h-10 border-l border-slate-300 mx-4">
        <div class="text-3xl text-slate-600">{{ remainingPtoDays }} Days</div>
      </div>
    </div>

    <!-- Calendar -->
    <div ref="calendar" id="calendar" class="w-full"></div>
  </div>
</template>

<script>
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export default {
  name: 'SupervisorCalendar',
  data() {
    return {
      selectedUserId: null,
      users: [],
      events: [],
      calendar: null,
      totalWorkedHours: 0, // Total hours worked
      overtimeHours: 0,    // Overtime hours
      remainingPtoDays: 0, // Remaining PTO days
    };
  },
  methods: {
    initializeCalendar() {
      const calendarEl = this.$refs.calendar;

      if (calendarEl) {
        this.calendar = new Calendar(calendarEl, {
          plugins: [dayGridPlugin, interactionPlugin],
          initialView: 'dayGridMonth',
          events: [],
          datesSet: (info) => {
            console.log('Month changed:', info.start);
            this.handleMonthChange(info.start);
          },
          eventContent: this.eventContent,
        });

        this.calendar.render();
        console.log('Calendar initialized');
      } else {
        console.error('Error: Calendar element not found');
      }
    },
    async fetchUsers() {
      try {
        const response = await axios.get(`${apiUrl}/approvals/1`);
        this.users = response.data.approvees.map((user) => ({
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
        }));
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },


    handleMonthChange(startDate) {
  const year = startDate.getFullYear();
  const month = startDate.getMonth() + 1; // Corretto calcolo del mese

  console.log("Year and month:", year, month);

  this.fetchAttendanceDataForMonth(year, month); // Fetch dati per il mese corretto
},

async fetchRemainingPto(userId) {
  try {
    const response = await axios.get(`${apiUrl}/accounts/${userId}/remainingPto`);
    this.remainingPtoDays = response.data.remaining_pto;
    console.log("Remaining PTO fetched:", response.data.remaining_pto);
  } catch (err) {
    console.error('Error fetching remaining PTO:', err);
  }
},



async fetchAttendanceDataForMonth(year, month) {
  if (!this.selectedUserId) {
    console.error('No user selected');
    return;
  }

  try {
    const attendanceResponse = await axios.get(`${apiUrl}/accounts/${this.selectedUserId}/attendance`);
    const ptoResponse = await axios.get(`${apiUrl}/accounts/${this.selectedUserId}/approvalsPTO`);

    await this.fetchRemainingPto(this.selectedUserId);
    // Filtra i dati per il mese selezionato
    const attendanceRecords = attendanceResponse.data.filter((record) => {
      const recordDate = new Date(record.day);
      return (
        recordDate.getFullYear() === year &&
        recordDate.getMonth() + 1 === month
      );
    });

    const ptoRecords = ptoResponse.data.approvalsSentData.filter((pto) => {
      const ptoDate = new Date(pto.date);
      return (
        ptoDate.getFullYear() === year &&
        ptoDate.getMonth() + 1 === month
      );
    });

    // Mappa gli eventi per il calendario
    const attendanceEvents = attendanceRecords.map((record) => ({
      id: record.id,
      title: `${record.punch_in ? record.punch_in.split('T')[1].slice(0, 5) : ''} - ${record.punch_out ? record.punch_out.split('T')[1].slice(0, 5) : ''}`,
      start: record.day,
      backgroundColor: record.absence ? 'red' : 'blue',
      extendedProps: {
        attendanceType: record.absence ? 'absence' : 'general',
        totalHours: record.punch_in && record.punch_out
          ? (new Date(record.punch_out) - new Date(record.punch_in)) / (1000 * 60 * 60)
          : 0,
      },
    }));

    const ptoEvents = ptoRecords.map((pto) => ({
      id: pto.id,
      title: `${pto.type}`,
      start: pto.date,
      backgroundColor: pto.status === 'Approved' ? 'green' : 'gray',
      extendedProps: {
        attendanceType: pto.type === 'Special PTO'
          ? 'Special PTO'
          : pto.type === 'Half PTO'
          ? 'halfpto'
          : 'pto',
        status: pto.status,
      },
    }));

    this.events = [...attendanceEvents, ...ptoEvents];

    if (this.calendar) {
      this.calendar.getEvents().forEach((event) => event.remove());
      this.events.forEach((event) => this.calendar.addEvent(event));
    }

    // Calcolo delle ore totali considerando tutte le tipologie
    const calculatedTotalHours = this.events.reduce((sum, event) => {
      const isAbsence = event.extendedProps?.attendanceType === 'absence';
      const isPto = event.extendedProps?.attendanceType === 'pto';
      const isHalfPto = event.extendedProps?.attendanceType === 'halfpto';
      const isSpecialPto = event.extendedProps?.attendanceType === 'Special PTO';

      if (isAbsence) return sum;

      if (isPto || isSpecialPto) {
        return sum + 8; // PTO e Special PTO contano 8 ore
      } else if (isHalfPto) {
        return sum + 4; // Half PTO conta 4 ore
      }

      return sum + (event.extendedProps?.totalHours || 0); // Aggiungi le ore generali
    }, 0);

    console.log("Calculated Total Hours:", calculatedTotalHours);

    this.totalWorkedHours = calculatedTotalHours;
    this.overtimeHours = Math.max(0, calculatedTotalHours - 160); // Straordinario (160 è l'orario standard)
    this.remainingPtoDays = ptoResponse.data.remainingPTO || 0;

  } catch (error) {
    console.error('Error fetching attendance data:', error);
  }
},

    eventContent(arg) {
      if (arg.event.extendedProps.isAttendance) {
        return {
          html: `<div style="color: black; background-color: ${arg.event.backgroundColor}; padding: 5px; border-radius: 4px;">
            ${arg.event.title}
          </div>`,
        };
      }
      if (arg.event.extendedProps.isPTO) {
        return {
          html: `<div style="color: white; background-color: ${arg.event.backgroundColor}; padding: 5px; border-radius: 4px;">
            ${arg.event.title}<br>${arg.event.extendedProps.status}
          </div>`,
        };
      }
    },
  },
  mounted() {
    this.initializeCalendar();
    this.fetchUsers();
  },
  watch: {
    selectedUserId(newId) {
      if (newId) this.handleMonthChange(new Date()); // Aggiorna con il mese corrente
    },
  },
};
</script>



