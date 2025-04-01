import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Create and export S3 client for use throughout the application
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Generate a pre-signed URL for accessing an S3 object
 * @param key The S3 object key
 * @param expiresIn Expiration time in seconds (default: 3600 = 1 hour)
 * @returns A pre-signed URL for accessing the object
 */
export async function generateSignedUrl(key: string, expiresIn = 3600): Promise<string> {
  try {
    console.log(`Generating signed URL for key: ${key}`);
    
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || "voice-studio-uploads",
      Key: key,
    });
    
    const signedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: expiresIn 
    });
    
    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new Error("Failed to generate signed URL for audio file");
  }
}

/**
 * Extracts the S3 key from a file URL
 * @param fileUrl The full S3 file URL
 * @returns The extracted S3 key
 */
export function extractS3KeyFromUrl(fileUrl: string): string {
  try {
    const url = new URL(fileUrl);
    const bucketName = process.env.AWS_S3_BUCKET || "voice-studio-uploads";
    
    // Handle various S3 URL formats
    if (url.hostname.includes(bucketName)) {
      // Format: https://bucket-name.s3.region.amazonaws.com/key
      return url.pathname.substring(1); // Remove leading '/'
    } else if (url.hostname.includes('s3.amazonaws.com')) {
      // Format: https://s3.amazonaws.com/bucket-name/key
      const pathParts = url.pathname.split('/').filter(part => part.length > 0);
      if (pathParts[0] === bucketName) {
        return pathParts.slice(1).join('/');
      }
    }
    
    // Fallback: just use the full path without the leading slash
    return url.pathname.substring(1);
  } catch (error) {
    console.error("Error extracting S3 key:", error);
    throw new Error("Invalid S3 URL format");
  }
}

/**
 * Check if an audio URL is accessible from the browser (CORS test)
 * @param url The audio URL to test
 * @returns Promise resolving to a boolean indicating if the URL is accessible
 */
export async function checkAudioUrlAccessibility(url: string): Promise<boolean> {
  try {
    // Try to fetch just the headers to test CORS
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'cors',
    });
    
    return response.ok;
  } catch (error) {
    console.error("CORS check failed:", error);
    return false;
  }
}

/**
 * Get the appropriate audio URL based on the environment and CORS configuration
 * This function will try to determine the best URL format to use
 * @param fileUrl The original S3 file URL
 * @returns A Promise resolving to the best URL to use for audio playback
 */
export async function getOptimalAudioUrl(fileUrl: string): Promise<string> {
  try {
    // The proxy endpoint will bypass CORS by fetching the audio on the server side
    const proxyUrl = `/api/audio-proxy?url=${encodeURIComponent(fileUrl)}`;
    console.log("Trying proxy URL first:", proxyUrl);
    
    // Try the server proxy first (most reliable across browsers)
    return proxyUrl;
    
    // Note: The code below is kept as fallback but not used anymore since proxy is preferred
    /*
    // Add a cachebuster to avoid browser caching issues
    const cacheBuster = `cachebust=${Date.now()}`;
    const urlWithCacheBuster = fileUrl.includes('?') 
      ? `${fileUrl}&${cacheBuster}` 
      : `${fileUrl}?${cacheBuster}`;
    
    console.log("Testing direct URL access with cache buster");
    
    // First try the original URL with a cache buster
    const isDirectlyAccessible = await checkAudioUrlAccessibility(urlWithCacheBuster);
    if (isDirectlyAccessible) {
      console.log("Direct URL (with cache buster) is accessible");
      return urlWithCacheBuster;
    }
    
    console.log("Direct URL access failed, trying signed URL");
    
    try {
      // If direct access fails, try to generate a signed URL
      const key = extractS3KeyFromUrl(fileUrl);
      const signedUrl = await generateSignedUrl(key);
      console.log("Generated signed URL");
      
      return signedUrl;
    } catch (signedUrlError) {
      console.error("Error generating signed URL:", signedUrlError);
      
      // As a last resort, try the original URL without modifications
      console.log("Falling back to original URL");
      return fileUrl;
    }
    */
  } catch (error) {
    console.error("Error getting optimal audio URL:", error);
    // Fall back to the original URL if all else fails
    return fileUrl;
  }
} 