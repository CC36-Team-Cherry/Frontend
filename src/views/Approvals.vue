<template>
    <LoopingRhombusesSpinner v-if="isLoading" />
    <div v-else>
        <!-- Tabs -->
        <div class="border-2 flex flex-row justify-evenly">
            <button 
                class="w-full h-8 hover:bg-blue-600 hover:text-white" 
                :class="{'bg-blue-500 text-white': activeTab === 'sent',
                        'bg-gray-200 text-black': activeTab !== 'sent'
            }" @click="switchTab('sent')">
                {{$t('approval.tabSent')}}
            </button>
            <button class="w-full h-8 hover:bg-blue-600 hover:text-white" :class="{
                'bg-blue-500 text-white': activeTab === 'received',
                'bg-gray-200 text-black': activeTab !== 'received'
            }" @click="switchTab('received')">
                {{$t('approval.tabReceived')}}
            </button>
        </div>

        <!-- Content -->
        <div class="max-h-[90%] overflow-scroll mt-5">
            <!-- Team Table -->
            <table class="w-full border-collapse border border-gray-300 table-fixed">
                <thead class="bg-blue-100 sticky top-0 shadow-[0_0px_0.5px_1px_rgba(229,231,235,1)]">
                    <tr>
                        <th v-if="activeTab === 'sent'" class="border p-2 text-left">{{$t('approval.sentTo')}}</th>
                        <th v-if="activeTab === 'received'" class="border p-2 text-left">{{$t('approval.from')}}</th>
                        <th class="border p-2 text-left">{{$t('approval.type')}}</th>
                        <th class="border p-2 text-left">{{$t('approval.requestedDate')}}</th>
                        <th class="border p-2 text-left">{{$t('approval.memo')}}</th>
                        <th class="border p-2 text-left">{{$t('approval.status')}}</th>
                        <th class="border p-2 text-left">{{$t('approval.action')}}</th>
                        <th class="border p-2 text-left">{{$t('approval.lastUpdated')}}</th>
                    </tr>
                </thead>
                <tbody class="m-0">
                    <tr v-if="filteredRequests.length === 0">
                        <td colspan="7" class="text-center text-xl text-gray-500 p-10">
                            {{$t('approval.noApprovals')}}
                        </td>
                    </tr>
                    <tr v-for="(request, index) in filteredRequests" :key="index"
                        class="hover:bg-gray-300 even:bg-gray-200 odd:bg-white">
                        <td v-if="activeTab === 'sent'" class="border p-2">{{ request.supervisorName }}</td>
                        <td v-if="activeTab === 'received'" class="border p-2">{{ request.employeeName }}</td>
                        <td class="border p-2" v-if="request.attendanceType === 'Month Attendance'">
                            <div> {{ `${request.attendanceType}` }} </div>
                            
                        </td>
                        <td class="border p-2"
                            v-if="request.attendanceType === 'PTO' || request.attendanceType === 'Half PTO'">
                            <div>{{ `${request.attendanceType}` }}</div>
                        </td>
                        <td class="border p-2" v-if="request.attendanceType === 'Special PTO'">
                            <div> {{ `${request.attendanceType} | ${request.type}` }}</div>
                        </td>
                        <td class="border p-2">
                            <div v-if="request.attendanceType === 'PTO' || request.attendanceType === 'Special PTO'">{{  `${new Date(request.date).toLocaleString('en-US', { month: 'short' })} ${getDayWithSuffix(new Date(request.date).getDate())}, ${new Date(request.date).getFullYear()}` }}</div>
                            <div v-if="request.attendanceType === 'Half PTO'">{{  `${new Date(request.date).toLocaleString('en-US', { month: 'short' })} ${getDayWithSuffix(new Date(request.date).getDate())}, ${new Date(request.date).getFullYear()} | ${new Date(request.hour_start).toLocaleTimeString('en-US', {hour12: false, hour: 'numeric', minute: '2-digit'})}-${new Date(request.hour_end).toLocaleTimeString('en-US', {hour12: false, hour: 'numeric', minute: '2-digit'})}` }}</div>
                            <div v-if="request.attendanceType === 'Month Attendance'"> {{ `${formatMonthYearMonthRequest(request.date)}` }} </div>
                        </td>
                        <td v-if="!request.isEditing" class="border p-2">{{ request.memo }}</td>
                        <td v-if="request.isEditing" class="border p-2">
                            <input v-model="request.newMessage" class="border rounded p-2 w-full"
                                @keyup.enter="saveRemind(request)" @blur="(e) => {
                                if (!e.relatedTarget) {
                                    cancelEditing(request)}}" />
                        </td>
                        <td class="border p-2">{{ request.status }}</td>
                        <td class="border p-2">
                            <div class="flex justify-center items-center w-full h-full">
                                <div class="grid grid-cols-2 gap-2 w-48">
                                    <button v-if="activeTab === 'received'" :title="$t('approval.approve')" class="bg-green-500 text-white px-5 py-2 rounded w-full"
                                        @click="statusClick(request.id, 'Approved', request.attendanceType)">
                                        <i class="fas fa-check"></i>
                                    </button>
                                    <button v-if="activeTab === 'received'" :title="$t('approval.deny')" class="bg-gray-500 text-white px-5 py-2 rounded w-full"
                                        @click="statusClick(request.id, 'Denied', request.attendanceType)">
                                        <i class="fas fa-times"></i>
                                    </button>
                                    <button v-if="activeTab === 'received'" :title="$t('approval.seeAttendance')" class="bg-sky-500 text-white px-5 py-2 rounded w-full"
                                        @click="seeAttendanceClick(request.accountId)">
                                        <i class="fas fa-calendar-alt"></i>
                                    </button>
                                    <button v-if="activeTab === 'sent' && !request.isEditing" :title="$t('approval.remind')" class="bg-yellow-500 text-white px-5 py-2 rounded w-full"
                                        @click="remindClick(request)">
                                        <i class="fas fa-bell"></i>
                                    </button>
                                    <button v-if="activeTab === 'sent' && request.isEditing" :title="$t('approval.remind')" id="save" class="bg-green-500 text-white px-5 py-2 rounded w-full"
                                        @click="saveRemind(request)">
                                        <i class="fas fa-check"></i>
                                    </button>
                                    <button :title="$t('approval.delete')" class="bg-red-500 text-white px-5 py-2 rounded w-full"
                                        @click="deleteClick(request.id, request.attendanceType)">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </div>
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

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import LoopingRhombusesSpinner from '@/components/Loading.vue';
import { useRouter } from 'vue-router';
import { useToast } from "vue-toastification";
import { useI18n } from 'vue-i18n';
import type { ApprovalRequest } from '@/stores/authStore';

