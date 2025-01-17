import { defineStore } from 'pinia';
import { AppPageType } from '@/types/AppState';
import piniaPersist from 'pinia-plugin-persistedstate';
import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  supervisor_id?: number;
  company_id: number;
  team_id: number;
  team_name: string;
  role: string;
  join_date: Date;
  leave_date?: Date;
  pto: number;
  last_login?: Date;
  language_preference: string;
  Privileges: {
    is_admin: boolean,
    is_supervisor: boolean;
  },
  company: {
    name: string;
  }
}

interface Organization {
  name: string;
  details?: string;
}

export interface ApprovalRequest {
  id: number;
  status: string;
  supervisorName: string;
  employeeName: string;
  attendanceType: string;
  date: string;
  memo: string;
  updated_at: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    currentPage: AppPageType.LOGIN, 
    approvals: {
      sent: [] as ApprovalRequest[],
      received: [] as ApprovalRequest[],
    }
  }),
  actions: {
    login(user: User) {
      this.user = user;
      this.currentPage = AppPageType.EMPLOYEE_LIST; 
    },
    logout() {
      this.user = null;
      this.currentPage = AppPageType.LOGIN; 
    },
    navigateToPage(pageType: AppPageType) {
      this.currentPage = pageType; 
    },
    setApprovals(sent: ApprovalRequest[], received: ApprovalRequest[]) {
      this.approvals.sent = sent;
      this.approvals.received = received;
    },
    async fetchPendingApprovals() {
      try {
        const response = await axios.get(`${apiUrl}/accounts/${this.user?.id}/approvals`);
        this.approvals.sent = response.data.sent || [];
        this.approvals.received = response.data.received || [];
      } catch (error) {
        console.error("Error fetching pending approvals:", error);
      }
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.user,
    showSidebar: (state) => state.currentPage !== AppPageType.LOGIN &&
                            state.currentPage !== AppPageType.REGISTRATION,
    pendingApprovalsCount: (state) => {
      const sentPending = state.approvals.sent.filter(approval => approval.status === 'Pending').length;
      const receivedPending = state.approvals.received.filter(approval => approval.status === 'Pending').length;
      return sentPending + receivedPending;
    },
  },
  
  persist: true,
});

