import { NextResponse } from 'next/server';
import { S3Client, GetBucketCorsCommand } from '@aws-sdk/client-s3';

export async function GET() {
  try {
    // Initialize the S3 client
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });

    // Get the bucket CORS configuration
    const bucketName = process.env.AWS_S3_BUCKET || "voice-studio-uploads";
    const command = new GetBucketCorsCommand({ Bucket: bucketName });
    
    try {
      const corsData = await s3Client.send(command);
      
      return NextResponse.json({
        success: true,
        message: "CORS configuration retrieved successfully",
        corsRules: corsData.CORSRules || [],
      });
    } catch (corsError: any) {
      // If CORS is not configured, it will throw an error
      return NextResponse.json({
        success: false,
        message: "CORS not configured on this bucket",
        error: corsError.message,
        recommendation: "Set up CORS configuration for browser audio playback",
        corsTemplate: {
          "CORSRules": [
            {
              "AllowedHeaders": ["*"],
              "AllowedMethods": ["GET", "HEAD"],
              "AllowedOrigins": ["*"],  // In production, replace with your specific domains
              "ExposeHeaders": ["ETag", "Content-Length"],
              "MaxAgeSeconds": 86400
            }
          ]
        }
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: "Failed to check CORS configuration",
      error: error.message,
    }, { status: 500 });
  }
} 