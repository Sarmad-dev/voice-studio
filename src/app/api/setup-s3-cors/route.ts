import { NextResponse } from 'next/server';
import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';

export async function POST() {
  try {
    // Ensure this is only accessible in development mode
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({
        success: false,
        message: "This endpoint is only available in development mode",
      }, { status: 403 });
    }
    
    // Initialize the S3 client
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });

    // Set up the CORS configuration
    const bucketName = process.env.AWS_S3_BUCKET || "voice-studio-uploads";
    const command = new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "HEAD"],
            AllowedOrigins: ["*"],  // In production, you should limit this to your specific domains
            ExposeHeaders: ["ETag", "Content-Length"],
            MaxAgeSeconds: 86400,
          },
        ],
      },
    });
    
    await s3Client.send(command);
    
    return NextResponse.json({
      success: true,
      message: "CORS configuration set up successfully",
      note: "In production, you should limit AllowedOrigins to specific domains",
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: "Failed to set up CORS configuration",
      error: error.message,
    }, { status: 500 });
  }
} 