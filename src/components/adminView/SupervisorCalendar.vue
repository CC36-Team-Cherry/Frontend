<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">{{ $t('SupervisorCalendar.Title') }}</h1>
    <div>
      <label for="approvee" class="block mb-2 font-bold">{{ $t('SupervisorCalendar.SelectPlaceholder') }}</label>
      <select
        id="approvee"
        v-model="selectedUser"
        @change="fetchCalendarData"
        class="p-2 border rounded w-full"
      >
        <option value="" disabled>Select Approvee</option>
        <option v-for="user in approvees" :key="user.id" :value="user.id">
          {{ user.first_name }} {{ user.last_name }}
        </option>
      </select>
      <p v-if="approvees.length === 0" class="text-red-500">No approvees found.</p>
    </div>

    <div v-if="approvees.length > 0" class="mt-4">
      <div id="calendar"></div>
    </div>
    <p v-else-if="selectedUser" class="mt-4 text-gray-500">No calendar data for this user.</p>
  </div>
</template>


<script setup>
import { ref, onMounted, watch } from "vue";
import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import enLocale from "@fullcalendar/core/locales/en-gb";

// Reactive variables
const approvees = ref([]); // List of approvees
const selectedUser = ref(null); // Currently selected user
const calendarData = ref([]); // Calendar events
let calendarInstance = null; // FullCalendar instance

// Fetch approvees associated with the supervisor
const fetchApprovees = async () => {
  try {
    const response = await fetch(`http://localhost:3000/approvals/1`);
    if (!response.ok) throw new Error("Failed to fetch approvees");
    const data = await response.json();
    console.log("Fetched approvees data: ", data);
    approvees.value = data.approvees || [];
  } catch (error) {
    console.error("Error fetching approvees:", error);
  }
};

// Fetch calendar data for the selected user
const fetchCalendarData = async () => {
  if (!selectedUser.value) return;

  try {
    const response = await fetch(`http://localhost:3000/accounts/${selectedUser.value}/attendance/`);
    if (!response.ok) throw new Error("Failed to fetch calendar data");
    const data = await response.json();

    // Format events
    calendarData.value = data.map((item) => ({
      id: item.id,
      title: `${item.punch_in.split('T')[1].slice(0, 5)} - ${item.punch_out.split('T')[1].slice(0, 5)}`,
      start: item.day,
      backgroundColor: getEventColor(item),
      extendedProps: {
        punch_in: item.punch_in.split('T')[1].slice(0, 5),
        punch_out: item.punch_out.split('T')[1].slice(0, 5),
      },
    }));

    if (calendarInstance) {
      calendarInstance.removeAllEvents();
      calendarInstance.addEventSource(calendarData.value);
    }
  } catch (error) {
    console.error("Error fetching calendar data:", error);
  }
};

// Get event color based on event type
const getEventColor = (data) => {
  if (data.absence) return "red";
  if (data.full_pto) return "orange";
  if (data.special_pto) return "green";
  return "blue";
};

// Initialize the calendar and fetch data on mount
onMounted(() => {
  fetchApprovees().then(() => {
    const calendarElement = document.getElementById("calendar");
    if (calendarElement) {
      calendarInstance = new Calendar(calendarElement, {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: "dayGridMonth",
        locale: enLocale,
        events: calendarData.value,
        eventContent: (arg) => {
          if (arg.event.extendedProps.punch_in && arg.event.extendedProps.punch_out) {
            return {
              html: `
                <div style="text-align: center; font-size: 0.9em; color: white; background-color: ${
                  arg.event.backgroundColor
                }; padding: 5px; border-radius: 4px;">
                  <b>${arg.event.extendedProps.punch_in} - ${arg.event.extendedProps.punch_out}</b>
                </div>
              `,
            };
          }
        },
      });
      calendarInstance.render();
    } else {
      console.error("Calendar element not found. Ensure #calendar exists in the DOM.");
    }
  });
});

// Watch for calendar data changes and update the calendar
watch(calendarData, () => {
  if (calendarInstance) {
    calendarInstance.removeAllEvents();
    calendarInstance.addEventSource(calendarData.value);
  }
});
</script>



