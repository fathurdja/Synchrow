import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/axios';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  department_id?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  roles: string[];
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setAuth: (token: string, user: User, roles: string[], permissions: string[]) => void;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  hasRole: (role: string | string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      roles: [],
      permissions: [],
      isAuthenticated: false,
      isLoading: false,

      setAuth: (token, user, roles, permissions) => {
        set({
          token,
          user,
          roles,
          permissions,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          token: null,
          user: null,
          roles: [],
          permissions: [],
          isAuthenticated: false,
        });
      },

      fetchProfile: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/me');
          set({
            user: response.data.user,
            roles: response.data.roles,
            permissions: response.data.permissions,
            isAuthenticated: true,
          });
        } catch (error) {
          // If token is invalid or expired
          get().logout();
        } finally {
          set({ isLoading: false });
        }
      },

      hasRole: (role) => {
        const { roles } = get();
        if (roles.includes('super_admin')) return true;
        
        if (Array.isArray(role)) {
          return role.some(r => roles.includes(r));
        }
        return roles.includes(role);
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }), // We only persist the token, everything else is fetched on load to ensure roles are up to date
    }
  )
);
