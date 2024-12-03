<template>
    <LoopingRhombusesSpinner v-if="isLoading"/>
    <div v-else>
        <div class="border-2 flex flex-row justify-evenly">
            <button
                class="w-full h-8"
                :class="{
                    'bg-blue-500 text-white': activeTab === 'sent', 
                    'bg-gray-200 text-black': activeTab !== 'sent'
                }"
                @click="switchTab('sent')"
            >
                Approval Requests Sent
            </button>
            <button
                class="w-full h-8"
                :class="{
                    'bg-blue-500 text-white': activeTab === 'received', 
                    'bg-gray-200 text-black': activeTab !== 'received'
                }"
                @click="switchTab('received')"
            >
                Approval Requests Received
            </button>
        </div>

        <div class="flex flex-col flex-grow overflow-y-auto mt-5">
            <table class="min-w-full table-auto">
                <thead>
                    <tr>
                        <th 
                            v-if="activeTab === 'sent'"
                        >Sent To</th>
                        <th
                            v-if="activeTab === 'received'"
                        >From</th>
                        <th>Details</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th>Action</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    <tr 
                        v-if="filteredRequests.length === 0"
                    >
                        <td colspan="7" class="text-center text-xl text-gray-500 p-10">
                            No approvals to show.
                        </td>
                    </tr>
                    <tr 
                        v-for="(request, index) in filteredRequests" 
                        :key="index"
                        class="border-2"
                    >
                        <td
                            v-if="activeTab === 'sent'"
                        >{{  request.supervisorName }}</td>
                        <td
                            v-if="activeTab === 'received'"
                        >{{ request.employeeName }}</td>
                        <td
                            v-if="request.attendanceType === 'Month Attendance Request'"
                        >{{  `${request.attendanceType}: ${request.date}` }}</td>
                        <td
                            v-if="request.attendanceType === 'PTO Request' || request.attendanceType === 'Half PTO Request'"
                        >{{  `${request.attendanceType}: ${request.date}` }}</td>
                        <td
                            v-if="request.attendanceType === 'Special PTO Request'"
                            >{{  `${request.attendanceType}: ${request.type} for ${request.date}` }}</td>                        
                        <td
                            v-if="!request.isEditing"
                        >{{  request.memo }}</td>
                        <input
                            v-if="request.isEditing"
                            v-model="request.newMessage"
                            class="border-2"
                            @keyup.enter="saveRemind(request)"
                            @blur="cancelEditing(request)"
                        />

                        <td>{{  request.status }}</td>
                        <td class="flex flex-col">
                            <button
                                v-if="activeTab==='received'"
                                class="border-2"
                                @click="statusClick(request.id, 'Approved', request.attendanceType)"
                            >Approve</button>
                            <button
                                v-if="activeTab==='received'"
                                class="border-2"
                                @click="statusClick(request.id, 'Denied', request.attendanceType)"
                            >Deny</button>
                            <button
                                v-if="activeTab==='received'"
                                class="border-2"
                                @click="seeAttendanceClick(request.id)"
                            >See Attendance</button>
                            <button
                                v-if="activeTab==='sent'"
                                class="border-2"
                                @click="remindClick(request)"
                            >Remind</button>
                            <button
                                class="border-2"
                                @click="deleteClick(request.id, request.attendanceType)"
                            >Delete</button>
                        </td>
                        <td>{{  request.updated_at }}</td>
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
        return requests[activeTab.value];
    }
    return [];  // Return an empty array if data is not available
})

// helper function to switch tabs
const switchTab = (tab) => {
    activeTab.value = tab;
};


const getApprovals = async () => {
    try {
        isLoading.value = true;
        const response = await axios.get(`${apiUrl}/accounts/${activeAccountId}/approvals`);
        
        requests.sent = response.data.approvalsSentData;
        requests.received = response.data.approvalsReceivedData;
        isLoading.value = false;
        authStore.setApprovals(response.data.approvalsSentData, response.data.approvalsReceivedData);
        console.log("requests auth value", requests)
    } catch (err) {
        console.error('Error fetching approvals:', err);
    }
}

// Button click to change status to approved or denied
// TODO: Set reactive state to change status immediately on click without refresh
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
        }

        console.log(requestType)
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
    console.log(request)
    console.log(newMessage)


    try {
        const response = await axios.patch(`${apiUrl}/approvals/${request.type}/${request.id}/remind`, {
            newMessage,
        });

        if (response.status === 200) {
            request.memo = newMessage;
            request.updated_at = new Date().toISOString();
            request.isEditing = false;
        }

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

// TODO: Set up delete approval to delete depending on type of request
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
    console.log(requests)
});

</script>