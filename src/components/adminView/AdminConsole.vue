<template>
    <div class="p-8 bg-gray-50 min-h-screen">
        <h1 class="text-2xl font-bold">{{$t('adminConsole.title')}}</h1>
        <h2 class="text-xl font-bold"> {{ organizationName }}</h2>
            <div class="text-xl text-center my-5">{{$t('adminConsole.fields.teamList')}}</div>
                <div>
                    <ul class="flex flex-col">
                        <li 
                            v-for="(team, index) in teams" 
                            :key="team.id"
                            class="flex justify-around"
                        >
                            <input
                                v-if="editingIndex === index"
                                v-model="teams[index].team_name"
                                @blur="stopEditing"
                                @keyup.enter="stopEditing"
                            />
                            <span 
                                v-else
                                class="border-2"
                            >
                            {{ team.team_name }}</span>
                            <button 
                                @click="startEditing(index)" 
                                v-if="editingIndex !== index"
                                class="border-2"
                            >
                                Edit
                            </button>
                            <button 
                                @click="deleteTeam(team.id)"
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
                </div>
            <div class="text-xl text-center my-5">{{$t('adminConsole.fields.adminSettings')}}</div>
                <div class="grid grid-cols-2">
                    <label class="font-medium text-center">{{$t('adminConsole.fields.minimumWorkHours')}}</label>
                    <input
                        type="text"
                        class="border rounded p-2"
                        />
                </div>
            <div class="text-xl text-center my-5">{{$t('adminConsole.fields.organizationSettings')}}</div>
                <div class="grid grid-cols-2">
                    <label class="font-medium text-center">{{$t('adminConsole.fields.organizationName')}}</label>
                    <input
                        type="text"
                        v-model="formData.organizationName"
                        class="border rounded p-2"
                    />
                </div>
        <div class="flex flex-col items-center my-5">
            <button 
                @click="saveSettings"
                class="my-1 w-1/2 py-1 px-3 rounded bg-blue-500 text-white"
            >
                {{$t('adminConsole.buttons.save')}}
            </button>
            <button 
                class="my-1 w-1/2 py-1 rounded bg-red-500 text-white"
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
const activeCompanyId = authStore.user.company_id;

const formData = ref({
    organizationName: '',
});

// Reactive state
const teams = ref([]);

// New team variable 
const newTeam = ref('');
// Organization name variable
const organizationName = ref('');

const getOrganizationName = async () => {
    try {
        const response = await axios.get(`${apiUrl}/organizations/${activeCompanyId}`)
        organizationName.value = response.data.name;
    } catch(err) {
        console.error('Error fetching organization name:', err);
    }
}

// Get teams
// TODO add validation when no team exists
const getTeams = async () => {
    try {
        const response = await axios.get(`${apiUrl}/organizations/${activeCompanyId}/teams`);
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

// Stop editing the team (disable the input field and save changes)
const stopEditing = async () => {
    const team = teams.value[editingIndex.value];
    const updatedTeamName = team.team_name; // The updated team name

    try {
        // Send PATCH request to update the team name in the backend
        const response = await axios.patch(`${apiUrl}/teams/${team.id}`, {
            updatedTeamName // The new team name
        });

        if (response.status === 200) {
            // Update the team name in the teams array (local state)
            console.log(updatedTeamName);
            teams.value[editingIndex.value].team_name = updatedTeamName;

            // Stop editing after successful update
            editingIndex.value = null;
            alert('Team name updated successfully!');
        } else {
            alert('Failed to update the team name.');
        }
    } catch (err) {
        console.error('Error updating team name:', err);
        alert('An error occurred while updating the team name.');
    }
};

// Add new team
const addTeam = async () => {
    try {
        console.log(newTeam.value);
        const newTeamName = newTeam.value;
        const response = await axios.post(`${apiUrl}/organizations/${activeCompanyId}/teams`, {
            newTeamName
        });

        if (response.data) {
            teams.value.push(response.data); 
            newTeam.value = ''; 
        }

        console.log('New team saved:', toRaw(response));
        alert('New team saved successfully!');
    } catch (err) {
        console.error(err);
    }
};

// Delete a team
const deleteTeam = async (teamId) => {
    try {

        // Optimistically remove the team from the array
        const originalTeams = [...teams.value];
        teams.value = teams.value.filter(team => team.id !== teamId);

        const response = await axios.delete(`${apiUrl}/teams/${teamId}`)

        if (response.status !== 200) {
            // If the deletion fails, revert the change
            teams.value = originalTeams;
            console.error('Failed to delete the team.');
        } else {
            console.error('Team deleted successfully!');
        }

    } catch (err) {
        console.error(err);
    }
}

// Save settings on click for admin settings outside of team list
const saveSettings = async () => {
    try {

    const adminConsoleData = toRaw(formData.value);
    organizationName.value = formData.value.organizationName;

    const response = await axios.patch(`${apiUrl}/organizations/${activeCompanyId}`, {
        adminConsoleData
    },
    {
        withCredentials: true,
    })

    if (response.status === 200) {
        authStore.user.company.name = organizationName.value;
        console.log('Settings saved:', toRaw(formData.value));
        alert('Settings saved successfully!');
    }

    } catch(err) {
        console.error(err);
    }
};

// Fetch teams when the component is mounted
onMounted(() => {
    getTeams();
    getOrganizationName();
});

</script>