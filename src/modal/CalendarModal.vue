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

    <!-- Seleziona un utente prima di mostrare il calendario -->
    <div v-if="selectedUser && calendarData.length === 0" class="mt-4 text-gray-500">
      No calendar data for this user.
    </div>

    <!-- Calendar -->
    <div v-if="selectedUser && calendarData.length > 0" class="mt-4">
      <div id="calendar" ref="calendar" class="w-full"></div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import enLocale from "@fullcalendar/core/locales/en-gb";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

axios.defaults.withCredentials = true;

export default {
  name: "SupervisorCalendar",
  setup() {
    const approvees = ref([]);
    const selectedUser = ref(null);
    const calendarData = ref([]);
    let calendarInstance = null;

    
    const fetchApprovees = async () => {
      try {
        const response = await axios.get(`${apiUrl}/approvals/1`);
        approvees.value = response.data.approvees || [];
        console.log("Approvees:", approvees.value);
      } catch (error) {
        console.error("Error fetching approvees:", error.response?.data || error.message);
      }
    };

    
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

    
    const getEventColor = (data) => {
      if (data.absence) return "red";
      if (data.full_pto) return "orange";
      if (data.special_pto) return "green";
      return "blue";
    };

    
    const initializeCalendar = () => {
      const calendarElement = document.getElementById("calendar");

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

    
    onMounted(() => {
      fetchApprovees();

      const calendarElement = document.getElementById("calendar");
      if (calendarElement) {
        initializeCalendar();
      } else {
        console.error("Calendar element not found during onMounted.");
      }
    });

  
    watch(calendarData, () => {
      if (calendarInstance) {
        calendarInstance.removeAllEvents();
        calendarInstance.addEventSource(calendarData.value);
      }
    });

    return {
      approvees,
      selectedUser,
      calendarData,
      fetchCalendarData,
    };
  },
};
</script>

  