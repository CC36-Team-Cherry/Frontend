<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">{{ $t('SupervisorCalendar.Title') }}</h1>

    <!-- Dropdown per selezionare gli utenti -->
    <div>
      <label for="approvee" class="block mb-2 font-bold">{{ $t('SupervisorCalendar.SelectPlaceholder') }}</label>
      <select
        id="approvee"
        v-model="selectedUser"
        @change="fetchCalendarData"
        class="p-2 border rounded w-full"
      >
        <option value="" disabled>{{ $t('SupervisorCalendar.SelectPlaceholder') }}</option>
        <option v-for="user in approvees" :key="user.id" :value="user.id">
          {{ user.first_name }} {{ user.last_name }}
        </option>
      </select>
      <p v-if="approvees.length === 0" class="text-red-500 mt-2">No approvees found.</p>
    </div>

    <!-- Calendar -->
    <div v-if="selectedUser" class="mt-4">
      <div id="calendar" ref="calendar" class="w-full"></div>
    </div>
    <p v-if="selectedUser && calendarData.length === 0" class="mt-4 text-gray-500">No calendar data for this user.</p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from "vue";
import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import enLocale from "@fullcalendar/core/locales/en-gb";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

const approvees = ref([]); // Lista degli utenti approvati
const selectedUser = ref(null); // Utente selezionato
const calendarData = ref([]); // Dati del calendario
const calendarRef = ref(null); // Riferimento all'elemento del calendario
let calendarInstance = null; // Istanza di FullCalendar

// Fetch approvees associati al supervisore
const fetchApprovees = async () => {
  try {
    const response = await axios.get(`${apiUrl}/approvals/1`);
    approvees.value = response.data.approvees || [];
    console.log("Approvees:", approvees.value);
  } catch (error) {
    console.error("Error fetching approvees:", error.response?.data || error.message);
  }
};

// Fetch dati del calendario per l'utente selezionato
const fetchCalendarData = async () => {
  if (!selectedUser.value) return;

  try {
    const response = await axios.get(`${apiUrl}/accounts/${selectedUser.value}/attendance`);
    calendarData.value = response.data.map((item) => ({
      id: item.id,
      title: `${item.punch_in.split("T")[1].slice(0, 5)} - ${item.punch_out.split("T")[1].slice(0, 5)}`,
      start: item.day,
      backgroundColor: getEventColor(item),
      extendedProps: {
        punch_in: item.punch_in.split("T")[1].slice(0, 5),
        punch_out: item.punch_out.split("T")[1].slice(0, 5),
      },
    }));

    if (calendarInstance) {
      calendarInstance.removeAllEvents();
      calendarInstance.addEventSource(calendarData.value);
    }
  } catch (error) {
    console.error("Error fetching calendar data:", error.response?.data || error.message);
  }
};

// Determina il colore dell'evento in base al tipo di dato
const getEventColor = (data) => {
  if (data.absence) return "red";
  if (data.full_pto) return "orange";
  if (data.special_pto) return "green";
  return "blue";
};

// Inizializza il calendario
const initializeCalendar = async () => {
  await nextTick(); // Assicura che il DOM sia completamente montato

  const calendarElement = calendarRef.value;

  if (!calendarElement) {
    console.error("Calendar element not found.");
    return;
  }

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
};


onMounted(async () => {
  await fetchApprovees();
  initializeCalendar();
});

// Aggiorna il calendario quando i dati cambiano
watch(calendarData, () => {
  if (calendarInstance) {
    calendarInstance.removeAllEvents();
    calendarInstance.addEventSource(calendarData.value);
  }
});
</script>









