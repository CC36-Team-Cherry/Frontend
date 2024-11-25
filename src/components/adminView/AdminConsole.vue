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
                        <span 
                            v-else
                            class="border-2"
                        >
                        {{ team.name }}</span>
                        <button 
                            @click="startEditing(index)" 
                            v-if="editingIndex !== index"
                            class="border-2"
                        >
                            Edit
                        </button>
                        <button 
                            @click="deleteTeam(index)"
                            class="border-2"
                        >
                            Delete
                        </button>
                    </li>
                </ul>
                <div class="flex justify-around">
                    <input
                        v-model="newTeam"
                        type="text"
                        placeholder="Enter Team Name"
                        class="border-2"
                    />
                    <button
                        @click="addTeam(newTeam)"
                        class="border-2"
                    >
                        Add
                    </button>
                </div>
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
import { ref, toRaw, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
const authStore = useAuthStore();

const formData = ref({
    organizationName: '',
});

// TODO: Add organization id state

// Reactive state
const teams = ref([
  { "id": 1, "name": "Team A" },
  { "id": 2, "name": "Team B" },
  { "id": 3, "name": "Team C" }
]);

// New team variable 
const newTeam = ref('');

// Get teams
// TODO finish get teams endpoint
const getTeams = async () => {
    try {
        const response = await axios.get(`${apiUrl}/organizations/${organizationId}`);
            // Store the fetched teams in state
            console.log(response.data);
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

// Add new team
const addTeam = async (newTeam) => {
    try {
        const response = await axios.get(`${apiUrl}/organizations/${organizationId}`);
        console.log(newTeam);
        // console.log('New team saved:', toRaw(formData.value));
        // alert('New team saved successfully!');
    } catch (err) {
        console.error(err);
    }
};

// Stop editing and save changes
const stopEditing = () => {
      editingIndex.value = null;
    };

// Save settings on click for admin settings outside of team list
const saveSettings = async () => {
    try {

    const adminConsoleData = toRaw(formData.value);
    // TEST DATA: Need to replace with state of logged in account and org id
    console.log(authStore.user)

    await axios.patch(`${apiUrl}/organizations/${authStore.user.company_id}`, {
        adminConsoleData
    },
    {
        withCredentials: true,
    })

    console.log('Settings saved:', toRaw(formData.value));
    alert('Settings saved successfully!');

    } catch(err) {
        console.error(err);
    }
};

// Fetch teams when the component is mounted
onMounted(() => {
    getTeams();
});

</script>