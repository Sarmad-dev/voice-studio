"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getVoiceModelById } from "@/actions/voiceModel.action";

// Use this adapter to make the server action compatible with React Query
const fetchVoiceModel = async (modelId: string) => {
  return await getVoiceModelById({ modelId });
};

export function useVoiceModel(modelId: string) {
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["voice-model", modelId],
    queryFn: () => fetchVoiceModel(modelId),
    enabled: !!modelId,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle errors
  if (query.error) {
    if (!error) {
      const errorMessage =
        query.error instanceof Error
          ? query.error.message
          : "Failed to fetch voice model";
      toast.error(errorMessage);
      setError(errorMessage);
    }
  }

  return {
    voiceModel: query.data?.success ? query.data.data : null,
    isLoading: query.isPending,
    error,
    refetch: query.refetch,
  };
}
