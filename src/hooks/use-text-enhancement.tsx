"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { enhanceText, EnhancementType } from "@/actions/enhance-text.action";

interface EnhanceTextProps {
  text: string;
  enhancementType?: EnhancementType;
}

export function useTextEnhancement() {
  const [enhancedContent, setEnhancedContent] = useState<{ original: string; enhanced: string } | null>(null);

  const { mutate, isPending: isEnhancing } = useMutation({
    mutationFn: async (data: EnhanceTextProps) => {
      return await enhanceText(data);
    },
    onSuccess: (data) => {
      setEnhancedContent(data);
      toast.success("Text enhanced successfully");
    },
    onError: (error) => {
      console.error("Error enhancing text:", error);
      toast.error(error instanceof Error ? error.message : "Failed to enhance text");
    },
  });

  const enhance = async (text: string, enhancementType: EnhancementType = "grammar") => {
    if (!text || text.trim().length === 0) {
      toast.error("Please provide text to enhance");
      return;
    }

    mutate({ text, enhancementType });
  };

  const clearEnhancedContent = () => {
    setEnhancedContent(null);
  };

  return {
    enhanceText: enhance,
    enhancedContent,
    isEnhancing,
    clearEnhancedContent,
  };
} 