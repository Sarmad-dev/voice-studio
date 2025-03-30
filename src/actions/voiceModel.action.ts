"use server";

import { protectedAction } from "./../lib/server/trpc";
import {
  createVoiceModelSchema,
  updateVoiceModelSchema,
} from "./../lib/forms-schema";
import { prisma } from "@/lib/db";
import { User, VoiceModel } from "@prisma/client";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// Type definition for response from server actions
export interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    errors?: Record<string, string[]>;
  };
}

export const createVoiceModel = protectedAction
  .input(createVoiceModelSchema)
  .mutation(async ({ ctx, input }): Promise<ActionResponse<VoiceModel>> => {
    try {

      const { name, description } = input;
      const voice = await prisma.voiceModel.create({
        data: {
          name,
          description,
          userId: ctx.user.id,
          provider: "ELEVENLABS", // Default provider
          status: "PROCESSING", // Default initial status
        },
      });

      if (!voice) {
        return {
          success: false,
          error: {
            message: "Something went wrong",
          },
        };
      }

      return {
        success: true,
        data: voice,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || "Failed to create voice model",
        },
      };
    }
  });

export const getUserVoiceModels = protectedAction.query(async ({ ctx }) => {
  try {

    const voiceModels = await prisma.voiceModel.findMany({
      where: {
        userId: ctx.user.id,
      },
    });

    return {
      success: true,
      data: voiceModels,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || "Failed to get voice models",
      },
    };
  }
});

// Get a voice model by ID
export const getVoiceModelById = protectedAction
  .input(
    z.object({
      modelId: z.string(),
    })
  )
  .query(async ({ ctx, input }): Promise<ActionResponse<VoiceModel>> => {
    try {
      const { modelId } = input;

      // Find the voice model
      const voiceModel = await prisma.voiceModel.findUnique({
        where: {
          id: modelId,
        },
      });

      if (!voiceModel) {
        return {
          success: false,
          error: {
            message: "Voice model not found",
          },
        };
      }

      // Check if the user owns this model
      if (voiceModel.userId !== ctx.user.id) {
        return {
          success: false,
          error: {
            message: "You don't have permission to access this voice model",
          },
        };
      }

      return {
        success: true,
        data: voiceModel,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || "Failed to get voice model",
        },
      };
    }
  });

// Update a voice model
export const updateVoiceModel = protectedAction
  .input(updateVoiceModelSchema)
  .mutation(async ({ ctx, input }): Promise<ActionResponse<VoiceModel>> => {
    try {
      const { id, ...updateData } = input;

      // Find the voice model
      const voiceModel = await prisma.voiceModel.findUnique({
        where: {
          id,
        },
      });

      if (!voiceModel) {
        return {
          success: false,
          error: {
            message: "Voice model not found",
          },
        };
      }

      // Check if the user owns this model
      if (voiceModel.userId !== ctx.user.id) {
        return {
          success: false,
          error: {
            message: "You don't have permission to update this voice model",
          },
        };
      }

      // Update the voice model
      const updatedModel = await prisma.voiceModel.update({
        where: {
          id,
        },
        data: updateData,
      });

      return {
        success: true,
        data: updatedModel,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || "Failed to update voice model",
        },
      };
    }
  });
