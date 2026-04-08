import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          await authAPI.login(credentials);
          
          // Get user info
          const user = await authAPI.getCurrentUser();
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          set({
            error: error.response?.data?.detail || 'Login failed',
            isLoading: false,
          });
          return { success: false, error: error.response?.data?.detail };
        }
      },

      // Register action
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          await authAPI.register(userData);
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          set({
            error: error.response?.data?.detail || 'Registration failed',
            isLoading: false,
          });
          return { success: false, error: error.response?.data?.detail };
        }
      },

      // Logout action
      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          // Ignore errors, clear state anyway
        }
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      // Initialize auth from cookie
      initAuth: async () => {
        try {
          const user = await authAPI.getCurrentUser();
          set({
            user,
            isAuthenticated: true,
          });
        } catch (error) {
          // Cookie invalid or expired - silently fail
          set({
            user: null,
            isAuthenticated: false,
          });
          // Don't propagate the error to avoid triggering interceptor
        }
      },

      // Update profile action
      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
          const updatedUser = await authAPI.updateProfile(profileData);
          set({
            user: updatedUser,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          set({
            error: error.response?.data?.detail || 'Failed to update profile',
            isLoading: false,
          });
          return { success: false, error: error.response?.data?.detail };
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
