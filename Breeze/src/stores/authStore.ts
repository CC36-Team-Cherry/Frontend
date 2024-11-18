import { defineStore } from 'pinia';

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
  }),
  actions: {
    login(user: User) {
      this.user = user;
    },
    logout() {
      this.user = null;
      this.organization = null;
    },
    setOrganization(organization: Organization) {
      this.organization = organization;
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.user,
  },
});
