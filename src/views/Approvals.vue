<template>
    <div>
        <div class="border-2 flex flex-row justify-evenly">
            <button
                class="w-full"
                :class="{
                    'bg-blue-500 text-white': activeTab === 'sent', 
                    'bg-gray-200 text-black': activeTab !== 'sent'
                }"
                @click="switchTab('sent')"
            >
                Approval Requests Sent
            </button>
            <button
                class="w-full"
                :class="{
                    'bg-blue-500 text-white': activeTab === 'received', 
                    'bg-gray-200 text-black': activeTab !== 'received'
                }"
                @click="switchTab('received')"
            >
                Approval Requests Received
            </button>
        </div>

        <div class="flex flex-col flex-grow overflow-y-auto">
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
                        v-for="(request, index) in filteredRequests" 
                        :key="index"
                        class="border-2"
                    >
                        <td
                            v-if="activeTab === 'sent'"
                        >{{  request.supervisor_id }}</td>
                        <td
                            v-if="activeTab === 'received'"
                        >{{  request.account_id }}</td>
                        <td>{{  "Monthly Attendance" }}</td>
                        <!-- <td>{{  request.type }}</td> -->
                        <td>{{  request.content }}</td>
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
                                @click="remindClick(request.id)"
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

const apiUrl = import.meta.env.VITE_API_URL;

// Sample data for the approval requests
const requests = ref({
    // sent: 
    // [
    // // { name: 'Alice Johnson', type: 'Leave', message: 'Leave request for 2 days', status: 'Pending', date: '2024-11-15' },
    // // { name: 'Bob Brown', type: 'Expense', message: 'Expense request for $500', status: 'Rejected', date: '2024-11-12' },
    // ],
    // received: [
    // // { name: 'John Doe', type: 'Leave', message: 'Leave request for 3 days', status: 'Pending', date: '2024-11-20' },
    // // { name: 'Jane Smith', type: 'Expense', message: 'Expense approval for $200', status: 'Approved', date: '2024-11-18' },
    // ],
});

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

//TEST DATA
const accountId = 1;

// handler to get all data for requests received by supervisor id (get all requests that match supervisor id is this account id)
// TODO: Get all approvals, from monthly, pto, and special pto
const getApprovals = async () => {
    try {
        const response = await axios.get(`${apiUrl}/accounts/${accountId}/approvals`);
        
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
    } catch (err) {
        console.error('Error changing approval status:', err)
    }
}

// Button click to update last updated and edit message 
const remindClick = async () => {
    try {

    } catch (err) {
        console.error('Error sending reminder:', err)
    }
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
    } catch (err) {
        console.error('Error deleting approval:', err)
    }
}

// Fetch approvals when the component is mounted
onMounted(() => {
    getApprovals();
});

</script>