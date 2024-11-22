import { defineStore } from 'pinia';
import { AppPageType } from '@/types/AppState';

interface User {
  name: string;
  email: string;
}

interface Organization {
  name: string;
  details?: string;
}
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    organization: null as Organization | null,
    currentPage: AppPageType.LOGIN, 
  }),
  actions: {
    login(user: User) {
      this.user = user;
      this.currentPage = AppPageType.EMPLOYEE_LIST; 
    },
    logout() {
      this.user = null;
      this.organization = null;
      this.currentPage = AppPageType.LOGIN; 
    },
    navigateToPage(pageType: AppPageType) {
      this.currentPage = pageType; 
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.user,
    showSidebar: (state) => state.currentPage === AppPageType.EMPLOYEE_LIST || 
                            state.currentPage === AppPageType.CALENDAR ||
                            state.currentPage === AppPageType.SETTINGS
  },
});

