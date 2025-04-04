"use server";

import { protectedAction } from "@/lib/server/trpc";
import { z } from "zod";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/db";
import { s3Client } from "@/lib/s3-client";

/**
 * Generate text-to-speech audio using ElevenLabs API
 */
export const generateSpeech = protectedAction
  .input(
    z.object({
      voiceId: z.string(),
      text: z.string().min(1).max(5000),
      modelId: z.string().optional(),
      title: z.string().optional(),
      userId: z.string()
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const { voiceId, text, modelId, title, userId } = input;

      // Call ElevenLabs API to generate speech
      const apiKey = process.env.ELEVENLABS_API_KEY;
      if (!apiKey) {
        throw new Error("ElevenLabs API key is not configured");
      }

      // API URL
      const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

      // Call the ElevenLabs API
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `ElevenLabs API error: ${errorData.detail || response.statusText}`
        );
      }

      // Get the audio data
      const audioBuffer = Buffer.from(await response.arrayBuffer());

      // Create a unique filename for the audio file
      const filename = `tts-${uuidv4()}.mp3`;
      const s3Key = `text-to-speech/${ctx.user.id}/${filename}`;

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

      // Store the audio in the database if it's associated with a model
      let audioRecord;

      // Check if user owns the voice model
      if (modelId) {
        const voiceModel = await prisma.voiceModel.findUnique({
          where: {
            id: modelId,
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
      }

      // Store the audio in the database
      audioRecord = await prisma.audioClip.create({
        data: {
          name: title || "Generated Text-to-Speech",
          fileUrl: s3Url,
          duration: approxDuration,
          text,
          modelId: voiceId ?? modelId,
          userId
        },
      });

      return {
        success: true,
        data: audioRecord,
      };
    } catch (error: any) {
      console.error("Error generating text-to-speech:", error);
      return {
        success: false,
        error: {
          message: error.message || "Failed to generate text-to-speech",
        },
      };
    }
  });
