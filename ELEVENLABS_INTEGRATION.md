# ElevenLabs Integration

This document describes how the ElevenLabs voice cloning API is integrated with the Voice Studio application.

## Overview

The Voice Studio app uses ElevenLabs' voice cloning technology to:

1. Clone a user's voice based on uploaded audio samples
2. Generate test audio using the cloned voice
3. Store the ElevenLabs voice ID and use it for future text-to-speech generation

## Setup Requirements

1. An ElevenLabs API key (obtain from [https://elevenlabs.io/](https://elevenlabs.io/))
2. Add the API key to your `.env` file:

```
ELEVENLABS_API_KEY="your-elevenlabs-api-key"
```

## Implementation Files

The integration consists of the following files:

1. **`src/lib/elevenlabs.ts`**: Contains utility functions for interacting with the ElevenLabs API
   - `cloneVoice()`: Creates a voice clone from an audio sample
   - `generateTestAudio()`: Generates a test audio clip using a cloned voice

2. **`src/actions/voice-sample.action.ts`**: Server actions that use the ElevenLabs utilities
   - `cloneVoiceWithElevenlabs()`: Orchestrates the voice cloning process, including:
     - Verifying user ownership
     - Calling the ElevenLabs API
     - Updating the voice model in the database
     - Generating and storing a test sample
     - Returning the results to the client

## Flow Diagram

```
User Records Audio → Upload to S3 → cloneVoiceWithElevenlabs → cloneVoice (ElevenLabs) → Update DB → generateTestAudio → Store Test Sample
```

## Usage in Components

The main component that utilizes this functionality is the `VoiceRecorder` component, which:
1. Records audio from the user's microphone
2. Uploads the recording to S3 using `uploadAudioToS3`
3. Initiates the voice cloning process using `cloneVoiceWithElevenlabs`
4. Handles success/error states and provides feedback to the user

## Error Handling

The integration includes comprehensive error handling:
1. Checks if the API key is configured
2. Validates that voice samples exist and belong to the user
3. Handles API errors from ElevenLabs
4. Provides meaningful error messages
5. Logs detailed errors for debugging

## Limitations and Future Improvements

1. Currently, only WAV files are supported for voice cloning
2. Test audio generation is simple - more advanced generation could be added
3. The API response could include more metrics about the voice quality
4. Throttling could be implemented to prevent excessive API calls

## API Documentation

For more details on the ElevenLabs API, refer to their official documentation:
https://docs.elevenlabs.io/api-reference 