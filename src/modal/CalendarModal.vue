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
  
  export default {
    props: {
      isVisible: {
        type: Boolean,
        required: true,
      },
      accountId: {
        type: Number,
        required: true, // Required, so we ensure it's always provided
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
      /**
       * Fetch attendance data for the given accountId.
       */
      fetchAttendanceData() {
        console.log(`Fetching attendance data for Account ID: ${this.accountId}`);
        if (!this.accountId) {
          console.error("Account ID is required but not provided.");
          return;
        }
  
        axios
          .get(`http://localhost:3000/accounts/${this.accountId}/attendance`)
          .then((response) => {
            console.log("Attendance data fetched successfully:", response.data);
  
            // Map data to FullCalendar event structure
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
  
            // Add events to the calendar
            if (this.calendar) {
              this.calendar.getEvents().forEach((event) => event.remove());
              this.events.forEach((event) => this.calendar.addEvent(event));
            }
          })
          .catch((error) => {
            console.error("Error fetching attendance records:", error);
          });
      },
      /**
       * Determine the color of the event based on the record data.
       */
      getEventColor(record) {
        if (record.absence) return "red";
        if (record.full_pto) return "orange";
        if (record.special_pto) return "green";
        return "blue";
      },
      /**
       * Initialize the FullCalendar instance.
       */
      initializeCalendar() {
        const calendarEl = this.$refs.calendar;
  
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
      },
      /**
       * Close the modal and destroy the calendar instance.
       */
      onClose() {
        this.$emit("close");
      },
    },
    watch: {
      /**
       * Watch for visibility changes and fetch attendance data if the modal is opened.
       */
      isVisible(newVal) {
        if (newVal) {
          console.log("CalendarModal opened. Fetching attendance data...");
          this.fetchAttendanceData();
        }
      },
      /**
       * Watch for accountId changes and fetch new attendance data if the ID changes.
       */
      accountId(newAccountId) {
        if (newAccountId) {
          console.log(`Account ID changed to: ${newAccountId}. Fetching attendance data...`);
          this.fetchAttendanceData();
        }
      },
    },
    mounted() {
      console.log("Initializing calendar...");
      this.initializeCalendar();
  
      // Fetch initial attendance data
      this.fetchAttendanceData();
    },
    beforeUnmount() {
      if (this.calendar) {
        this.calendar.destroy();
      }
    },
  };
  </script>

  