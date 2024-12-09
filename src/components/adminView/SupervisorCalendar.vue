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
        <div class="text-3xl text-slate-600">{{ totalWorkedHours ?? 0 }} Hrs</div>
      </div>

      <div class="bg-white shadow-sm border border-slate-200 rounded-lg p-2 flex flex-row justify-evenly items-center">
        <div>
          <div class="text-3xl text-slate-600">Overtime</div>
          <div class="text-xs">Current Month</div>
        </div>
        <hr class="w-px h-10 border-l border-slate-300 mx-4">
        <div class="text-3xl text-slate-600">{{ overtimeHours ?? 0 }} Hrs</div>
      </div>

      <div class="bg-white shadow-sm border border-slate-200 rounded-lg p-2 flex flex-row justify-evenly items-center">
        <div>
          <div class="text-3xl text-slate-600">Paid Time Off</div>
          <div class="text-xs">Total Remaining</div>
        </div>
        <hr class="w-px h-10 border-l border-slate-300 mx-4">
        <div class="text-3xl text-slate-600">{{ remainingPtoDays ?? 0 }} Days</div>
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
  props: {
    userId: {
      type: [String, Number],
      required: true,
    }
  },
  data() {
    return {
      selectedUserId: this.userId,
      users: [],
      events: [],
      holidays: [],
      calendar: null,
      totalWorkedHours: 0,
      overtimeHours: 0,
      remainingPtoDays: 0,
    };
  },
  methods: {
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
    async fetchRemainingPto(userId) {
      try {
        const response = await axios.get(`${apiUrl}/accounts/${userId}/remainingPto`);
        this.remainingPtoDays = response.data.remaining_pto ?? 0;
        console.log("Remaining PTO fetched:", this.remainingPtoDays);
      } catch (err) {
        console.error('Error fetching remaining PTO:', err);
        this.remainingPtoDays = 0;
      }
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
        { title: 'Christmas Holiday', start: `${year + 1}-01-01`, isHoliday: true },
        { title: 'Christmas Holiday', start: `${year + 1}-01-02`, isHoliday: true },
        { title: 'Christmas Holiday', start: `${year + 1}-01-03`, isHoliday: true },
      ];
    },
    initializeCalendar() {
      const calendarEl = this.$refs.calendar;
      if (calendarEl) {
        this.calendar = new Calendar(calendarEl, {
          plugins: [dayGridPlugin, interactionPlugin],
          initialView: 'dayGridMonth',
          events: [],
          datesSet: (info) => {
            this.handleMonthChange(info.start);
          },
          eventContent: this.eventContent,
        });
        this.calendar.render();
      }
    },
    handleMonthChange(startDate) {
      const year = startDate.getFullYear();
      const month = startDate.getMonth() + 1;
      console.log("Year, Month changed:", { year, month });
      this.fetchAttendanceDataForMonth(year, month);
    },
    async fetchAttendanceDataForMonth(year, month) {
      if (!this.selectedUserId) {
        console.error('No user selected');
        return;
      }
      try {
        await this.fetchRemainingPto(this.selectedUserId);

        const attendanceResponse = await axios.get(`${apiUrl}/accounts/${this.selectedUserId}/attendance`);
        const ptoResponse = await axios.get(`${apiUrl}/accounts/${this.selectedUserId}/approvalsPTO`);

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

        const attendanceEvents = attendanceRecords.map((record) => ({
          id: record.id,
          title: `${record.punch_in ? record.punch_in.split('T')[1].slice(0, 5) : ''} - ${record.punch_out ? record.punch_out.split('T')[1].slice(0, 5) : ''}`,
          start: record.day,
          backgroundColor: record.absence ? 'red' : 'lightblue',
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

        this.holidays = this.generateJapaneseHolidays(year);

        this.events = [...attendanceEvents, ...ptoEvents, ...this.holidays];

        if (this.calendar) {
          this.calendar.getEvents().forEach((event) => event.remove());
          this.events.forEach((event) => this.calendar.addEvent(event));
        }

        const calculatedTotalHours = this.events.reduce((sum, event) => {
          const isAbsence = event.extendedProps?.attendanceType === 'absence';
          const isPto = event.extendedProps?.attendanceType === 'pto';
          const isHalfPto = event.extendedProps?.attendanceType === 'halfpto';
          const isSpecialPto = event.extendedProps?.attendanceType === 'Special PTO';

          if (isAbsence) return sum;

          if (isPto || isSpecialPto) {
            return sum + 8;
          } else if (isHalfPto) {
            return sum + 4;
          }

          return sum + (event.extendedProps?.totalHours || 0);
        }, 0);

        this.totalWorkedHours = calculatedTotalHours;
        this.overtimeHours = Math.max(0, calculatedTotalHours - 160);

      } catch (error) {
        console.error('Error fetching attendance data:', error);
      }
    },
    eventContent(arg) {
      if (arg.event.extendedProps.attendanceType === 'general' || arg.event.extendedProps.attendanceType === 'absence') {
        return {
          html: `<div style="color: black; background-color: ${arg.event.backgroundColor}; padding: 5px; border-radius: 4px;">
            <b>${arg.event.title}</b>
          </div>`,
        };
      } else if (arg.event.extendedProps.attendanceType === 'pto' || arg.event.extendedProps.attendanceType === 'Special PTO' || arg.event.extendedProps.attendanceType === 'halfpto') {
        return {
          html: `<div style="color: white; background-color: ${arg.event.backgroundColor}; padding: 5px; border-radius: 4px;">
            <b>${arg.event.title}</b><br><i>${arg.event.extendedProps.status}</i>
          </div>`,
        };
      } else if (arg.event.extendedProps.isHoliday) {
        return {
          html: `<div style="color: black; background-color: rgba(255, 0, 0, 0.2); padding: 5px; border-radius: 4px;">
            <b>${arg.event.title}</b>
          </div>`,
        };
      }
      return {
        html: `<div style="padding: 5px; border-radius: 4px;">${arg.event.title}</div>`,
      };
    },
  },
  mounted() {
    this.initializeCalendar();
    this.fetchUsers();
  },
  watch: {
    selectedUserId(newUserId) {
      if (newUserId) {
        this.fetchAttendanceDataForMonth(new Date().getFullYear(), new Date().getMonth() + 1);
      }
    },
  },
};
</script>






