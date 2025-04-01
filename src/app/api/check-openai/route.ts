import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  // Check if the API key is configured and has a minimum expected length
  // This does not verify that the key is valid with OpenAI, just that it's present
  const isConfigured = Boolean(apiKey && apiKey.length > 20);
  
  return NextResponse.json({
    configured: isConfigured
  });
} 