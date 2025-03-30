"use server";

import { protectedAction } from "@/lib/server/trpc";
import { z } from "zod";
import { getPrebuiltVoices, generatePreviewAudio } from "@/lib/elevenlabs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

// Configure S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Fetch all prebuilt voices from ElevenLabs
 */
export const fetchPrebuiltVoices = protectedAction
  .query(async ({ ctx }) => {
    try {
      // Fetch prebuilt voices from ElevenLabs
      const voices = await getPrebuiltVoices();
      
      return {
        success: true,
        data: voices,
      };
    } catch (error: any) {
      console.error("Error fetching prebuilt voices:", error);
      return {
        success: false,
        error: {
          message: error.message || "Failed to fetch prebuilt voices",
        },
      };
    }
  });

/**
 * Generate a sample using a prebuilt voice and save it to S3
 */
export const generateVoiceSample = protectedAction
  .input(
    z.object({
      voiceId: z.string(),
      text: z.string().min(1).max(500),
      voiceModelId: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const { voiceId, text, voiceModelId } = input;
      
      // Generate audio sample using ElevenLabs
      const audioBuffer = await generatePreviewAudio(voiceId, text);
      
      // Create a unique filename for the audio file
      const filename = `prebuilt-sample-${uuidv4()}.mp3`;
      const s3Key = `prebuilt-samples/${ctx.user.id}/${filename}`;
      
      // Upload audio to S3
      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET || "voice-studio-uploads",
          Key: s3Key,
          Body: audioBuffer,
          ContentType: "audio/mpeg",
        })
      );
      
      // Create the S3 URL
      const s3Url = `https://${
        process.env.AWS_S3_BUCKET || "voice-studio-uploads"
      }.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${s3Key}`;
      
      // Calculate audio duration (approximate)
      // This is a simplification - in a real app you'd want to analyze the audio data
      const approxDuration = Math.floor(audioBuffer.length / 16000); // Very rough estimate
      
      let sample;
      
      // If a voice model ID is provided, associate the sample with it
      if (voiceModelId) {
        // Verify user owns the voice model
        const voiceModel = await prisma.voiceModel.findUnique({
          where: {
            id: voiceModelId,
            userId: ctx.user.id,
          },
        });
        
        if (!voiceModel) {
          return {
            success: false,
            error: {
              message: "Voice model not found or you don't have permission",
            },
          };
        }
        
        // Store the sample in the database
        sample = await prisma.voiceSample.create({
          data: {
            name: "Prebuilt Voice Sample",
            fileUrl: s3Url,
            duration: approxDuration,
            // Include prebuilt voice info in the transcription
            transcription: `${text} [From prebuilt voice: ${voiceId}]`,
            voiceModelId,
            isGenerated: true,
          },
        });
      } else {
        // Create a temporary sample not associated with any model
        sample = {
          id: uuidv4(),
          name: "Prebuilt Voice Sample",
          fileUrl: s3Url,
          duration: approxDuration,
          transcription: text,
          isGenerated: true,
          createdAt: new Date(),
          // We'll skip metadata for temporary samples
        };
      }
      
      return {
        success: true,
        data: sample,
      };
    } catch (error: any) {
      console.error("Error generating voice sample:", error);
      return {
        success: false,
        error: {
          message: error.message || "Failed to generate voice sample",
        },
      };
    }
  });

/**
 * Apply a prebuilt voice to an existing voice model
 */
export const applyPrebuiltVoice = protectedAction
  .input(
    z.object({
      voiceId: z.string(),
      voiceModelId: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const { voiceId, voiceModelId } = input;
      
      // Verify user owns the voice model
      const voiceModel = await prisma.voiceModel.findUnique({
        where: {
          id: voiceModelId,
          userId: ctx.user.id,
        },
      });
      
      if (!voiceModel) {
        return {
          success: false,
          error: {
            message: "Voice model not found or you don't have permission",
          },
        };
      }
      
      // Update the voice model with the prebuilt voice ID
      const updatedModel = await prisma.voiceModel.update({
        where: {
          id: voiceModelId,
        },
        data: {
          externalId: voiceId,
          status: "READY", // Mark as ready since we're using a prebuilt voice
          description: voiceModel.description 
            ? `${voiceModel.description} [Using ElevenLabs prebuilt voice]` 
            : "Using ElevenLabs prebuilt voice",
        },
      });
      
      return {
        success: true,
        data: updatedModel,
      };
    } catch (error: any) {
      console.error("Error applying prebuilt voice:", error);
      return {
        success: false,
        error: {
          message: error.message || "Failed to apply prebuilt voice",
        },
      };
    }
  }); 