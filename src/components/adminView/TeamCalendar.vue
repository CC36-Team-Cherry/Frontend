<template>
  <div v-if="isSupervisor" class="team-calendar">
    <h2>Team Calendar</h2>

    
    <div class="team-dropdown">
      <label for="teamMember">Select a team member:</label>
      <select id="teamMember" v-model="selectedTeamMember" @change="loadCalendar">
        <option v-for="member in teamMembers" :key="member.id" :value="member.id">
          {{ member.first_name }} {{ member.last_name }}
        </option>
      </select>
    </div>

    
    <Calendar v-if="selectedTeamMember" :userId="selectedTeamMember" :readOnly="true" />
  </div>
  <div v-else>
    <p>You do not have access to this page.</p>
  </div>
</template>

<script>
import Calendar from './Calendar.vue'; 

export default {
  name: 'TeamCalendar',
  components: {
    Calendar,
  },
  data() {
    return {
      teamMembers: [], 
      selectedTeamMember: null, 
    };
  },
  computed: {
    
    isSupervisor() {
      return this.$store.state.user.role === 'supervisor';
    },
  },
  created() {
    this.fetchTeamMembers(); 
  },
  methods: {
    async fetchTeamMembers() {
      try {
        const response = await this.$axios.get('/api/team/members'); 
        this.teamMembers = response.data;
      } catch (error) {
        console.error('Errore nel caricamento dei membri del team:', error);
      }
    },
    loadCalendar() {
      
    },
  },
};
</script>
