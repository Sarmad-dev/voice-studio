"use server";

import { protectedAction } from "./../lib/server/trpc";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import * as ElevenLabs from "@/lib/elevenlabs";
import { s3Client as s3, extractS3KeyFromUrl, generateSignedUrl } from "@/lib/s3-client";

// Function to get the current user from the database using context or email
async function getCurrentDbUser(ctx: any): Promise<User> {
  const { user } = ctx;
  
  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User not authenticated",
    });
  }
  
  // If the user has an email, get the latest data from the database
  if (user.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });
    
    if (!dbUser) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not found in database",
      });
    }
    
    return dbUser;
  }
  
  // Fallback to direct ID lookup
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });
  
  if (!dbUser) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User not found in database",
    });
  }
  
  return dbUser;
}

// Upload audio to S3
export const uploadAudioToS3 = protectedAction
  .input(
    z.object({
      voiceModelId: z.string(),
      audioBase64: z.string(),
      contentType: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const { voiceModelId, audioBase64, contentType } = input;
      
      // Get the current database user
      const currentUser = await getCurrentDbUser(ctx);
      
      // Check if the voice model belongs to the user
      const voiceModel = await prisma.voiceModel.findUnique({
        where: {
          id: voiceModelId,
          userId: currentUser.id, // Use the database user ID
        },
      });

      if (!voiceModel) {
        throw new Error("Voice model not found or doesn't belong to you");
      }

      // Convert base64 to buffer
      const audioBuffer = Buffer.from(audioBase64, 'base64');
      console.log(`Decoded audio buffer, size: ${audioBuffer.length} bytes`);

      // Generate unique filename
      const fileName = `${voiceModelId}/${uuidv4()}.wav`;
      const bucketName = process.env.AWS_S3_BUCKET || "voice-studio-uploads";
      console.log(`Uploading to S3 bucket: ${bucketName}, file: ${fileName}`);
      
      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: audioBuffer,
        ContentType: contentType,
      });

      await s3.send(command);
      console.log(`Successfully uploaded file to S3`);
      
      // Create the voice sample record in the database
      const region = process.env.AWS_REGION || "us-east-1";
      const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;
      console.log(`File URL: ${fileUrl}`);
      
      const voiceSample = await prisma.voiceSample.create({
        data: {
          name: "Recorded Sample",
          fileUrl,
          duration: 0, // This would need to be calculated from the audio
          voiceModelId,
        },
      });
      console.log(`Created voice sample record, id: ${voiceSample.id}`);

      return {
        success: true,
        data: voiceSample,
      };
    } catch (error: any) {
      console.error("Error uploading to S3:", error);
      return {
        success: false,
        error: {
          message: error.message || "Failed to upload audio",
        },
      };
    }
  });

// Clone voice with ElevenLabs API
export const cloneVoiceWithElevenlabs = protectedAction
  .input(
    z.object({
      voiceModelId: z.string(),
      voiceSampleId: z.string(),
      audioBase64: z.string().optional(), // Optional field to receive audio directly
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const { voiceModelId, voiceSampleId, audioBase64 } = input;
      
      // Get the current database user
      const currentUser = await getCurrentDbUser(ctx);
      
      // Check if the voice model belongs to the user
      const voiceModel = await prisma.voiceModel.findUnique({
        where: {
          id: voiceModelId,
          userId: currentUser.id, // Use the database user ID
        },
      });

      if (!voiceModel) {
        return {
          success: false,
          error: {
            message: "Voice model not found or you don't have access to it",
          },
        };
      }
      
      // Check if the voice sample exists and belongs to this model
      const voiceSample = await prisma.voiceSample.findUnique({
        where: {
          id: voiceSampleId,
          voiceModelId: voiceModelId
        }
      });
      
      if (!voiceSample) {
        return {
          success: false,
          error: {
            message: "Voice sample not found or doesn't belong to this model",
          },
        };
      }

      // Prepare audio data for ElevenLabs
      let audioBuffer: Buffer | null = null;
      
      // If audio base64 was provided, use it directly
      if (audioBase64) {
        console.log("Using provided audio base64 data");
        audioBuffer = Buffer.from(audioBase64, 'base64');
      } else {
        console.log("No audio data provided, will attempt to fetch from S3");
        // Note: This path will likely fail due to S3 permissions
      }

      // Call ElevenLabs API to clone the voice
      let externalId;
      try {
        console.log("Calling ElevenLabs API to clone voice");
        externalId = await ElevenLabs.cloneVoice(
          voiceSample.fileUrl,
          voiceModel.name,
          voiceModel.description || `Voice model for ${currentUser.username}`,
          audioBuffer
        );
        console.log(`Successfully obtained voice ID: ${externalId}`);
      } catch (elevenLabsError: any) {
        console.error("Error from ElevenLabs:", elevenLabsError);
        return {
          success: false,
          error: {
            message: elevenLabsError.message || "Failed to clone voice with ElevenLabs",
          },
        };
      }
      
      // Update the voice model with the external ID from ElevenLabs
      const updatedModel = await prisma.voiceModel.update({
        where: {
          id: voiceModelId,
        },
        data: {
          externalId,
          status: "READY",
        },
      });
      
      // Generate a test sample using the cloned voice
      try {
        // Generate a test audio using ElevenLabs
        const testAudioBuffer = await ElevenLabs.generateTestAudio(externalId);
        
        // Generate unique filename for the test sample
        const fileName = `${voiceModelId}/${uuidv4()}_test.mp3`;
        const bucketName = process.env.AWS_S3_BUCKET || "voice-studio-uploads";
        
        // Upload test audio to S3
        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: fileName,
          Body: testAudioBuffer,
          ContentType: 'audio/mpeg',
        });

        await s3.send(command);
        
        // Create a record for the generated test sample
        const region = process.env.AWS_REGION || "us-east-1";
        const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;
        
        await prisma.voiceSample.create({
          data: {
            name: "Generated Test Sample",
            fileUrl,
            duration: 0, // Would need to calculate actual duration
            voiceModelId,
            isGenerated: true,
          },
        });
      } catch (error) {
        console.error("Error generating test sample:", error);
        // Continue with the flow even if test sample generation fails
      }

      return {
        success: true,
        data: {
          voiceModel: updatedModel,
          externalId,
        },
      };
    } catch (error: any) {
      console.error("Error cloning voice:", error);
      return {
        success: false,
        error: {
          message: error.message || "Failed to clone voice",
        },
      };
    }
  });

