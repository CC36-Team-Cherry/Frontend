<template>
  <div class="flex justify-center items-center bg-gray-100">
    <div class="bg-white p-8 rounded shadow-md w-full max-w-lg">
      <h1 class="text-2xl font-bold mb-6 text-gray-800">{{ $t('register.title') }}</h1>
      <form class="flex flex-col space-y-4">
        <div>
          <label class="block text-gray-700 font-medium mb-2">
            {{ $t('login.email') }}:
          </label>
          <input
            v-model="formData.email"
            type="email"
            class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label class="block text-gray-700 font-medium mb-2">
            {{ $t('login.password') }}:
          </label>
          <input
            v-model="formData.password"
            type="password"
            class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label class="block text-gray-700 font-medium mb-2">
            {{ $t('register.firstName') }}:
          </label>
          <input
            v-model="formData.first_name"
            type="text"
            class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label class="block text-gray-700 font-medium mb-2">
            {{ $t('register.lastName') }}:
          </label>
          <input
            v-model="formData.last_name"
            type="text"
            class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label class="block text-gray-700 font-medium mb-2">
            {{ $t('employeeDetails.fields.dateOfBirth') }}:
          </label>
          <input
            v-model="formData.birthdate"
            type="date"
            class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label class="block text-gray-700 font-medium mb-2">
            {{ $t('settings.fields.role') }}:
          </label>
          <input
            v-model="formData.role"
            type="text"
            class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label class="block text-gray-700 font-medium mb-2">
            {{ $t('settings.fields.joinDate') }}:
          </label>
          <input
            v-model="formData.join_date"
            type="date"
            class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label class="block text-gray-700 font-medium mb-2">
            {{ $t('register.organizationName') }}:
          </label>
          <input
            v-model="formData.company_name"
            type="text"
            class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <button
          @click="handleSubmit()"
          type="button"
          class="bg-blue-500 text-white py-3 px-4 rounded hover:bg-blue-600 transition duration-200 font-semibold"
        >
          {{ $t('register.submit') }}
        </button>
        <button
          @click="goToLogin()"
          class="bg-red-500 text-white py-3 px-4 rounded hover:bg-red-600 transition duration-200 font-semibold"
        >
        {{ $t('register.goBack') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRaw, reactive } from 'vue';
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/authStore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig.ts'
import axios from 'axios';

const { t } = useI18n(); 
const router = useRouter();

// TODO: add active account state to track log in after registration, or set from login and update when register
// export const activeAccount = reactive({
//   id: , 
//   organizationId: ,
// });

const apiUrl = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;
const authStore = useAuthStore();

const formData = ref({
  email: '',
  auth_key: '',
  password: '',
  first_name: '',
  last_name: '',
  birthdate: '',
  role: '',
  join_date: '',
  company_name: '',
  is_admin: true,
  remaining_pto: 0,
});

const goToLogin = () => {
  router.push({ path: `/login` });
}

const handleSubmit = async () => {
  try {

    if (
      !formData.value.email ||
      !formData.value.password ||
      !formData.value.first_name ||
      !formData.value.last_name ||
      !formData.value.birthdate ||
      !formData.value.role ||
      !formData.value.join_date ||
      !formData.value.company_name
  ) {
    alert(t('register.errorFillAllFields')); 
    return;
  }

    // create Firebase user with form data and fetch post to add to backend
    createUserFirebase();

    console.log('Frontend - Registration completed:', formData.value);
    alert(t('register.success'));

} catch(err) {
    console.error(err);
  }
  
  /*authStore.setOrganization({
    name: formData.value.organizationName,
    details: formData.value.organizationDetails,
  });*/

};

const createUserFirebase = () => {
  const email = formData.value.email;
  const password = formData.value.password;
  const companyName = formData.value.company_name;

  createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed up 
    //TODO: save whatever info we need in the pinia store as a state
    const user = userCredential.user;
    console.log(user.uid);

    formData.value.auth_key = user.uid;
    const newAccount = toRaw(formData.value);

    axios.post(`${apiUrl}/registration`, {
      newAccount
    },
    {
      withCredentials: true,
    })    
    .then((response) => {
      const registeredAdmin = response.data;

      console.log("frontend registration", registeredAdmin);

      authStore.login({
        id: registeredAdmin.id,
        first_name: registeredAdmin.first_name, 
        last_name: registeredAdmin.last_name, 
        email: registeredAdmin.email, 
        company_id: registeredAdmin.company_id, 
        team_id: 0, 
        team_name: "", 
        role: registeredAdmin.role, 
        join_date: registeredAdmin.join_date, 
        pto: 0,
        Privileges: {
          is_admin: true,
          is_supervisor: false,
        },
        company: {
          name: companyName,
        }
        });
      }).then(() => {
        // User will be logged in automatically if account is successfully created
        router.push({ path: `/employee` });
        console.log("logged in user", authStore.user)
      })
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorCode, errorMessage);
  });
};

</script>

