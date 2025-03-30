"use server";

import { protectedAction } from "./../lib/server/trpc";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import * as ElevenLabs from "@/lib/elevenlabs";

// Configure S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

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

      await s3Client.send(command);
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

        await s3Client.send(command);
        
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

      // Call Elevenlabs API to generate audio
      // This is a placeholder - in real implementation you would use the SDK
      // Mock the response for now
      const mockGeneratedAudioUrl = 
        `https://example.com/generated-audio-${uuidv4()}.mp3`;

      // In real implementation, you would:
      // 1. Call Elevenlabs API with the voice ID and text
      // 2. Get back audio data
      // 3. Upload that to S3
      // 4. Store reference in database

      // Create a sample for the generated audio
      const generatedSample = await prisma.voiceSample.create({
        data: {
          name: "Generated Sample",
          fileUrl: mockGeneratedAudioUrl,
          duration: 0, // This would be calculated from the response
          transcription: text, // Store the text used to generate
          voiceModelId,
          isGenerated: true, // Flag to identify generated samples
        },
      });

      return {
        success: true,
        data: generatedSample,
      };
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
      
      // Extract the key from the fileUrl
      const fileUrl = new URL(voiceSample.fileUrl);
      
      // Extract the bucket name and key 
      const bucketName = process.env.AWS_S3_BUCKET || "voice-studio-uploads";
      let key;
      
      if (fileUrl.hostname.includes(bucketName)) {
        // The URL is in format https://bucket-name.s3.region.amazonaws.com/key
        key = fileUrl.pathname.substring(1); // Remove leading '/'
      } else {
        // Try to extract the key from the path, assuming the pattern includes the bucket name
        const pathParts = fileUrl.pathname.split('/');
        // Remove empty parts and find the index after the bucket name
        const filteredParts = pathParts.filter(part => part.length > 0);
        const bucketIndex = filteredParts.findIndex(part => part === bucketName);
        
        if (bucketIndex >= 0 && bucketIndex < filteredParts.length - 1) {
          // The key is everything after the bucket name
          key = filteredParts.slice(bucketIndex + 1).join('/');
        } else {
          // Fallback: just use the full path without the leading slash
          key = fileUrl.pathname.substring(1);
        }
      }
      
      console.log(`Generating pre-signed URL for key: ${key} in bucket: ${bucketName}`);
      
      // Generate a pre-signed URL for the S3 object
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET || "voice-studio-uploads",
        Key: key,
      });
      
      // Set expiration to 1 hour
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      
      return {
        success: true,
        data: {
          signedUrl,
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