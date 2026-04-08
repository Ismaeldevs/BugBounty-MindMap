import { create } from 'zustand';
import { projectsAPI } from '../services/api';

export const useProjectStore = create((set) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  // Fetch all projects
  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await projectsAPI.list();
      set({ projects, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch projects',
        isLoading: false,
      });
    }
  },

  // Fetch single project with nodes
  fetchProject: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const project = await projectsAPI.get(projectId);
      set({ currentProject: project, isLoading: false });
      return project;
    } catch (error) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch project',
        isLoading: false,
      });
      throw error;
    }
  },

  // Create new project
  createProject: async (projectData) => {
    set({ isLoading: true, error: null });
    try {
      const newProject = await projectsAPI.create(projectData);
      set((state) => ({
        projects: [...state.projects, newProject],
        isLoading: false,
      }));
      return newProject;
    } catch (error) {
      set({
        error: error.response?.data?.detail || 'Failed to create project',
        isLoading: false,
      });
      throw error;
    }
  },

  // Update project
  updateProject: async (projectId, projectData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedProject = await projectsAPI.update(projectId, projectData);
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId ? updatedProject : p
        ),
        currentProject:
          state.currentProject?.id === projectId
            ? { ...state.currentProject, ...updatedProject }
            : state.currentProject,
        isLoading: false,
      }));
      return updatedProject;
    } catch (error) {
      set({
        error: error.response?.data?.detail || 'Failed to update project',
        isLoading: false,
      });
      throw error;
    }
  },

  // Delete project
  deleteProject: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      await projectsAPI.delete(projectId);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId),
        currentProject:
          state.currentProject?.id === projectId ? null : state.currentProject,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.detail || 'Failed to delete project',
        isLoading: false,
      });
      throw error;
    }
  },

  // Export project
  exportProject: async (projectId) => {
    try {
      const exportData = await projectsAPI.export(projectId);
      // Trigger download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-${projectId}-export.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      set({
        error: error.response?.data?.detail || 'Failed to export project',
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
