<template>
    <LoopingRhombusesSpinner v-if="isLoading" />
    <div v-else class="p-8 bg-gray-50 h-screen">
        <h1 class="text-2xl font-bold">{{ $t('adminConsole.title') }}</h1>
        <h2 class="text-xl font-bold"> {{ organizationName }}</h2>

        <!-- Team List -->
        <div class="text-2xl font-bold text-center my-5">{{ $t('adminConsole.fields.teamList') }}</div>

            <!-- Add Team  -->
            <div class="flex justify-center space-x-4 m-6">
                <input v-model="newTeam" type="text" :placeholder="$t('adminConsole.buttons.addPlaceholder')" class="border-2 rounded p-2 w-64" />
                <button @click="addTeam(newTeam)" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded">
                    {{$t('adminConsole.buttons.add')}}
                </button>
            </div>

        <div class="overflow-x-auto flex justify-center">
            <table class="w-4/6 table-auto border-collapse">
                <thead class="bg-blue-100">
                    <tr>
                        <th class="border p-2 text-left w-5/6">{{$t('adminConsole.teamName')}}</th>
                        <th class="border p-2 text-left w-1/6">{{$t('adminConsole.actions')}}</th>
                    </tr>
                </thead>
                <tr v-for="(team, index) in teams" :key="team.id" class="hover:bg-gray-100 even:bg-gray-50">
                    <td class="border p-2">
                        <div v-if="editingIndex === index">
                            <input v-model="teams[index].team_name" @blur="stopEditing" @keyup.enter="stopEditing" class="border rounded p-2 w-48" :data-test="`team-name-${index}`"/>
                        </div>   
                        <span v-else class="p-2 text-lg">
                            {{ team.team_name }}
                        </span>
                    </td>
                    <td class="border p-2 flex space-x-2 justify-center">
                        <button @click="startEditing(index)" v-if="editingIndex !== index" class="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded mr-2 w-20" data-test="edit-team">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button @click="stopEditing" v-else class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded mr-2 w-20" data-test="save-team">
                            <i class="fas fa-save"></i>
                        </button>
                        <button @click="deleteTeam(team.id)" :title="$t('adminConsole.buttons.delete')" class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded w-20">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            </table>
        </div>

        <!-- Organization Setting -->
        <div class="text-2xl text-center font-bold my-5">{{ $t('adminConsole.fields.organizationSettings') }}</div>
        <div class="flex flex-row justify-center items-center gap-8">
            <!-- <label class="font-medium text-left">{{ $t('adminConsole.fields.organizationName') }}</label> -->
            <input type="text" v-model="formData.organizationName" class="border rounded p-2 w-1/6" :placeholder=authStore.user?.company.name data-test="organization-name" />
                    <!-- Save and Delete buttons -->
            <button @click="saveSettings" class="my-1 w-40 py-2 px-3 rounded bg-blue-500 hover:bg-blue-600 transition text-white">
                {{ $t('adminConsole.buttons.saveName') }}
            </button>
            <button @click="openConfirmModal" class="my-4 w-40 py-2 rounded bg-red-500 hover:bg-red-600 transition text-white">
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

