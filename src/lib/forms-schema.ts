import { z } from "zod";

export const createVoiceModelSchema = z.object({
  name: z.string().min(3, "name should be at least 3 characters"),
  description: z
    .string()
    .min(10, "description should be at least 10 characters")
    .max(150, "description should not exceed 30 characters"),
});

// Schema for updating a voice model
export const updateVoiceModelSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  externalId: z.string().optional(),
  status: z.enum(["PROCESSING", "READY", "FAILED"]).optional(),
});