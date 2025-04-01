import { NextResponse } from 'next/server';

export async function GET() {
  // Check if OpenAI API key is configured
  const apiKey = process.env.OPENAI_API_KEY;
  
  // Return whether the API key is configured (exists and has a valid length)
  return NextResponse.json({
    configured: !!apiKey && apiKey.length > 10, // Basic length check
  });
} 