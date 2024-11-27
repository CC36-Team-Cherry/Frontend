<template>
    <div>
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
                        <th>Type</th>
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
                        >{{  request.supervisor.first_name + " " + request.supervisor.last_name }}</td>
                        <td
                            v-if="activeTab === 'received'"
                        >{{ request.account.first_name + " " + request.account.last_name }}</td>
                        <td>{{  "Monthly Attendance for " + request.month + "/" + request.year }}</td>
                        <!-- <td>{{  request.type }}</td> -->
                        
                        <td
                            v-if="!request.isEditing"
                        >{{  request.content }}</td>
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
                                @click="statusClick(request.id, 'Approved')"
                            >Approve</button>
                            <button
                                v-if="activeTab==='received'"
                                class="border-2"
                                @click="statusClick(request.id, 'Denied')"
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
                                @click="deleteClick(request.id)"
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

const apiUrl = import.meta.env.VITE_API_URL;
const authStore = useAuthStore();
const activeAccountId = authStore.user.id;

// Sample data for the approval requests
const requests = ref({});

// Reactive state to store current tab
const activeTab = ref('sent');

// Compute (like use effects) the list of requets based on active tab
const filteredRequests = computed(() => {
    return requests.value[activeTab.value] || [];
})

// helper function to switch tabs
const switchTab = (tab) => {
    activeTab.value = tab;
};

// handler to get all data for requests received by supervisor id (get all requests that match supervisor id is this account id)
// TODO: Get all approvals, from monthly, pto, and special pto
const getApprovals = async () => {
    try {
        console.log(activeAccountId);
        const response = await axios.get(`${apiUrl}/accounts/${activeAccountId}/approvals`);
        // const requestsSent = {
        //     id: null, 
        //     toName: '',
        //     type: '',
        //     details: '',
        //     message: '',
        //     status: '',
        //     dateSent: '',
        // };

        // const requestsReceived = {
        //     id: null, 
        //     fromName: '',
        //     type: '',
        //     details: '',
        //     message: '',
        //     status: '',
        //     dateSent: '',
        // };
        
        requests.value.sent = response.data.approvalsSentMonthly;
        requests.value.received = response.data.approvalsRequestedMonthly;
        console.log(requests.value);
        
    } catch (err) {
        console.error('Error fetching approvals:', err);
    }
}

// Button click to change status to approved or denied
// TODO: Change status depending on type of approval selected
// TODO: Set reactive state to change status immediately on click without refresh
const statusClick = async (approvalsId, statusChange) => {
    try {

        const response = await axios.patch(`${apiUrl}/approvals/${approvalsId}`, 
            {
                // Send status change string
                statusChange
            }
        ); 

        // Update the local state immediately if the status change is successful
        // Loop through the filtered requests and update the status for the specific request
        const tabRequests = requests.value[activeTab.value];
        const requestIndex = tabRequests.findIndex(request => request.id === approvalsId);

        if (requestIndex !== -1) {
            tabRequests[requestIndex].status = statusChange; // update the status locally
        }

    } catch (err) {
        console.error('Error changing approval status:', err)
    }
}

// Button click to update able to edit message 
const remindClick = (request) => {
    request.isEditing = true;
    request.newMessage = request.content;
}

// Save remind with edited message and update last change
const saveRemind = async (request) => {

    const newMessage = request.newMessage;

    try {
        const response = await axios.patch(`${apiUrl}/approvals/${request.id}/remind`, {
            newMessage,
        });

        if (response.status === 200) {
            request.content = request.newMessage;
            request.updated_at = new Date().toISOString();
            request.isEditing = false;
        }

    } catch (err) {
        console.error('Error setting sendingremind:', err)
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
const deleteClick = async (approvalsId) => {
    try {
    
        const response = await axios.delete(`${apiUrl}/approvals/${approvalsId}`); 

        // After a successful delete, remove the request from the local state
        const tabRequests = requests.value[activeTab.value];  // Get requests for the active tab
        const requestIndex = tabRequests.findIndex(request => request.id === approvalsId);

        if (requestIndex !== -1) {
            // Remove the deleted request from the local array
            tabRequests.splice(requestIndex, 1);
        }

    } catch (err) {
        console.error('Error deleting approval:', err)
    }
}

// Fetch approvals when the component is mounted
onMounted(() => {
    getApprovals();
});

</script>