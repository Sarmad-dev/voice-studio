import { NextRequest, NextResponse } from 'next/server';

/**
 * This endpoint acts as a proxy for audio files, bypassing CORS restrictions
 * by fetching the audio on the server side and streaming it to the client.
 */
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
    
    console.log("Audio proxy fetching:", url);
    
    // Fetch the audio file
    const response = await fetch(url, {
      headers: {
        // Include more specific audio types, with wav first since that's what we're having issues with
        'Accept': 'audio/wav,audio/wave,audio/x-wav,audio/webm,audio/mpeg,audio/mp4,audio/*',
      },
    });
    
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        message: `Failed to fetch audio: ${response.status} ${response.statusText}`,
      }, { status: response.status });
    }
    
    // Get content type and blob
    let contentType = response.headers.get('content-type');
    
    // If content type is missing or generic, try to determine from URL
    if (!contentType || contentType === 'application/octet-stream') {
      if (url.toLowerCase().endsWith('.wav')) {
        contentType = 'audio/wav';
      } else if (url.toLowerCase().endsWith('.mp3')) {
        contentType = 'audio/mpeg';
      } else if (url.toLowerCase().endsWith('.mp4')) {
        contentType = 'audio/mp4';
      } else {
        // Default to mpeg as a safe option
        contentType = 'audio/mpeg';
      }
    }
    
    const buffer = await response.arrayBuffer();
    
    // Create a response with appropriate headers
    const audioResponse = new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
    
    return audioResponse;
  } catch (error: any) {
    console.error("Audio proxy error:", error);
    return NextResponse.json({
      success: false,
      message: 'Failed to proxy audio file',
      error: error.message,
    }, { status: 500 });
  }
} 