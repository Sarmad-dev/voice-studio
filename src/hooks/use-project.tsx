"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getProjectById } from "@/actions/project.action";
import { AudioProject, AudioClip } from "@prisma/client";

// Use this adapter to make the server action compatible with React Query
const fetchProject = async (projectId: string) => {
  return await getProjectById({ projectId });
};

export function useProject(projectId: string) {
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["get-project", projectId],
    queryFn: () => fetchProject(projectId),
    enabled: !!projectId,
    retry: 1,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Handle errors
  if (query.error) {
    if (!error) {
      const errorMessage =
        query.error instanceof Error
          ? query.error.message
          : "Failed to fetch project";
      toast.error(errorMessage);
      setError(errorMessage);
    }
  }

  return {
    project: query.data?.success ? (query.data.data as AudioProject & {
      voiceModel: { name: string; id: string } | null;
      story: { title: string; content: string } | null;
      audioClips: AudioClip[];
    }) : null,
    isLoading: query.isPending,
    error,
    refetch: query.refetch,
  };
} 