"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createVoiceModel } from "@/actions/voiceModel.action";
import { VoiceModel } from "@prisma/client";
import { createVoiceModelSchema } from "@/lib/forms-schema";
import { z } from "zod";

// Define the form schema type
export type CreateVoiceModelInput = z.infer<typeof createVoiceModelSchema>;

// Define the response type
export interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    errors?: Record<string, string[]>;
  };
}

export function useCreateVoiceModel() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (input: CreateVoiceModelInput): Promise<ActionResponse<VoiceModel>> => {
      try {
        const result = await createVoiceModel(input);
        return result;
      } catch (err) {
        console.error("Error creating voice model:", err);
        throw err;
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Voice model created successfully");
        // Invalidate the query to refetch the voice models list
        queryClient.invalidateQueries({ queryKey: ["get-user-voice-models"] });
      } else if (data.error) {
        toast.error(data.error.message || "Failed to create voice model");
        setError(data.error.message || "An error occurred");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create voice model");
      setError(error.message || "An error occurred");
    },
  });

  const createModel = async (input: CreateVoiceModelInput) => {
    setError(null);
    return mutation.mutateAsync(input);
  };

  return {
    createVoiceModel: createModel,
    isLoading: mutation.isPending,
    error,
    reset: () => {
      setError(null);
      mutation.reset();
    },
  };
} 