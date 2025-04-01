"use server";

import { OpenAI } from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type EnhancementType = "grammar" | "paraphrase" | "both";

interface EnhanceTextOptions {
  text: string;
  enhancementType?: EnhancementType;
}

export async function enhanceText({
  text,
  enhancementType = "grammar",
}: EnhanceTextOptions): Promise<{ original: string; enhanced: string }> {
  // Validate input
  if (!text || text.trim().length === 0) {
    throw new Error("No text provided for enhancement");
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OpenAI API key is not configured. Please add it to your environment variables."
    );
  }

  try {
    // Create system message based on enhancement type
    let systemMessage = "";
    
    if (enhancementType === "grammar") {
      systemMessage = `You are an expert editor specializing in grammar, spelling, and punctuation. 
      Your task is to correct any grammar, spelling, or punctuation errors in the text without changing its meaning or style.
      - Fix spelling errors
      - Correct grammar mistakes
      - Fix punctuation issues
      - Maintain the original tone and style
      - Preserve all content and meaning
      
      Return only the corrected text with no explanations or comments.`;
    } else if (enhancementType === "paraphrase") {
      systemMessage = `You are an expert writer specializing in paraphrasing.
      Your task is to rewrite the text in a clear, engaging way while preserving its meaning.
      - Improve clarity and flow
      - Use more engaging language
      - Vary sentence structure
      - Maintain the original tone
      - Preserve all key information and meaning
      
      Return only the paraphrased text with no explanations or comments.`;
    } else if (enhancementType === "both") {
      systemMessage = `You are an expert editor and writer with a keen eye for detail.
      Your task is to enhance the provided text by:
      - Fixing any grammar, spelling, or punctuation errors
      - Improving clarity and flow
      - Making the language more engaging and professional
      - Varying sentence structure where appropriate
      - Maintaining the original tone and style
      - Preserving all key information and meaning
      
      Return only the enhanced text with no explanations or comments.`;
    }

    // Make the OpenAI API call
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: text },
      ],
      temperature: 0.3, // Lower temperature for more consistent outputs
      max_tokens: 4000, // Adjust based on expected response length
    });

    // Extract the enhanced text from the response
    const enhancedText = response.choices[0]?.message?.content || "";

    // Return both original and enhanced text
    return {
      original: text,
      enhanced: enhancedText,
    };
  } catch (error) {
    console.error("Error enhancing text:", error);
    throw new Error("Failed to enhance text. Please try again later.");
  }
} 