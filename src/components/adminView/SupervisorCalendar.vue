<template>
  <div v-if="isVisible" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <div class="bg-white p-6 rounded shadow-lg max-w-5xl w-full relative">
      <!-- Close Button -->
      <button @click="onClose" class="absolute top-4 right-4 text-gray-500 hover:text-gray-800">✕</button>

      <!-- Title -->
      <h2 class="text-2xl font-bold mb-6 text-center">
        {{ $t("attendance.title") }} - {{ employeeName }}
      </h2>

      <!-- FullCalendar -->
      <div id="calendar" ref="calendar" class="w-full"></div>
    </div>
  </div>
</template>

<script>
import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import enLocale from "@fullcalendar/core/locales/en-gb";
import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

export default {
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
    accountId: {
      type: Number,
      default: null,
    },
    employeeName: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      calendar: null,
      events: [],
    };
  },
  methods: {
    fetchAttendanceData() {

      const authStore = useAuthStore();
      console.log(authStore.user.id);
      const idToFetch = this.getUserIdFromAuthStore();

      if (!idToFetch) {
        console.error("Account ID is not provided or available in authStore.");
        return;
      }

      axios
        .get(`http://localhost:3000/accounts/${idToFetch}/attendance`)
        .then((response) => {
          this.events = response.data.map((record) => ({
            id: record.id,
            title: `${record.punch_in.split("T")[1].slice(0, 5)} - ${record.punch_out.split("T")[1].slice(0, 5)}`,
            start: record.day,
            backgroundColor: this.getEventColor(record),
            extendedProps: {
              punch_in: record.punch_in,
              punch_out: record.punch_out,
            },
          }));

          if (this.calendar) {
            this.calendar.getEvents().forEach((event) => event.remove());
            this.events.forEach((event) => this.calendar.addEvent(event));
          }
        })
        .catch((error) => {
          console.error("Error fetching attendance records:", error);
        });
    },
    getEventColor(record) {
      if (record.absence) return "red";
      if (record.full_pto) return "orange";
      if (record.special_pto) return "green";
      return "blue";
    },
    initializeCalendar() {
     const calendarEl = this.$refs.calendar;

     if (!calendarEl) {
      console.error("Calendar element is not found or not ready.");
     return;
    }

    this.calendar = new Calendar(calendarEl, {
     plugins: [dayGridPlugin, interactionPlugin],
     initialView: "dayGridMonth",
     locale: enLocale,
     events: this.events,
     eventContent: (arg) => {
      if (arg.event.extendedProps.punch_in && arg.event.extendedProps.punch_out) {
        return {
          html: `<div style="text-align: center; font-size: 0.9em; color: white; background-color: ${
            arg.event.backgroundColor
          }; padding: 5px; border-radius: 4px;">
            <b>${arg.event.extendedProps.punch_in.split("T")[1].slice(0, 5)} - ${arg.event.extendedProps.punch_out.split("T")[1].slice(0, 5)}</b>
          </div>`,
        };
      }
    },
  });

  this.calendar.render();
}
,
    onClose() {
      this.$emit("close");
    },
  },
  watch: {
   isVisible(newVal) {
    if (newVal) {
      this.$nextTick(() => {
        if (!this.calendar) {
          this.initializeCalendar();
        }
        this.fetchAttendanceData();
      });
    } else {
      if (this.calendar) {
        this.calendar.destroy();
        this.calendar = null;
      }
    }
   },
  },
  mounted() {
  if (this.isVisible) {
    this.$nextTick(() => {
      this.initializeCalendar();
      this.fetchAttendanceData();
    });
   }
  },
  beforeUnmount() {
  if (this.calendar) {
    console.log("Destroying calendar instance...");
    this.calendar.destroy();
    this.calendar = null;
   }
  },
};
</script>




