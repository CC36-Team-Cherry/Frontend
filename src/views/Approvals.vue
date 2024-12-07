<template>
    <LoopingRhombusesSpinner v-if="isLoading" />
    <div v-else>
        <div class="border-2 flex flex-row justify-evenly">
            <button 
                class="w-full h-8 hover:bg-blue-600 hover:text-white" 
                :class="{'bg-blue-500 text-white': activeTab === 'sent',
                        'bg-gray-200 text-black': activeTab !== 'sent'
            }" @click="switchTab('sent')">
                Approval Requests Sent
            </button>
            <button class="w-full h-8 hover:bg-blue-600 hover:text-white" :class="{
                'bg-blue-500 text-white': activeTab === 'received',
                'bg-gray-200 text-black': activeTab !== 'received'
            }" @click="switchTab('received')">
                Approval Requests Received
            </button>
        </div>

        <div class="max-h-[90%] overflow-scroll mt-5">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="bg-gray-200 sticky top-0 shadow-[0_0px_0.5px_1px_rgba(229,231,235,1)]">
                    <tr>
                        <th v-if="activeTab === 'sent'" class="border p-2 text-left">Sent To</th>
                        <th v-if="activeTab === 'received'" class="border p-2 text-left">From</th>
                        <th class="border p-2 text-left">Details</th>
                        <th class="border p-2 text-left">Memo</th>
                        <th class="border p-2 text-left">Status</th>
                        <th class="border p-2 text-left">Action</th>
                        <th class="border p-2 text-left">Last Updated</th>
                    </tr>
                </thead>
                <tbody class="m-0">
                    <tr v-if="filteredRequests.length === 0">
                        <td colspan="7" class="text-center text-xl text-gray-500 p-10">
                            No approvals to show.
                        </td>
                    </tr>
                    <tr v-for="(request, index) in filteredRequests" :key="index"
                        class="hover:bg-gray-300 even:bg-gray-100 odd:bg-white">
                        <td v-if="activeTab === 'sent'" class="border p-2">{{ request.supervisorName }}</td>
                        <td v-if="activeTab === 'received'" class="border p-2">{{ request.employeeName }}</td>
                        <td class="border p-2" v-if="request.attendanceType === 'Month Attendance'">
                            <div> {{ `Type: ${request.attendanceType}` }} </div>
                            <div> {{ `Date: ${formatMonthYear(request.date)}` }} </div>
                        </td>
                        <td class="border p-2"
                            v-if="request.attendanceType === 'PTO' || request.attendanceType === 'Half PTO'">
                            <div>{{ `Type: ${request.attendanceType}` }}</div>
                            <div>{{  `Date: ${new Date(request.date).toLocaleString('en-US', { month: 'short' })} ${getDayWithSuffix(new Date(request.date).getDate())}, ${new Date(request.date).getFullYear()}` }}</div>
                        </td>
                        <td class="border p-2" v-if="request.attendanceType === 'Special PTO'">
                            <div> {{ `Type: ${request.attendanceType}` }}</div>
                            <div> {{ `Reason: ${request.type}` }}</div>
                            <div> {{ `Date: ${new Date(request.date).toLocaleString('en-US', { month: 'short' })} ${getDayWithSuffix(new Date(request.date).getDate())}, ${new Date(request.date).getFullYear()}` }}</div>
                        </td>
                        <td v-if="!request.isEditing" class="border p-2">{{ request.memo }}</td>
                        <td v-if="request.isEditing" class="border p-2">
                            <input v-model="request.newMessage" class="border rounded p-2 w-full"
                                @keyup.enter="saveRemind(request)" @blur="cancelEditing(request)" />
                        </td>
                        <td class="border p-2">{{ request.status }}</td>
                        <td class="border p-2 flex flex-col space-y-2">
                            <button v-if="activeTab === 'received'" class="bg-green-500 text-white px-2 py-1 rounded"
                                @click="statusClick(request.id, 'Approved', request.attendanceType)">
                                Approve
                            </button>
                            <button v-if="activeTab === 'received'" class="bg-red-500 text-white px-2 py-1 rounded"
                                @click="statusClick(request.id, 'Denied', request.attendanceType)">
                                Deny
                            </button>
                            <button v-if="activeTab === 'received'" class="bg-blue-500 text-white px-2 py-1 rounded"
                                @click="seeAttendanceClick(request.id)">
                                See Attendance
                            </button>
                            <button v-if="activeTab === 'sent'" class="bg-yellow-500 text-white px-2 py-1 rounded"
                                @click="remindClick(request)">
                                Remind
                            </button>
                            <button class="bg-gray-500 text-white px-2 py-1 rounded"
                                @click="deleteClick(request.id, request.attendanceType)">
                                Delete
                            </button>
                        </td>
                        <td class="border p-2">
                            {{ 
                                `${new Date(request.updated_at).toLocaleString('en-US', { month: 'short' })} ${getDayWithSuffix(new Date(request.updated_at).getDate())}, ${new Date(request.updated_at).getFullYear()} @ ${new Date(request.updated_at).getHours()}:${new Date(request.updated_at).getMinutes().toString().padStart(2, '0')}`
                            }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import LoopingRhombusesSpinner from '../modal/Loading.vue';
import { format } from 'date-fns'

const apiUrl = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;
const authStore = useAuthStore();
const activeAccountId = authStore.user.id;
const isLoading = ref(true);

// Sample data for the approval requests
// const requests = ref({});
const requests = authStore.approvals

// Reactive state to store current tab
const activeTab = ref('sent');

// Compute (like use effects) the list of requets based on active tab
const filteredRequests = computed(() => {
    // Ensure requests and the current tab have valid data
    if (requests && requests[activeTab.value]) {
        return requests[activeTab.value]
            .filter(request => {
                // Apply any filtering logic here (e.g., filter by certain types, etc.)
                return true; // Keep all requests (adjust if specific filtering is needed)
            })
            .sort((a, b) => {
                // First, prioritize "Pending" status
                if (a.status === 'Pending' && b.status !== 'Pending') return -1;
                if (a.status !== 'Pending' && b.status === 'Pending') return 1;

                // Then, sort by updated_at (newest first)
                const dateA = new Date(a.updated_at);
                const dateB = new Date(b.updated_at);
                return dateB - dateA;
            });
    }
    return []; // Return an empty array if data is not available
});

const getDayWithSuffix = (day) => {
    if (day >= 11 && day <= 13) return day + 'th';
    switch (day % 10) {
        case 1: return day + 'st';
        case 2: return day + 'nd';
        case 3: return day + 'th';
        default: return day + 'th'
    }
}

function formatMonthYear(input) {
  // Split the input string by the hyphen
  const [month, year] = input.split('-');

  // Array of month names (abbreviated)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Convert the month to the corresponding abbreviated name
  const monthName = monthNames[parseInt(month) - 1];  // Subtract 1 because array is 0-indexed

  // Return the formatted string
  return `${monthName}, ${year}`;
}

// helper function to switch tabs
const switchTab = (tab) => {
    activeTab.value = tab;
};


const getApprovals = async () => {

    try {
        isLoading.value = true;
        const response = await axios.get(`${apiUrl}/accounts/${activeAccountId}/approvals`);

        requests.sent = response.data.approvalsSentData.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        requests.received = response.data.approvalsReceivedData.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        isLoading.value = false;
        authStore.setApprovals(response.data.approvalsSentData, response.data.approvalsReceivedData);

    } catch (err) {
        console.error('Error fetching approvals:', err);
    }
}

// Button click to change status to approved or denied
const statusClick = async (approvalsId, statusChange, requestType) => {
    try {

        // Get the requests for the current active tab
        const tabRequests = requests[activeTab.value]; // Get the current active tab's requests

        // Find the index of the request that matches the ID and type
        const requestIndex = tabRequests.findIndex(request =>
            request.id === approvalsId && request.attendanceType === requestType
        );

        if (requestIndex !== -1) {
            // Before making the API call, optimistically update the status locally
            tabRequests[requestIndex].status = statusChange; // Update the status in the local state
            tabRequests[requestIndex].updated_at = new Date().toISOString(); // Update the updated date in the local state
        }

        const response = await axios.patch(`${apiUrl}/approvals/${requestType}/${approvalsId}`,
            {
                // Send status change string
                statusChange
            }
        );

    } catch (err) {
        console.error('Error changing approval status:', err)
    }
}

// Button click to update able to edit message 
const remindClick = (request) => {
    request.newMessage = request.memo;
    request.isEditing = true;
}

// Save remind with edited message and update last change
const saveRemind = async (request) => {

    const newMessage = request.newMessage;

    try {
        const response = await axios.patch(`${apiUrl}/approvals/${request.attendanceType}/${request.id}/remind`, {
            newMessage,
        });

        if (response.status === 200) {
            request.memo = newMessage;
            request.updated_at = new Date().toISOString();
            request.isEditing = false;
        }

        requests[activeTab.value].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    } catch (err) {
        console.error('Error setting sending remind:', err)
    }
}

// Function to cancel editing without saving
const cancelEditing = (request) => {
    request.isEditing = false;
    request.newMessage = request.content;
}

// Button click to see attendance, reroute OR modal to see that person's calendar view
const seeAttendanceClick = async () => {
    try {

    } catch (err) {
        console.error('Error seeing attendance of selected account:', err)
    }
}

const deleteClick = async (approvalsId, requestType) => {
    try {
        // Optimistic rendering
        const tabRequests = requests[activeTab.value]; // Get the requests for the active tab
        console.log(tabRequests)

        requests[activeTab.value] = tabRequests.filter(request => !(request.id === approvalsId && request.attendanceType === requestType))

        const response = await axios.delete(`${apiUrl}/approvals/${requestType}/${approvalsId}`);

    } catch (err) {
        console.error('Error deleting approval:', err)
    }
}

// Fetch approvals when the component is mounted
onMounted(() => {
    getApprovals();
    console.log("request approvals", requests)
});

</script>