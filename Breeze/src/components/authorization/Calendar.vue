<template>
    <div>
        <div ref="calendar"></div>
    </div>
</template>

<script>
import { Calendar } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction'; // for selectable
import dayGridPlugin from '@fullcalendar/daygrid';
import Holidays from 'date-holidays';

let hd = new Holidays('JP')
let holiday2024 = hd.getHolidays(2024);
let eventsArr = holiday2024.map((holiday) => ({
    title: holiday.name,
    start: holiday.start,
    allDay: true
}));

let workingDays = [
    {
        date: '2024-11-20',
        hours: '8am - 5pm'
    },
    {
        date: '2024-11-21',
        hours: '8am - 5pm'
    },
    {
        date: '2024-11-22',
        hours: '8am - 5pm'
    },
    {
        date: '2024-11-25',
        hours: '8am - 5pm'
    },
    {
        date: '2024-11-26',
        hours: '8am - 5pm'
    },
]

export default {
    name: "FullCalendarComponent",
    mounted() {
        const calendarEl = this.$refs.calendar;

        this.calendar = new Calendar(calendarEl, {
            plugins: [interactionPlugin, dayGridPlugin],
            initialView: 'dayGridMonth',
            selectable: true,
            select: (selectionInfo) => {
                alert(
                    `Selected range: ${selectionInfo.startStr} to ${selectionInfo.endStr}`
                );
            },
            fixedWeekCount: false,
            events: eventsArr,
            eventColor: '#5d7de9',
            businessHours: {
                daysOfWeek: [1, 2, 3, 4, 5],
            },
            dayCellDidMount: function (arg) {
                const matchedDate = workingDays.find(workingDay =>
                    workingDay.date === `${arg.date.getFullYear()}-${String(arg.date.getMonth() + 1).padStart(2, '0')}-${String(arg.date.getDate()).padStart(2, '0')}`
                );

                //if day matches add text
                if (matchedDate) {
                    let customText = document.createElement('div');
                    customText.style.textAlign = 'center';
                    customText.style.position = 'absolute';
                    customText.style.top = '50%';
                    customText.style.left = '50%';
                    customText.style.transform = 'translate(-50%, -50%)';
                    arg.el.style.position = 'relative';
                    customText.textContent = matchedDate.hours;
                    arg.el.appendChild(customText);
                }
            },
        });
        this.calendar.render();
    },
    beforeUnmount() {
        if (this.calendar) {
            this.calendar.destroy();
        }
    },
};
</script>

<style>
.fc-event-title {
    font-weight: bold;
}
</style>