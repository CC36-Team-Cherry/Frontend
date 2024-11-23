<template>
    <div class="p-8 bg-gray-50 min-h-screen">
        <h1 class="border-2 text-2xl font-bold">Admin Console</h1>
            <div class="border-2 text-xl text-center my-5">Team List</div>
            <div class="border-2 text-xl text-center my-5">Admin Settings</div>
                <div class="grid grid-cols-2 border-2">
                    <label class="font-medium text-center">Set Minimum Work Hours Per Day</label>
                    <input
                        type="text"
                        class="border rounded p-2"
                        />
                </div>
            <div class="border-2 text-xl text-center my-5">Organization Settings</div>
                <div class="grid grid-cols-2 border-2">
                    <label class="font-medium text-center">Organization Name</label>
                    <input
                        type="text"
                        v-model="formData.organizationName"
                        class="border rounded p-2"
                    />
                </div>
        <div class="border-2 flex flex-col items-center my-5">
            <button 
                @click="saveSettings"
                class="border-2 my-1 w-1/2 py-1 px-3 rounded bg-blue-500 text-white"
            >
                Save
            </button>
            <button 
                class="border-2 my-1 w-1/2 py-1 rounded bg-red-500 text-white"
            >
                Delete Organization
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const formData = ref({
    organizationName: '',
});

const saveSettings = () => {
    console.log('Settings saved:', formData.value);
    alert('Settings saved successfully!');
};

</script>