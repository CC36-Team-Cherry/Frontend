<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">{{ $t('SupervisorCalendar.Title') }}</h1>
    <div>
      <select
        id="approvee"
        v-model="selectedUser"
        @change="fetchCalendarData"
        class="p-2 border rounded"
      >
        <option value="" disabled>{{ $t('SupervisorCalendar.SelectPlaceholder') }}</option>
        <option v-for="user in approvees" :key="user.id" :value="user.id">
          {{ user.first_name }} {{ user.last_name }}
        </option>
      </select>
      <p v-if="approvees.length === 0">No approvees found.</p>
    </div>

    
    <div v-if="calendarData.length > 0">
      <div id="calendar"></div>
    </div>
    <p v-else-if="selectedUser">No calendar data for this user.</p>
  </div>
</template>


<script setup>
import { ref, onMounted, watch } from "vue";
import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import enLocale from "@fullcalendar/core/locales/en-gb";

const approvees = ref([]);
const selectedUser = ref(null);
const calendarData = ref([]);
let calendarInstance = null;

const fetchApprovees = async () => {
  try {
    const response = await fetch(`http://localhost:3000/approvals/1`); 
    const data = await response.json();
    console.log("Approvees response data:", data); 
    approvees.value = data.approvees || [];
  } catch (error) {
    console.error("Error fetching approvees:", error);
  }
};


const fetchCalendarData = async () => {
  if (!selectedUser.value) return;

  try {
    const response = await fetch(`http://localhost:3000/accounts/${selectedUser.value}/attendance/`);
    const data = await response.json();
    calendarData.value = data.map((item) => ({
      title: `Worked: ${item.totalHours} hrs`,
      start: item.day,
    }));

    if (calendarInstance) {
      calendarInstance.removeAllEvents(); 
      calendarInstance.addEventSource(calendarData.value); 
    }
  } catch (error) {
    console.error("Error fetching calendar data:", error);
  }
};

onMounted(() => {
  fetchApprovees();

  
  calendarInstance = new Calendar(document.getElementById("calendar"), {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: "dayGridMonth",
    locale: enLocale,
    events: calendarData.value,
  });

  calendarInstance.render();
});

watch(calendarData, () => {
  if (calendarInstance) {
    calendarInstance.removeAllEvents();
    calendarInstance.addEventSource(calendarData.value);
  }
});
</script>
