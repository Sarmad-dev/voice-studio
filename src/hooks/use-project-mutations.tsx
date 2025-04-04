"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  createProject, 
  updateProject, 
  deleteProject, 
  createProjectFromStory 
} from "@/actions/project.action";
import { useRouter } from "next/navigation";

// Hook for creating a new project
export function useCreateProject() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (input: any) => {
      try {
        const result = await createProject(input);
        return result;
      } catch (err) {
        console.error("Error creating project:", err);
        throw err;
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Project created successfully");
        queryClient.invalidateQueries({ queryKey: ["get-user-projects"] });
        router.push(`/projects/${data.data.id}`);
      } else if (data.error) {
        toast.error(data.error.message || "Failed to create project");
        setError(data.error.message || "An error occurred");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create project");
      setError(error.message || "An error occurred");
    },
  });

  return {
    createProject: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error,
    reset: () => {
      setError(null);
      mutation.reset();
    },
  };
}

// Hook for creating a project from a story
export function useCreateProjectFromStory() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (input: any) => {
      try {
        const result = await createProjectFromStory(input);
        return result;
      } catch (err) {
        console.error("Error creating project from story:", err);
        throw err;
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Project created successfully from story");
        queryClient.invalidateQueries({ queryKey: ["get-user-projects"] });
        router.push(`/editor?projectId=${data.data.id}`);
      } else if (data.error) {
        toast.error(data.error.message || "Failed to create project from story");
        setError(data.error.message || "An error occurred");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create project from story");
      setError(error.message || "An error occurred");
    },
  });

  return {
    createProjectFromStory: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error,
    reset: () => {
      setError(null);
      mutation.reset();
    },
  };
}

// Hook for updating a project
export function useUpdateProject() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (input: any) => {
      try {
        const result = await updateProject(input);
        return result;
      } catch (err) {
        console.error("Error updating project:", err);
        throw err;
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Project updated successfully");
        queryClient.invalidateQueries({ queryKey: ["get-user-projects"] });
        queryClient.invalidateQueries({ queryKey: ["get-project", data.data.id] });
      } else if (data.error) {
        toast.error(data.error.message || "Failed to update project");
        setError(data.error.message || "An error occurred");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update project");
      setError(error.message || "An error occurred");
    },
  });

  return {
    updateProject: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error,
    reset: () => {
      setError(null);
      mutation.reset();
    },
  };
}

// Hook for deleting a project
export function useDeleteProject() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (input: { projectId: string }) => {
      try {
        const result = await deleteProject(input);
        return result;
      } catch (err) {
        console.error("Error deleting project:", err);
        throw err;
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Project deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["get-user-projects"] });
        router.push("/projects");
      } else if (data.error) {
        toast.error(data.error.message || "Failed to delete project");
        setError(data.error.message || "An error occurred");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete project");
      setError(error.message || "An error occurred");
    },
  });

  return {
    deleteProject: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error,
    reset: () => {
      setError(null);
      mutation.reset();
    },
  };
} 