<template>
  <div class="h-screen">
    <!-- User Selection Dropdown -->
    <div class="mb-4">
      <label for="user-select" class="block text-sm font-semibold">{{$t('supervisorCalendar.teamMembers')}}</label>
      <select
        id="user-select"
        v-model="selectedUserId"
        @change="fetchAttendanceData"
        class="w-full p-2 border rounded"
      >
        <option value="" disabled selected>{{$t('supervisorCalendar.selectPlaceholder')}}</option>
        <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
      </select>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-3 gap-4 mb-4">
      <div class="bg-white shadow-sm border border-slate-200 rounded-lg p-2 flex flex-row justify-evenly items-center min-w-[200px]">
        <div>
          <div class="text-xl sm:text-2xl md:text-3xl text-slate-600" style="font-size: clamp(1rem, 2vw, 2rem)">
            {{$t('calendar.headers.totalWorked')}}</div>
            <div class="text-xs sm:text-sm md:text-base" style="font-size: clamp(0.75rem, 2vw, 1rem)">{{$t('calendar.headers.currentMonth')}}</div>
        </div>
        <hr class="w-px h-10 border-l border-slate-300 mx-4">
        <div class="text-xl sm:text-2xl md:text-3xl text-slate-600" style="font-size: clamp(1rem, 2vw, 2rem)">
          {{ totalWorkedHours % 1 === 0 ? totalWorkedHours : totalWorkedHours.toFixed(2) ?? 0 }} {{ $t('calendar.headers.hours') }}</div>
      </div>

      <div class="bg-white shadow-sm border border-slate-200 rounded-lg p-4 flex flex-row justify-evenly items-center min-w-[200px]">
        <div>
          <div class="text-xl sm:text-2xl md:text-3xl text-slate-600" style="font-size: clamp(1rem, 2vw, 2rem)">
            {{$t('calendar.headers.overtime')}}</div>
            <div class="text-xs sm:text-sm md:text-base" style="font-size: clamp(0.75rem, 2vw, 1rem)">
              {{$t('calendar.headers.currentMonth')}}</div>
        </div>
        <hr class="w-px h-10 border-l border-slate-300 mx-4">
        <div class="text-xl sm:text-2xl md:text-3xl text-slate-600" style="font-size: clamp(1rem, 2vw, 2rem)">
          {{ overtimeHours ?? 0 }} {{$t('calendar.headers.hours')}}</div>
      </div>

      <div class="bg-white shadow-sm border border-slate-200 rounded-lg p-4 flex flex-row justify-evenly items-center min-w-[200px]">
        <div>
          <div class="text-xl sm:text-2xl md:text-3xl text-slate-600" style="font-size: clamp(1rem, 2vw, 2rem)">
            {{$t('calendar.headers.pto')}}</div>
            <div class="text-xs sm:text-sm md:text-base" style="font-size: clamp(0.75rem, 2vw, 1rem)">
              {{$t('calendar.headers.totalRemaining')}}</div>
        </div>
        <hr class="w-px h-10 border-l border-slate-300 mx-4">
        <div class="text-xl sm:text-2xl md:text-3xl text-slate-600" style="font-size: clamp(1rem, 2vw, 2rem)">
          {{ remainingPtoDays ?? 0 }} {{$t('calendar.headers.days')}}</div>
      </div>
    </div>

    <!-- Calendar -->
    <div class="flex-1 bg-white shadow-sm border border-slate-200 rounded-lg p-4 overflow-hidden" style="height: calc(100vh - 200px);">
     <div ref="calendar" class="h-full"></div>
    </div>
  </div>
</template>

<script>
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import enLocale from '@fullcalendar/core/locales/en-gb';
import jaLocale from '@fullcalendar/core/locales/ja';
import { useI18n } from 'vue-i18n';
import i18n from '../i18n.ts';
const { t } = i18n.global;

