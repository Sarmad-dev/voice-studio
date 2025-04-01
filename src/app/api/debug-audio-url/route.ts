import { NextRequest, NextResponse } from 'next/server';
import { getOptimalAudioUrl, checkAudioUrlAccessibility } from '@/lib/s3-client';

export async function GET(request: NextRequest) {
  try {
    // Get the URL from the query parameter
    const url = request.nextUrl.searchParams.get('url');
    
    if (!url) {
      return NextResponse.json({
        success: false,
        message: 'URL parameter is required',
      }, { status: 400 });
    }
    
    // Check if the URL is directly accessible
    const isAccessible = await checkAudioUrlAccessibility(url);
    
    // Try to get an optimized URL
    const optimizedUrl = await getOptimalAudioUrl(url);
    
    // Check if the optimized URL is accessible
    const isOptimizedAccessible = await checkAudioUrlAccessibility(optimizedUrl);
    
    return NextResponse.json({
      success: true,
      originalUrl: url,
      isDirectlyAccessible: isAccessible,
      optimizedUrl: optimizedUrl,
      isOptimizedAccessible: isOptimizedAccessible,
      recommendation: !isAccessible && !isOptimizedAccessible 
        ? "Configure CORS for your S3 bucket" 
        : "Use the optimized URL for audio playback",
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Failed to debug audio URL',
      error: error.message,
    }, { status: 500 });
  }
} 