<script setup lang="ts">
import { ref, toRaw, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import axios from 'axios';
import LoopingRhombusesSpinner from '@/components/Loading.vue';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import { useLogout } from "@/utils/useLogout";
import { useToast } from "vue-toastification";
import i18n from '../i18n.ts';

axios.defaults.withCredentials = true;
const apiUrl = import.meta.env.VITE_API_URL;
const { t } = i18n.global;
const { handleLogout } = useLogout();
const authStore = useAuthStore();
const toast = useToast();
const activeCompanyId = authStore.user?.company_id;

// Interfaces
interface Team {
    id: number, 
    team_name: string
}

// Reactive values
const formData = ref<{ organizationName: string }>({
    organizationName: '',
});
const isLoading = ref<boolean>(true);
const isConfirmModalVisible = ref<boolean>(false);
const teams = ref<Team[]>([]);
const newTeam = ref<string>(''); // New team variable 
const editingIndex = ref<number | null>(null); // Index of team being edited
const organizationName = ref<string>(''); // Organization name variable

// Helper functions.
const openConfirmModal = () => {
  isConfirmModalVisible.value = true;
}

// Fetch organization name. 
const getOrganizationName = async (): Promise <void> => {
    try {
        const response = await axios.get(`${apiUrl}/organizations/${activeCompanyId}`)
        organizationName.value = response.data.name;
    } catch (err) {
        console.error('Error fetching organization name:', err);
    }
}

// Fetch all teams for that organization. 
const getTeams = async (): Promise <void> => {
    try {
        const response = await axios.get<Team[]>(`${apiUrl}/organizations/${activeCompanyId}/teams`);
        teams.value = response.data; 
    } catch (err) {
        console.error('Error fetching teams:', err);
    }
};

// Team editing 
const startEditing = (index: number) => {
    editingIndex.value = index;
};

// Stop editing the team (disable the input field and save changes)
const stopEditing = async (): Promise <void> => {

    // Validate editingIndex.value is a valid number or null, as index cannot be null. 
    if (editingIndex.value === null || editingIndex.value < 0) {
        return;
    }

    const team = teams.value[editingIndex.value];
    const updatedTeamName = team.team_name; // Store the updated team name to send to the backend.

    try {
        // Send patch request to update the team name in the backend.
        const response = await axios.patch(`${apiUrl}/teams/${team.id}`, {
            updatedTeamName // The new team name sent to be updated in the backend. 
        });

        if (response.status === 200) {
            teams.value[editingIndex.value].team_name = updatedTeamName; // Update the team name in the local reactive value on successful patch. 
            editingIndex.value = null; // Reset editingIndex after successful update.
            toast.success(t('adminConsole.toast.teamUpdate'));
        } else {
            toast.warning(t('adminConsole.toast.teamFail'));
        }
    } catch (err) {
        console.error('Error updating team name:', err); //toast.error('An error occurred while updating the team name');
    }
};

// Add a new team. 
const addTeam = async (newTeamName: string): Promise <void> => {
    try {
        const response = await axios.post(`${apiUrl}/organizations/${activeCompanyId}/teams`, {
            newTeamName
        });

        if (response.data) {
            teams.value.push(response.data); // Add team to reactive variable to update team. 
            newTeam.value = '';
        }
        toast.success(t('adminConsole.toast.newTeam'));
    } catch (err) {
        console.error('Failed to add team: ', err);
        toast.error(t('adminConsole.toast.newTeamFail'));
    }
};

// Delete a team.
const deleteTeam = async(teamId: number): Promise <void>=> {
    try {
        // Optimistically remove the team from the array.
        const originalTeams = [...teams.value]; 
        teams.value = teams.value.filter(team => team.id !== teamId);

        const response = await axios.delete(`${apiUrl}/teams/${teamId}`)

        if (response.status !== 200) {
            teams.value = originalTeams; // If the deletion fails, revert the change.
            toast.warning(t('adminConsole.toast.teamDeleteFail'));
        } else {
            toast.info(t('adminConsole.toast.teamDelete'));
        }

    } catch (err) {
        console.error("Error deleting team: ", err);
        toast.error(t('adminConsole.toast.teamDeleteError'));
    }
}

// Delete organization.
const deleteOrg = async (): Promise <void> => {
    try {
        if (authStore.user?.company_id) { // Using optional chaining (?) to prevent accessing property if null. 
            await axios.delete(`${apiUrl}/organizations/${authStore.user?.company_id}`);
            isConfirmModalVisible.value = false;
            handleLogout();
            toast.info(t('adminConsole.toast.orgDelete'));
        } else {
            console.error('Company id not defined in authStore');
        }
    } catch (err) {
        console.error('Error deleting organization, ', (err));
    }
}

// Save settings on click for admin settings outside of team list.
const saveSettings = async (): Promise <void> => {
    try {
        const adminConsoleData = toRaw(formData.value); // Store admin data to edit. 
        organizationName.value = formData.value.organizationName;

        const response = await axios.patch(`${apiUrl}/organizations/${activeCompanyId}`, {
            adminConsoleData
        });

        if (response.status === 200) {
            if (authStore.user) { // Type guard for potential authStore.user being null.
                authStore.user.company.name = organizationName.value;
                toast.success(t('adminConsole.toast.orgUpdate'))
            }
        }

        formData.value.organizationName = '';

    } catch (err) {
        console.error("Error saving settings: ", err);
    }
};

// Helper function on mount. 
const handleMounted = async (): Promise <void> => {
    isLoading.value = true;
    await getTeams();
    await getOrganizationName();
    isLoading.value = false;
}

onMounted(() => {
    handleMounted();
});

</script>