const apiUrl = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

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
      breakTime: null,
      locales: {
        'en-US': enLocale,
        'ja-JP': jaLocale,
      },
    };
  },
  methods: {
    async fetchUsers() {
      const authStore = useAuthStore();
      try {
        const response = await axios.get(`${apiUrl}/approvals/${authStore.user.id}`);
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
      } catch (err) {
        console.error('Error fetching remaining PTO:', err);
        this.remainingPtoDays = 0;
      }
    },
    generateJapaneseHolidays(year) {
      return [
        { title: `${t('holidays.comingOfAgeDay')}`, start: `${year}-01-08`, isHoliday: true },
        { title: `${t('holidays.foundationDay')}`, start: `${year}-02-11`, isHoliday: true },
        { title: `${t('holidays.emperorsBirthday')}`, start: `${year}-02-23`, isHoliday: true },
        { title: `${t('holidays.springEquinox')}`, start: `${year}-03-21`, isHoliday: true },
        { title: `${t('holidays.showaDay')}`, start: `${year}-04-29`, isHoliday: true },
        { title: `${t('holidays.memorialDay')}`, start: `${year}-05-03`, isHoliday: true },
        { title: `${t('holidays.greeneryDay')}`, start: `${year}-05-04`, isHoliday: true },
        { title: `${t('holidays.childrensDay')}`, start: `${year}-05-05`, isHoliday: true },
        { title: `${t('holidays.marineDay')}`, start: `${year}-07-15`, isHoliday: true },
        { title: `${t('holidays.mountainDay')}`, start: `${year}-08-11`, isHoliday: true },
        { title: `${t('holidays.autumnEquinox')}`, start: `${year}-09-23`, isHoliday: true },
        { title: `${t('holidays.sportsDay')}`, start: `${year}-10-14`, isHoliday: true },
        { title: `${t('holidays.cultureDay')}`, start: `${year}-11-03`, isHoliday: true },
        { title: `${t('holidays.thanksgiving')}`, start: `${year}-11-23`, isHoliday: true },
        { title: `${t('holidays.newYearsHoliday')}`, start: `${year}-12-28`, isHoliday: true },
        { title: `${t('holidays.newYearsHoliday')}`, start: `${year}-12-29`, isHoliday: true },
        { title: `${t('holidays.newYearsHoliday')}`, start: `${year}-12-30`, isHoliday: true },
        { title: `${t('holidays.newYearsHoliday')}`, start: `${year}-12-31`, isHoliday: true },
        { title: `${t('holidays.newYearsHoliday')}`, start: `${year}-01-01`, isHoliday: true },
        { title: `${t('holidays.newYearsHoliday')}`, start: `${year}-01-02`, isHoliday: true },
        { title: `${t('holidays.newYearsHoliday')}`, start: `${year}-01-03`, isHoliday: true }
      ];
    },
    initializeCalendar() {
      const { locale } = useI18n();
      const calendarEl = this.$refs.calendar;
      if (calendarEl) {
        this.calendar = new Calendar(calendarEl, {
          plugins: [dayGridPlugin, interactionPlugin],
          initialView: 'dayGridMonth',
          events: [],
          locale: this.locales[locale.value],
          businessHours: {
            daysOfWeek: [1, 2, 3, 4, 5],
          },
          buttonText: {
          today: 'Today',
          },
          datesSet: (info) => {
            this.handleMonthChange(info.start);
          },
          eventContent: this.eventContent,
          fixedWeekCount: false,
        });
        this.calendar.render();
      }
    },
  handleMonthChange(startDate) {
    const midViewDate = new Date(
    (this.calendar.view.activeStart.getTime() + this.calendar.view.activeEnd.getTime()) / 2
   );

  const year = midViewDate.getFullYear();
  const month = midViewDate.getMonth() + 1; 

  this.fetchAttendanceDataForMonth(year, month);
},
async fetchAttendanceDataForMonth(year, month) {
  if (!this.selectedUserId) {
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

    const attendanceEvents = attendanceRecords.map((record) => {
      const punchInTime = record.punch_in ? record.punch_in.split('T')[1].slice(0, 5) : '';
      const punchOutTime = record.punch_out ? record.punch_out.split('T')[1].slice(0, 5) : '';
      const breakTime = record.break_amount ? `${record.break_amount} min` : "None";
      console.log(breakTime);

      return {
        id: record.id,
        title: `${punchInTime} - ${punchOutTime}`,
        start: record.day,
        backgroundColor: record.absence ? 'pink' : 'lightblue',
        extendedProps: {
          attendanceType: record.absence ? 'absence' : 'general',
          startTime: punchInTime,  
          endTime: punchOutTime,   
          totalHours: record.punch_in && record.punch_out
            ? (new Date(record.punch_out) - new Date(record.punch_in)) / (1000 * 60 * 60)
            : 0,
          breakTime: breakTime,
        },
      };
    });

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

    let totalBreakMinutes = 0;
    
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

      const breakTimeMinutes = parseInt(event.extendedProps?.breakTime?.replace(' min', '')) || 0;
      totalBreakMinutes += breakTimeMinutes;
      return sum + (event.extendedProps?.totalHours || 0);
    }, 0);

    this.totalWorkedHours = calculatedTotalHours;
    this.totalWorkedHours = calculatedTotalHours - totalBreakMinutes / 60;
    this.overtimeHours = Math.max(0, calculatedTotalHours - 160);

  } catch (error) {
    console.error('Error fetching attendance data:', error);
  }
}
,
    eventContent: (arg) => {
  // Gestione delle festività
  if (arg.event.extendedProps.isHoliday) {
    return {
      html: `
        <div style="text-align: left; font-size: 1vw; color: white; background-color: rgba(255, 0, 0, 0.2); padding: .5vw; border-radius: 4px; width: 100%; word-wrap: break-word; white-space: normal;">
          <b>${arg.event.title}</b>
        </div>
      `,
    };
  }

  // Gestione degli eventi con orari di ingresso e uscita
  if (arg.event.extendedProps.startTime && arg.event.extendedProps.endTime) {
    const breakTime = arg.event.extendedProps.breakTime
      ? `<small style="font-size: 0.8vw; color: gray;">Break: ${arg.event.extendedProps.breakTime}</small>`
      : '';
    return {
      html: `
        <div style="text-align: left; font-size: 1vw; color: black; background-color: ${arg.event.backgroundColor}; padding: .5vw; border-radius: 4px; width: 100%; word-wrap: break-word; white-space: normal;">
          <b>${arg.event.extendedProps.startTime} - ${arg.event.extendedProps.endTime}</b><br>
          ${breakTime}
        </div>
      `,
    };
  }

  // Gestione degli eventi PTO
  if (arg.event.extendedProps.status) {
    return {
      html: `
        <div style="text-align: center; font-size: 1vw; color: white; background-color: ${arg.event.backgroundColor}; padding: .5vw; border-radius: 4px; width: 100%; word-wrap: break-word; white-space: normal;">
          <b>${arg.event.title}</b><br><i>${arg.event.extendedProps.status}</i>
        </div>
      `,
    };
  }

  return {
    html: `<div style="padding: 5px; border-radius: 4px;">${arg.event.title}</div>`,
  };
}

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






