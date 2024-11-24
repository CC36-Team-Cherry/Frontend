<template>
    <div class="p-8 bg-gray-50 min-h-screen">
        <h1 class="border-2 text-2xl font-bold">{{$t('adminConsole.title')}}</h1>
            <div class="border-2 text-xl text-center my-5">{{$t('adminConsole.fields.teamList')}}</div>
                <ul class="flex flex-col">
                    <li 
                        v-for="(team, index) in teams" 
                        :key="team.id"
                        class="flex justify-around"
                    >
                        <input
                            v-if="editingIndex === index"
                            v-model="teams[index].name"
                            @blur="stopEditing"
                            @keyup.enter="stopEditing"
                        />
                        <span v-else>{{ team.name }}</span>
                        <button @click="startEditing(index)" v-if="editingIndex !== index">Edit</button>
                        <button @click="deleteTeam(index)">Delete</button>
                    </li>
                </ul>
            <div class="border-2 text-xl text-center my-5">{{$t('adminConsole.fields.adminSettings')}}</div>
                <div class="grid grid-cols-2 border-2">
                    <label class="font-medium text-center">{{$t('adminConsole.fields.minimumWorkHours')}}</label>
                    <input
                        type="text"
                        class="border rounded p-2"
                        />
                </div>
            <div class="border-2 text-xl text-center my-5">{{$t('adminConsole.fields.organizationSettings')}}</div>
                <div class="grid grid-cols-2 border-2">
                    <label class="font-medium text-center">{{$t('adminConsole.fields.organizationName')}}</label>
                    <input
                        type="text"
                        v-model="formData.organizationName"
                        class="border rounded p-2"
                    />
                </div>
        <div class="border-2 flex flex-col items-center my-5">
            <button 
                @click="saveSettings"
                class="border-2 my-1 w-1/2 py-1 px-3 rounded bg-blue-500 text-white"
            >
                {{$t('adminConsole.buttons.save')}}
            </button>
            <button 
                class="border-2 my-1 w-1/2 py-1 rounded bg-red-500 text-white"
            >
                {{$t('adminConsole.buttons.deleteOrganization')}}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, toRaw } from 'vue';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const formData = ref({
    organizationName: '',
});

// Reactive state
const teams = ref([
  { "id": 1, "name": "Team A" },
  { "id": 2, "name": "Team B" },
  { "id": 3, "name": "Team C" }
]);

// Get teams
// TODO finish get teams endpoint
const getTeams = async () => {
    try {
        const response = await axios.get(`${apiUrl}/organizations/${organizationId}`);
            // Store the fetched teams in state
            teams.value = response.data;
    } catch(err) {
        console.error('Error fetching teams:', err);
    }
};

// Team editing 
const editingIndex = ref(null);
const startEditing = (index) => {
      editingIndex.value = index;
    };
// Stop editing and save changes
const stopEditing = () => {
      editingIndex.value = null;
    };

// Save settings for admin settings outside of team list
const saveSettings = async () => {
    try {

    const adminConsoleData = toRaw(formData.value);
    // TEST DATA: Need to replace with state of logged in account and org id
    const organizationId = 19;

    await axios.patch(`${apiUrl}/organizations/${organizationId}`, {
        adminConsoleData
    },
    {
        withCredentials: true,
    })

    console.log('Settings saved:', formData.value);
    alert('Settings saved successfully!');

    } catch(err) {
        console.error(err);
    }
};

</script>