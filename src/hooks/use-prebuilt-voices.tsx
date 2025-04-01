"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  fetchPrebuiltVoices, 
  generateVoiceSample,
  applyPrebuiltVoice
} from "@/actions/prebuilt-voices.action";
import { PrebuiltVoice } from "@/lib/elevenlabs";

interface SampleResult {
  id: string;
  fileUrl: string;
  name: string;
  transcription?: string | null;
  duration: number;
  createdAt: Date;
  isGenerated: boolean;
  voiceModelId?: string;
}

export function usePrebuiltVoices() {
  const [selectedVoice, setSelectedVoice] = useState<PrebuiltVoice | null>(null);
  const [generatedSamples, setGeneratedSamples] = useState<Record<string, SampleResult>>({});
  const queryClient = useQueryClient();
  
  // Fetch all prebuilt voices
  const {
    data: voicesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["prebuilt-voices"],
    queryFn: async () => {
      return fetchPrebuiltVoices();
    },
  });
  
  // Generate a sample with a prebuilt voice
  const generateSample = useMutation({
    mutationFn: async ({
      voiceId,
      text,
      voiceModelId,
    }: {
      voiceId: string;
      text: string;
      voiceModelId?: string;
    }) => {
      return generateVoiceSample({ voiceId, text, voiceModelId });
    },
    onSuccess: (result) => {
      if (result.success && result.data) {
        toast.success("Sample generated successfully");
        
        // Store the generated sample
        const sampleData: SampleResult = {
          ...result.data,
          // Ensure we handle potential missing fields
          voiceModelId: 'voiceModelId' in result.data ? result.data.voiceModelId : undefined
        };
        
        setGeneratedSamples((prev) => ({
          ...prev,
          [sampleData.id]: sampleData,
        }));
        
        // If we're using a model, invalidate any related queries
        if (sampleData.voiceModelId) {
          queryClient.invalidateQueries({
            queryKey: ["voice-model", sampleData.voiceModelId],
          });
        }
      } else {
        toast.error(result.error?.message || "Failed to generate sample");
      }
    },
    onError: (error: Error) => {
      toast.error(`Error generating sample: ${error.message}`);
    },
  });
  
  // Apply a prebuilt voice to a model
  const applyVoice = useMutation({
    mutationFn: async ({
      voiceId,
      voiceModelId,
    }: {
      voiceId: string;
      voiceModelId: string;
    }) => {
      return applyPrebuiltVoice({ voiceId, voiceModelId });
    },
    onSuccess: (result) => {
      if (result.success && result.data) {
        toast.success("Voice applied to model successfully");
        
        // Invalidate the voice model query
        queryClient.invalidateQueries({
          queryKey: ["voice-model", result.data.id],
        });
      } else {
        toast.error(result.error?.message || "Failed to apply voice to model");
      }
    },
    onError: (error: Error) => {
      toast.error(`Error applying voice: ${error.message}`);
    },
  });
  
  // Filter voices by various criteria
  const filterVoices = (filters: {
    gender?: string;
    accent?: string;
    age?: string;
    useCase?: string;
    searchQuery?: string;
  }) => {
    if (!voicesData?.success || !voicesData.data) {
      return [];
    }
    
    return voicesData.data.filter((voice: PrebuiltVoice) => {
      // Apply filters
      if (filters.gender && voice.gender !== filters.gender) return false;
      if (filters.accent && voice.accent !== filters.accent) return false;
      if (filters.age && voice.age !== filters.age) return false;
      if (filters.useCase && voice.useCase !== filters.useCase) return false;
      
      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          voice.name.toLowerCase().includes(query) ||
          voice.description.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  };
  
  return {
    voices: voicesData?.success ? voicesData.data : [],
    isLoading,
    error: error 
      ? (error instanceof Error ? error.message : "An error occurred") 
      : (voicesData?.error?.message || null),
    refetch,
    selectedVoice,
    setSelectedVoice,
    generatedSamples,
    generateSample: generateSample.mutate,
    isGeneratingSample: generateSample.isPending,
    applyVoice: applyVoice.mutate,
    isApplyingVoice: applyVoice.isPending,
    filterVoices,
  };
} 