"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getUserProjects } from "@/actions/project.action";
import { AudioProject } from "@prisma/client";

// Use this adapter to make the server action compatible with React Query
const fetchProjects = async () => {
  return getUserProjects({});
};

export function useProjects() {
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['get-user-projects'],
    queryFn: fetchProjects,
    enabled: true,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle errors
  if (query.error) {
    if (!error) {
      const errorMessage = query.error instanceof Error
        ? query.error.message
        : 'Failed to fetch projects';
      toast.error(errorMessage);
      setError(errorMessage);
    }
  }

  return {
    projects: query.data?.success ? query.data.data as (AudioProject & { 
      voiceModel: { name: string } | null;
      story: { title: string } | null;
    })[] : [],
    isLoading: query.isPending,
    error,
    refetch: query.refetch,
  };
} 