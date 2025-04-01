"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getAudioFileUrl } from "@/actions/voice-sample.action";

/**
 * Hook to get a pre-signed URL for an audio file
 * @param sampleId The ID of the voice sample
 * @returns The pre-signed URL and loading/error states
 */
export function useAudioUrl(sampleId: string) {
  const [error, setError] = useState<string | null>(null);
  
  const query = useQuery({
    queryKey: ["audio-url", sampleId],
    queryFn: async () => {
      if (!sampleId) return null;
      return getAudioFileUrl({ sampleId });
    },
    enabled: !!sampleId,
    staleTime: 45 * 60 * 1000, // 45 minutes (URLs expire after 1 hour)
  });
  
  // Handle errors
  if (query.error && !error) {
    const errorMessage = query.error instanceof Error
      ? query.error.message
      : "Failed to get audio URL";
    
    toast.error(errorMessage);
    setError(errorMessage);
  }

  console.log("Signed URL: ", query.data?.data?.signedUrl)
  
  return {
    signedUrl: query.data?.success ? query.data.data?.signedUrl : null,
    isLoading: query.isPending,
    error,
    refetch: query.refetch,
  };
} 