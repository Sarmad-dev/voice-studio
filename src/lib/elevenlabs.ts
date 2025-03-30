/**
 * ElevenLabs API integration
 * Documentation: https://docs.elevenlabs.io/api-reference
 */

// Initialize ElevenLabs API key
const API_KEY = process.env.ELEVENLABS_API_KEY;
const API_BASE_URL = "https://api.elevenlabs.io/v1";

if (!API_KEY) {
  console.warn(
    "ElevenLabs API key is not set. Voice cloning features will not work."
  );
}

/**
 * Fetch all available prebuilt voices from ElevenLabs
 * @returns Array of available voices with their details
 */
export async function getPrebuiltVoices() {
  try {
    if (!API_KEY) {
      throw new Error("ElevenLabs API key is not configured");
    }

    console.log("Fetching prebuilt voices from ElevenLabs");
    
    // Make API request to get all available voices
    const response = await fetch(`${API_BASE_URL}/voices`, {
      method: 'GET',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `ElevenLabs API error (${response.status}): `;
      
      try {
        // Try to parse error as JSON
        const errorData = JSON.parse(errorText);
        errorMessage += errorData.detail || errorData.message || errorText;
      } catch (e) {
        // If not JSON, use raw text
        errorMessage += errorText || response.statusText;
      }
      
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    const voices = result.voices as Voice[]
    
    // Filter for prebuilt voices and format the response
    const prebuiltVoices = voices
      .filter((voice: any) => voice.category === "premade")
      .map((voice: any) => ({
        id: voice.voice_id,
        name: voice.name,
        description: voice.description || "",
        previewUrl: voice.preview_url,
        category: voice.category,
        labels: voice.labels || {},
        // Add additional metadata if needed
        gender: voice.labels?.gender || "unknown",
        accent: voice.labels?.accent || "neutral",
        age: voice.labels?.age || "unknown",
        useCase: voice.labels?.use_case || "general",
      }));
    
    console.log(`Successfully fetched ${prebuiltVoices.length} prebuilt voices`);
    return prebuiltVoices;
  } catch (error: any) {
    console.error("Error fetching prebuilt voices:", error);
    throw new Error(error.message || "Failed to fetch prebuilt voices");
  }
}

/**
 * Generate a preview audio using a prebuilt voice
 * @param voiceId The ElevenLabs voice ID to use
 * @param text The text to convert to speech
 * @returns Buffer containing the generated audio
 */
export async function generatePreviewAudio(
  voiceId: string,
  text: string = "Hello, I'm a prebuilt voice from ElevenLabs."
): Promise<Buffer> {
  try {
    if (!API_KEY) {
      throw new Error("ElevenLabs API key is not configured");
    }
    
    // Prepare the request body
    const requestBody = {
      text: text,
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    };
    
    // Make the API request to generate speech
    const ttsResponse = await fetch(`${API_BASE_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      throw new Error(`ElevenLabs API error: ${errorText || ttsResponse.statusText}`);
    }
    
    // Get the audio buffer from the response
    const arrayBuffer = await ttsResponse.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error: any) {
    console.error("Error generating preview audio:", error);
    throw new Error(error.message || "Failed to generate preview audio");
  }
}

/**
 * Clone a voice using the ElevenLabs API
 * @param sampleUrl URL of the voice sample to clone (used as fallback)
 * @param name Name of the voice model
 * @param description Description of the voice model
 * @param audioBuffer Optional audio buffer to use directly
 * @returns The cloned voice ID from ElevenLabs
 */
export async function cloneVoice(
  sampleUrl: string,
  name: string,
  description: string,
  audioBuffer?: Buffer | null
): Promise<string> {
  try {
    if (!API_KEY) {
      throw new Error("ElevenLabs API key is not configured");
    }

    console.log(`Starting voice cloning process for model: ${name}`);

    // Create formdata for multipart request
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description || "Created with Voice Studio");

    // Handle audio data - prefer direct buffer if available
    if (audioBuffer && audioBuffer.length > 0) {
      console.log(`Using provided audio buffer (${audioBuffer.length} bytes)`);

      try {
        // Try to create a file and append it to form data
        formData.append("files", new Blob([audioBuffer]), "sample.wav");
        console.log("Successfully appended audio file to form data");
      } catch (blobError) {
        console.error("Error creating Blob:", blobError);

        // If Blob fails, try to directly append buffer with raw filename
        try {
          // @ts-ignore - Handle different FormData implementations
          formData.append("files", audioBuffer, {
            filename: "sample.wav",
            contentType: "audio/wav",
          });
          console.log("Appended audio with raw filename");
        } catch (appendError) {
          console.error(
            "Error appending buffer with raw filename:",
            appendError
          );
          throw new Error("Failed to prepare audio data for upload");
        }
      }
    } else {
      // Only try to fetch from URL if no buffer is provided
      console.log(
        "No buffer provided, attempting to fetch from URL (likely to fail)"
      );
      console.log(`URL: ${sampleUrl}`);

      // This is mostly a fallback but likely won't work due to S3 permissions
      throw new Error(
        "Direct audio data is required - URL fetching is not supported"
      );
    }

    // Make API request to ElevenLabs
    console.log("Making request to ElevenLabs API");
    const cloneResponse = await fetch(`${API_BASE_URL}/voices/add`, {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
      },
      body: formData,
    });

    if (!cloneResponse.ok) {
      const errorText = await cloneResponse.text();
      let errorMessage = `ElevenLabs API error (${cloneResponse.status}): `;

      try {
        // Try to parse error as JSON
        const errorData = JSON.parse(errorText);
        errorMessage += errorData.detail || errorData.message || errorText;
      } catch (e) {
        // If not JSON, use raw text
        errorMessage += errorText || cloneResponse.statusText;
      }

      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const result = await cloneResponse.json();

    if (!result.voice_id) {
      throw new Error("Voice ID not returned from ElevenLabs");
    }

    console.log(`Voice successfully cloned with ID: ${result.voice_id}`);
    return result.voice_id;
  } catch (error: any) {
    console.error("Error cloning voice with ElevenLabs:", error);
    throw new Error(error.message || "Failed to clone voice with ElevenLabs");
  }
}

/**
 * Generate a test audio sample using the cloned voice
 * @param voiceId The ElevenLabs voice ID
 * @param text The text to convert to speech
 * @returns Buffer containing the generated audio
 */
export async function generateTestAudio(
  voiceId: string,
  text: string = "Hello, this is a test of my cloned voice."
): Promise<Buffer> {
  try {
    if (!API_KEY) {
      throw new Error("ElevenLabs API key is not configured");
    }

    // Prepare the request body
    const requestBody = {
      text: text,
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    };

    // Make the API request to generate speech
    const ttsResponse = await fetch(
      `${API_BASE_URL}/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      throw new Error(
        `ElevenLabs API error: ${errorText || ttsResponse.statusText}`
      );
    }

    // Get the audio buffer from the response
    const arrayBuffer = await ttsResponse.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error: any) {
    console.error("Error generating test audio with ElevenLabs:", error);
    throw new Error(
      error.message || "Failed to generate test audio with ElevenLabs"
    );
  }
}
