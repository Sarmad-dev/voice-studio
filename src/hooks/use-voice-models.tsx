"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getUserVoiceModels } from "@/actions/voiceModel.action";

// Use this adapter to make the server action compatible with React Query
const fetchVoiceModels = async () => {
  return getUserVoiceModels();
};

export function useVoiceModels() {
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['get-user-voice-models'],
    queryFn: fetchVoiceModels,
    enabled: true,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle errors
  if (query.error) {
    if (!error) {
      const errorMessage = query.error instanceof Error
        ? query.error.message
        : 'Failed to fetch voice models';
      toast.error(errorMessage);
      setError(errorMessage);
    }
  }

  return {
    voiceModels: query.data?.success ? query.data.data : [],
    isLoading: query.isPending,
    error,
    refetch: query.refetch,
  };
} 