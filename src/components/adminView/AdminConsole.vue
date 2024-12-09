<template>
    <LoopingRhombusesSpinner v-if="isLoading" />
    <div v-else class="p-8 bg-gray-50 h-screen">
        <h1 class="text-2xl font-bold">{{ $t('adminConsole.title') }}</h1>
        <h2 class="text-xl font-bold"> {{ organizationName }}</h2>

        <!-- Team List -->
        <div class="text-2xl font-bold text-center my-5">{{ $t('adminConsole.fields.teamList') }}</div>

                    <!-- Add Team  -->
            <div class="flex justify-center space-x-4 m-6">
                <input v-model="newTeam" type="text" placeholder="Enter Team Name" class="border-2 rounded p-2 w-64" />
                <button @click="addTeam(newTeam)" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded">
                    Add
                </button>
            </div>

        <div class="overflow-x-auto flex justify-center">
            <table class="w-8/12 table-auto border-collapse">
                <thead class="bg-gray-200">
                    <tr>
                        <th class="border p-2 text-left w-2/3">Team Name</th>
                        <th class="border p-2 text-left w-1/3">Actions</th>
                    </tr>
                </thead>
                <tr v-for="(team, index) in teams" :key="team.id" class="hover:bg-gray-100 even:bg-gray-50">
                    <td class="border p-2">
                        <div v-if="editingIndex === index">
                            <input v-model="teams[index].team_name" @blur="stopEditing" @keyup.enter="stopEditing" class="border rounded p-2 w-48"/>
                        </div>   
                        <span v-else class="p-2">
                            {{ team.team_name }}
                        </span>
                    </td>
                    <td class="border p-2 flex space-x-2 justify-center">
                        <button @click="startEditing(index)" v-if="editingIndex !== index" class="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded mr-2">
                            {{ $t('adminConsole.buttons.edit') }}
                        </button>
                        <button @click="stopEditing" v-else class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2">{{ $t('adminConsole.buttons.save') }}</button>
                        <button @click="deleteTeam(team.id)" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                            {{ $t('adminConsole.buttons.delete') }}
                        </button>
                    </td>
                </tr>
            </table>
        </div>

        <!-- Minimum Work Hours Per Day -->
        <!-- <div class="text-xl text-center my-5">{{ $t('adminConsole.fields.adminSettings') }}</div>
        <div class="grid grid-cols-2">
            <label class="font-medium text-center">{{ $t('adminConsole.fields.minimumWorkHours') }}</label>
            <input type="text" class="border rounded p-2" />
        </div> -->

        <!-- Organization Setting -->
        <div class="text-2xl text-center font-bold my-5">{{ $t('adminConsole.fields.organizationSettings') }}</div>
        <div class="flex flex-row justify-center items-center gap-8">
            <!-- <label class="font-medium text-left">{{ $t('adminConsole.fields.organizationName') }}</label> -->
            <input type="text" v-model="formData.organizationName" class="border rounded p-2 w-1/6" :placeholder=authStore.user.company.name />
                    <!-- Save and Delete buttons -->
            <button @click="saveSettings" class="my-1 w-1/6 py-2 px-3 rounded bg-blue-500 hover:bg-blue-600 transition text-white">
                {{ $t('adminConsole.buttons.saveName') }}
            </button>
            <button @click="openConfirmModal" class="my-4 w-1/6 py-2 rounded bg-red-500 hover:bg-red-600 transition text-white">
                {{ $t('adminConsole.buttons.deleteOrganization') }}
            </button>
        </div>

        <!-- <div class="flex justify-center space-x-4 m-6">
                <input v-model="newTeam" type="text" placeholder="Enter Team Name" class="border-2 rounded p-2 w-64" />
                <button @click="addTeam(newTeam)" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded">
                    Add
                </button>
            </div> -->

        <ConfirmModal :isVisible="isConfirmModalVisible" :confirmFunc="deleteOrg" confirmString="Yes, delete"
            @close="isConfirmModalVisible = false">
            <p>Are you sure you want to delete your organization?</p>
        </ConfirmModal>
    </div>
</template>

<script setup>
import { ref, toRaw, onMounted } from 'vue';
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore';
import axios from 'axios';
import LoopingRhombusesSpinner from '../../modal/Loading.vue';
import ConfirmModal from '@/modal/ConfirmModal.vue';
import { useLogout } from "@/utils/useLogout";
import { useToast } from "vue-toastification";

const { handleLogout } = useLogout();

axios.defaults.withCredentials = true;

const apiUrl = import.meta.env.VITE_API_URL;
const authStore = useAuthStore();
const activeCompanyId = authStore.user.company_id;
const isLoading = ref(true);
const isConfirmModalVisible = ref(false);
const router = useRouter();
const toast = useToast();

const formData = ref({
    organizationName: '',
});

// Reactive state
const teams = ref([]);
// New team variable 
const newTeam = ref('');
// Index of team being edited
const editingIndex = ref(null);
// Organization name variable
const organizationName = ref('');

const getOrganizationName = async () => {
    try {
        const response = await axios.get(`${apiUrl}/organizations/${activeCompanyId}`)
        organizationName.value = response.data.name;
    } catch (err) {
        console.error('Error fetching organization name:', err);
    }
}

// Get teams
// TODO add validation when no team exists
const getTeams = async () => {
    try {
        const response = await axios.get(`${apiUrl}/organizations/${activeCompanyId}/teams`);
        // Store the fetched teams in state
        teams.value = response.data;
    } catch (err) {
        console.error('Error fetching teams:', err);
    }
};

// Team editing 
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
            teams.value[editingIndex.value].team_name = updatedTeamName;

            // Stop editing after successful update
            editingIndex.value = null;
            toast.success('Team name updated successfully');
        } else {
            toast.warning('Failed to update team name');
        }
    } catch (err) {
        console.error('Error updating team name:', err);
        //toast.error('An error occurred while updating the team name');
    }
};

// Add new team
const addTeam = async () => {
    try {
        const newTeamName = newTeam.value;
        const response = await axios.post(`${apiUrl}/organizations/${activeCompanyId}/teams`, {
            newTeamName
        });
        if (response.data) {
            teams.value.push(response.data);
            newTeam.value = '';
        }
        toast.success('New team saved successfully');
    } catch (err) {
        //console.error(err);
        toast.error('Error adding team');
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
            toast.warning('Failed to delete the team');
        } else {
            toast.info('Team deleted successfully');
        }

    } catch (err) {
        //console.error(err);
        toast.error('Error deleting team');
    }
}

//delete organization
const deleteOrg = async () => {
    try {
        if (authStore.user.company_id) {
            await axios.delete(`${apiUrl}/organizations/${authStore.user.company_id}`);
            isConfirmModalVisible.value = false;
            handleLogout();
            toast.info("Organization deleted. Goodbye!");
        } else {
            console.error('Company id not defined in authStore');
        }
    } catch (err) {
        console.error('Error deleting organization, ', (err));
    }
}

const openConfirmModal = () => {
  isConfirmModalVisible.value = true;
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
            toast.success("Organization name updated successfully")
        }

    } catch (err) {
        console.error(err);
    }
};

const handleMounted = async () => {
    isLoading.value = true;
    await getTeams();
    await getOrganizationName();
    isLoading.value = false;
}

// Fetch teams when the component is mounted
onMounted(() => {
    handleMounted();
});

</script>