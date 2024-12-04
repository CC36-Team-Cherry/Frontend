<template>
  <div>
    <div class="mb-4">
      <label for="user-select" class="block text-sm font-semibold">Select User</label>
      <select id="user-select" v-model="selectedUserId" @change="fetchAttendanceData" class="w-full p-2 border rounded">
        <option value="" disabled selected>Select an user</option>
        <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
      </select>
    </div>

    <div id="calendar" ref="calendar" class="w-full"></div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { Calendar } from '@fullcalendar/core'; 
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

export default {
  data() {
    return {
      selectedUserId: null,
      users: [],
      events: [],
      calendar: null,
    };
  },
  methods: {
    initializeCalendar() {
      const calendarEl = document.getElementById('calendar');

      if (calendarEl) {
        this.calendar = new Calendar(calendarEl, {
          plugins: [dayGridPlugin, interactionPlugin],
          initialView: 'dayGridMonth',
          events: [], 
          eventContent: this.eventContent, // Aggiungi la gestione personalizzata degli eventi
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
        const data = response.data;

        this.users = data.approvees.map((user) => ({
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
        }));
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },

    async fetchAttendanceData() {
      if (!this.calendar) {
        console.error('Calendar is not initialized yet');
        return;
      }

      if (!this.selectedUserId) {
        console.error('User not selected');
        return;
      }

      try {
        const response = await axios.get(`${apiUrl}/accounts/${this.selectedUserId}/attendance`);
        const response2 = await axios.get(`${apiUrl}/accounts/${this.selectedUserId}/approvalsPTO`);

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

        const attendanceEvents = filteredAttendance.map((record) => {
          const startTime = record.punch_in ? record.punch_in.split('T')[1].slice(0, 5) : null;
          const endTime = record.punch_out ? record.punch_out.split('T')[1].slice(0, 5) : null;
          return {
            id: record.id,
            title: `${startTime} - ${endTime}`,
            start: record.day,
            backgroundColor: this.getEventColor(record),
            extendedProps: {
              startTime,
              endTime,
              isAttendance: true,
            },
          };
        });

        const ptoEvents = response2.data.approvalsSentData.map((pto) => {
          return {
            id: pto.id,
            title: `${pto.type}`,
            start: pto.date,
            backgroundColor: this.getEventColor(pto),
            extendedProps: {
              status: pto.status,
              isPTO: true,
            },
          };
        });

        this.events = [...attendanceEvents, ...ptoEvents];

        if (this.calendar) {
          this.calendar.getEvents().forEach((event) => event.remove());
          this.events.forEach((event) => this.calendar.addEvent(event));
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },

    getEventColor(record) {
      if (record.absence) return 'red';
      if (record.status === "Approved") return 'blue';
      if (record.status === "Pending") return 'gray';
      return 'lightblue';
    },

    // Gestione del contenuto dell'evento (custom return per PTO e Attendance)
    eventContent: (arg) => {
      // Gestione degli eventi di Attendance
      if (arg.event.extendedProps.isAttendance) {
        return {
          html: `
            <div style="display: flex; justify-content: center; align-items: center; font-size: 1.1em; color: black; background-color: ${arg.event.backgroundColor}; padding: 10px; border-radius: 4px; height: 100%; line-height: 1.5;">
              <b>${arg.event.extendedProps.startTime} - ${arg.event.extendedProps.endTime}</b>
            </div>
          `,
        };
      }

      // Gestione degli eventi PTO
      if (arg.event.extendedProps.status) {
       return {
       html: `
       <div style="text-align: center; font-size: 1.1em; color: white; background-color: ${arg.event.backgroundColor}; padding: 12px; border-radius: 4px;">
        <b>${arg.event.title}</b><br><i>${arg.event.extendedProps.status}</i>
       </div>
      `,
  };
}

      // Caso di fallback per altri eventi
      return {
        html: `
          <div style="display: flex; justify-content: center; align-items: center; font-size: 1.1em; color: black; background-color: ${arg.event.backgroundColor}; padding: 10px; border-radius: 4px; height: 100%; line-height: 1.5;">
            <b>${arg.event.title}</b>
          </div>
        `,
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
        this.fetchAttendanceData();
      }
    },
  },
};
</script>