const apiUrl = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
const {t} = useI18n();
const activeAccountId = authStore.user?.id;

// Sample data for the approval requests
const requests: { received: ApprovalRequest[], sent: ApprovalRequest[]} = authStore.approvals

// Reactive state to store current tab
const activeTab = ref<string>('sent');
const isLoading = ref<boolean>(true);

// Helper function to switch tabs.
const switchTab = (tab: string) => {
    activeTab.value = tab;
};

// Compute (like use effects) the list of requests based on active tab.
const filteredRequests = computed(() => {
    // Ensure requests and the current tab have valid data.
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

const getDayWithSuffix = (day: number) => {
    if (day >= 11 && day <= 13) return day + 'th';
    switch (day % 10) {
        case 1: return day + 'st';
        case 2: return day + 'nd';
        case 3: return day + 'th';
        default: return day + 'th'
    }
}

function formatMonthYearMonthRequest(input: string) {
  const [month, year] = input.split('-');
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthName = monthNames[parseInt(month) - 1];  // Subtract 1 because array is 0-indexed

  return `${monthName}, ${year}`;
}

const getApprovals = async (): Promise <void> => {

    try {
        isLoading.value = true;
        const response = await axios.get(`${apiUrl}/accounts/${activeAccountId}/approvals`);

        requests.sent = response.data.approvalsSentData.sort((a: {updated_at: Date}, b: {updated_at: Date }) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        requests.received = response.data.approvalsReceivedData.sort((a: {updated_at: Date}, b: {updated_at: Date}) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        isLoading.value = false;
        authStore.setApprovals(response.data.approvalsSentData, response.data.approvalsReceivedData);

    } catch (err) {
        console.error('Error fetching approvals:', err);
    }
}

// Button click to change status to approved or denied
const statusClick = async (approvalsId: number, statusChange: string, requestType: string): Promise <void> => {
    try {

        // Get the requests for the current active tab
        const tabRequests = requests[activeTab.value]; // Get the current active tab's requests

        // Find the index of the request that matches the ID and type
        const requestIndex = tabRequests.findIndex((request: { id: number; attendanceType: string; }) =>
            request.id === approvalsId && request.attendanceType === requestType
        );

        if (requestIndex !== -1) {
            // Before making the API call, optimistically update the status locally
            tabRequests[requestIndex].status = statusChange; // Update the status in the local state
            tabRequests[requestIndex].updated_at = new Date().toISOString(); // Update the updated date in the local state
        }

        console.log("request type: ", requestType)
        console.log("statusChange: ", statusChange)
        console.log("approvalsId: ", approvalsId)

        await axios.patch(`${apiUrl}/approvals/${requestType}/${approvalsId}`,
            {
                // Send status change string
                statusChange
            }
        );

        if (statusChange === 'Approved') {
            toast.success(t('approval.messages.approved'))
        }

        if (statusChange === 'Denied') {
            toast.info(t('approval.messages.denied'))
        }

    } catch (err) {
        console.error('Error changing approval status:', err)
    }
}

// Button click to update able to edit message 
const remindClick = (request: { status: string; newMessage: string; memo: string; isEditing: boolean; }) => {
    if (request.status === "Approved" || request.status === "Denied") {
        toast.warning(t('approval.closed'));
        return;
    }
    request.newMessage = request.memo;
    toast.info(t('approval.enterMemo'));
    request.isEditing = true;
}

// Save remind with edited message and update last change.
const saveRemind = async (request: { newMessage: string; attendanceType: string; id: number; memo: string; updated_at: string; isEditing: boolean; }): Promise <void> => {
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
        toast.success(t('approval.remindSuccess'));
        requests[activeTab.value].sort((a: { updated_at: Date }, b: { updated_at: Date }) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    } catch (err) {
        console.error('Error setting sending remind:', err)
    }
}

// Function to cancel editing without saving.
const cancelEditing = (request: { isEditing: boolean; newMessage: string; content: string; }) => {
    request.isEditing = false;
    request.newMessage = request.content;
}

// Button click to see attendance, reroute OR modal to see that person's calendar view
const seeAttendanceClick = async (requestId: number): Promise <void> => {
    try {
        router.push({ name: 'supervisorCalendar', params: { userId: requestId }})
    } catch (err) {
        console.error('Error seeing attendance of selected account:', err)
    }
}

const deleteClick = async (approvalsId: number, requestType: string): Promise <void> => {
    try {
        // Optimistic rendering.
        const tabRequests = requests[activeTab.value]; // Get the requests for the active tab.

        requests[activeTab.value] = tabRequests.filter((request: { id: number, attendanceType: string}) => !(request.id === approvalsId && request.attendanceType === requestType))

        await axios.delete(`${apiUrl}/approvals/${requestType}/${approvalsId}`);

        toast.info(t('approval.messages.deleted'))

    } catch (err) {
        console.error('Error deleting approval:', err)
    }
}

// Fetch approvals when the component is mounted
onMounted(() => {
    getApprovals();
});

</script>