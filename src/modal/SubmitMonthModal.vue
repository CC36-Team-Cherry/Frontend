<template>
    <div v-if="isVisible" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
        <div class="bg-white p-4 rounded-lg shadow-md w-96">
            <div class="mb-3">
                <label class="block mb-1 font-bold text-sm">Supervisor</label>
                <select 
                    v-model="localSelectedSupervisorId"
                    class="border border-gray-300 rounded p-1 text-xs w-full"
                >
                    <option value="" disabled>Selected Supervisor</option>
                    <option
                        v-for="supervisor in supervisors"
                        :key="supervisor.id"
                        :value="supervisor.id"
                    >
                        {{  supervisor.first_name + " " + supervisor.last_name }}
                    </option>
            </select>
            </div>
        </div>
        <div class="flex justify-end gap-2">
            <button
                @click="closeSubmitMonthModal"
                class=""bg-gray-300 text-black py-1 px-3 rounded hover:bg-gray-400
            >
                Cancel
            </button>
            <button
                @click="submitMonthApproval"
                class="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
                :disabled="!localSelectedSupervisorId"
            >
                Submit
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';

defineProps({
    isVisible: Boolean,
    supervisors: Array,
    selectedSupervisorId: Number,
    memo: String,
})

const emit = defineEmits(['submit', 'close']);

const localSelectedSupervisorId = ref(props.selectedSupervisorId);
const localMemo = ref(props.memo);

watch(() => props.selectedSupervisorId, (newVal) => {
    localSelectedSupervisorId.value = newVal;
})

watch(() => props.memo, (newVal) => {
    localMemo.value = newVal;
})

const submitMonthApproval = () => {
    emit('submit', {
        supervisorId: localSelectedSupervisorId.value,
        memo: localMemo.value,
    })
} 

const closeSubmitMonthModal = () => {
    emit('close');
};
</script>