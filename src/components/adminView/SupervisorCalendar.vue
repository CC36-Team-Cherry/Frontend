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
          };
        });

        
        const ptoEvents = response2.data.approvalsSentData.map((pto) => {
          return {
            id: pto.id,
            title: `${pto.supervisorName} - ${pto.type}`,
            start: pto.date,
            backgroundColor: this.getEventColor(pto),
          };
        });

        
        this.events = [...attendanceEvents, ...ptoEvents];

        
        if (this.calendar) {
          this.calendar.getEvents().forEach((event) => event.remove()); 
          this.events.forEach((event) => this.calendar.addEvent(event)); 
        }

      } catch (error) {
        if (error instanceof Error) {
          console.error('Error fetching data:', error.message);
        } else {
          console.error('Unknown error:', error);
        }
      }
    },

   
    getEventColor(record) {
      if (record.absence) return 'red';
      if (record.full_pto) return 'orange';
      if (record.special_pto) return 'green';
      return 'blue';
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