// Get voice samples for a voice model
export const getVoiceSamples = protectedAction
  .input(
    z.object({
      voiceModelId: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    try {
      const { voiceModelId } = input;
      
      // Get the current database user
      const currentUser = await getCurrentDbUser(ctx);
      
      // Check if the voice model belongs to the user
      const voiceModel = await prisma.voiceModel.findUnique({
        where: {
          id: voiceModelId,
          userId: currentUser.id,
        },
      });

      if (!voiceModel) {
        return {
          success: false,
          error: {
            message: "Voice model not found or you don't have access to it",
          },
        };
      }
      
      // Get all voice samples for this model
      const voiceSamples = await prisma.voiceSample.findMany({
        where: {
          voiceModelId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      return {
        success: true,
        data: voiceSamples,
      };
    } catch (error: any) {
      console.error("Error fetching voice samples:", error);
      return {
        success: false,
        error: {
          message: error.message || "Failed to fetch voice samples",
        },
      };
    }
  });

// Generate test audio with cloned voice
export const generateTestAudio = protectedAction
  .input(
    z.object({
      voiceModelId: z.string(),
      text: z.string().min(1).max(500),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const { voiceModelId, text } = input;
      
      // Verify user owns the voice model and it has an externalId
      const voiceModel = await prisma.voiceModel.findUnique({
        where: {
          id: voiceModelId,
          userId: ctx.user.id,
          status: "READY", // Model must be ready
        },
      });

      if (!voiceModel || !voiceModel.externalId) {
        return {
          success: false,
          error: {
            message: 
              "Voice model not found, not ready, or doesn't have an external ID",
          },
        };
      }

      // Call Elevenlabs API to generate audio using the actual API
      try {
        const elevenlabsVoiceId = voiceModel.externalId;
        
        // Generate the audio using ElevenLabs API
        const audioBuffer = await ElevenLabs.generateTestAudio(
          elevenlabsVoiceId, 
          text
        );
        
        // Create unique filename for the generated sample
        const fileName = `${voiceModelId}/${uuidv4()}_generated.mp3`;
        const bucketName = process.env.AWS_S3_BUCKET || "voice-studio-uploads";
        
        // Upload generated audio to S3
        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: fileName,
          Body: audioBuffer,
          ContentType: 'audio/mpeg',
        });

        await s3.send(command);
        
        // Create the S3 URL for the uploaded file
        const region = process.env.AWS_REGION || "us-east-1";
        const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;
        
        // Calculate approximate duration (this is an estimate)
        const approximateDuration = Math.floor(audioBuffer.length / 16000);
        
        // Create a sample record in the database
        const generatedSample = await prisma.voiceSample.create({
          data: {
            name: "Generated Sample",
            fileUrl: fileUrl,
            duration: approximateDuration,
            transcription: text, // Store the text used to generate
            voiceModelId,
            isGenerated: true, // Flag to identify generated samples
          },
        });

        return {
          success: true,
          data: generatedSample,
        };
      } catch (elevenlabsError: any) {
        console.error("Error generating audio with ElevenLabs:", elevenlabsError);
        return {
          success: false,
          error: {
            message: elevenlabsError.message || "Failed to generate audio with ElevenLabs",
          },
        };
      }
    } catch (error: any) {
      console.error("Error generating test audio:", error);
      return {
        success: false,
        error: {
          message: error.message || "Failed to generate test audio",
        },
      };
    }
  });

// Generate a pre-signed URL for accessing a voice sample
export const getAudioFileUrl = protectedAction
  .input(
    z.object({
      sampleId: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    try {
      const { sampleId } = input;
      
      // Get the current database user
      const currentUser = await getCurrentDbUser(ctx);
      
      // Find the voice sample
      const voiceSample = await prisma.voiceSample.findUnique({
        where: {
          id: sampleId,
        },
        include: {
          voiceModel: true, // Include voice model to check ownership
        },
      });
      
      if (!voiceSample) {
        return {
          success: false,
          error: {
            message: "Voice sample not found",
          },
        };
      }
      
      // Check if user owns the voice model
      if (voiceSample.voiceModel.userId !== currentUser.id) {
        return {
          success: false,
          error: {
            message: "You don't have permission to access this sample",
          },
        };
      }
      
      if (!voiceSample.fileUrl) {
        return {
          success: false,
          error: {
            message: "Sample has no associated file",
          },
        };
      }
      
      // Extract the key using our utility function
      const key = extractS3KeyFromUrl(voiceSample.fileUrl);
      
      console.log(`Generating pre-signed URL for key: ${key}`);
      
      // Generate a pre-signed URL using our utility
      const signedUrl = await generateSignedUrl(key);
      
      return {
        success: true,
        data: {
          signedUrl,
          sampleId: voiceSample.id,
          name: voiceSample.name,
        },
      };
    } catch (error: any) {
      console.error("Error generating pre-signed URL:", error);
      return {
        success: false,
        error: {
          message: error.message || "Failed to generate audio URL",
        },
      };
    }
  }); 