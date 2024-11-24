<template>
    <div>
        <div>
            <button
                :class="{'active': activeTab === 'received'}"
                @click="switchTab('received')"
            >
                Approval Requests Received
            </button>
            <button
                :class="{'active': activeTab === 'sent'}"
                @click="switchTab('sent')"
            >
                Approval Requests Sent
            </button>
        </div>

        <table>
            <thead>
            <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Message</th>
                <th>Status</th>
                <th>Action</th>
                <th>Date</th>
            </tr>
            </thead>
            <tbody>
                <tr v-for="(request, index) in filteredRequests" :key="index">
                    <td>{{  request.name }}</td>
                    <td>{{  request.type }}</td>
                    <td>{{  request.message }}</td>
                    <td>{{  request.status }}</td>
                    <td>
                        <button
                            v-if="activeTab==='received'"
                        >Approve</button>
                        <button
                            v-if="activeTab==='received'"
                        >Deny</button>
                        <button
                            v-if="activeTab==='received'"
                        >See Attendance</button>

                        <button
                            v-if="activeTab==='sent'"
                        >Remind</button>
                        <button
                            v-if="activeTab==='sent'"
                        >Delete</button>
                    </td>
                    <td>{{  request.date }}</td>
                </tr> 
            </tbody>
        </table>
    </div>

</template>

<script setup>
import { ref, computed } from 'vue';

// Sample data for the approval requests
const requests = ref({
    received: [
    { name: 'John Doe', type: 'Leave', message: 'Leave request for 3 days', status: 'Pending', date: '2024-11-20' },
    { name: 'Jane Smith', type: 'Expense', message: 'Expense approval for $200', status: 'Approved', date: '2024-11-18' },
    ],
    sent: [
    { name: 'Alice Johnson', type: 'Leave', message: 'Leave request for 2 days', status: 'Pending', date: '2024-11-15' },
    { name: 'Bob Brown', type: 'Expense', message: 'Expense request for $500', status: 'Rejected', date: '2024-11-12' },
    ],
});

// Reactive state to store current tab
const activeTab = ref('received');

// Compute (like use effects) the list of requets based on active tab
const filteredRequests = computed(() => {
    return requests.value[activeTab.value] || [];
})

const switchTab = (tab) => {
    activeTab.value = tab;
};

</script>