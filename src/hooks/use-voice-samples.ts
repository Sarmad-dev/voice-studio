"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getVoiceSamples } from "@/actions/voice-sample.action";

// Define the voice sample type
interface VoiceSample {
  id: string;
  name: string;
  fileUrl: string;
  duration: number;
  transcription: string | null;
  createdAt: Date;
  voiceModelId: string;
  isGenerated: boolean;
}

// Adapter for React Query
const fetchVoiceSamples = async (modelId: string) => {
  return await getVoiceSamples({ voiceModelId: modelId });
};

export function useVoiceSamples(modelId: string) {
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["voice-samples", modelId],
    queryFn: () => fetchVoiceSamples(modelId),
    enabled: !!modelId,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle errors
  if (query.error && !error) {
    const errorMessage =
      query.error instanceof Error
        ? query.error.message
        : "Failed to fetch voice samples";
    toast.error(errorMessage);
    setError(errorMessage);
  }

  // Separate recorded samples from generated ones
  const originalSamples = query.data?.success && query.data.data
    ? (query.data.data as VoiceSample[]).filter((sample) => !sample.isGenerated)
    : [];

  const generatedSamples = query.data?.success && query.data.data
    ? (query.data.data as VoiceSample[]).filter((sample) => sample.isGenerated)
    : [];

  return {
    originalSamples,
    generatedSamples,
    isLoading: query.isPending,
    error,
    refetch: query.refetch,
  };
} 