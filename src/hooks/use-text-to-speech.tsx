"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { generateSpeech } from "@/actions/text-to-speech.action";

interface TextToSpeechProps {
  voiceId: string;
  text: string;
  modelId?: string;
  title?: string;
}

export function useTextToSpeech() {
  const [generatedAudio, setGeneratedAudio] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: async (input: TextToSpeechProps) => {
      return generateSpeech(input);
    },
    onSuccess: (result) => {
      if (result.success && result.data) {
        toast.success("Audio generated successfully");
        setGeneratedAudio(result.data);
      } else {
        toast.error(result.error?.message || "Failed to generate audio");
      }
    },
    onError: (error: Error) => {
      toast.error(`Error generating audio: ${error.message}`);
    },
  });

  const generateAudio = async (input: TextToSpeechProps) => {
    if (!input.voiceId || !input.text) {
      toast.error("Voice ID and text are required");
      return;
    }
    
    return mutation.mutateAsync(input);
  };

  return {
    generateAudio,
    generatedAudio,
    isGenerating: mutation.isPending,
    error: mutation.error,
    clearGeneratedAudio: () => setGeneratedAudio(null),
  };
} 