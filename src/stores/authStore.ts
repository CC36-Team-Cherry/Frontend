import { defineStore } from 'pinia';
import { AppPageType } from '@/types/AppState';

interface User {
  first_name: string;
  last_name: string;
  email: string;
  is_admin: boolean;
  is_supervisor: boolean;
  supervisor_id?: boolean;
  company_id: number;
  team_id: number;
  team_name: string;
  role: string;
  join_date: Date;
  leave_date?: Date;
  pto: number;
  last_login?: Date;
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
    showSidebar: (state) => state.currentPage === AppPageType.EMPLOYEE_LIST, 
  },
  persist: true,
});

