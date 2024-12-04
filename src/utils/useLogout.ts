import { useRouter } from 'vue-router';
import { getAuth, signOut } from "firebase/auth";
import { useAuthStore } from "@/stores/authStore";
import axios from "axios";

export function useLogout() {
  const router = useRouter();
  const authStore = useAuthStore();
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleLogout = async () => {
    await logoutFirebase();
    await clearCookie();
    router.push({ path: `/login` });
  };

  const logoutFirebase = async () => {
    await signOut(getAuth());
    authStore.logout();
  };

  const clearCookie = async () => {
    await axios.post(`${apiUrl}/logout`, {}, { withCredentials: true });
  };

  return {
    handleLogout,
  };
}