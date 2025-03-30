# Prebuilt Voices Feature

This feature allows users to browse, preview, and use ElevenLabs' prebuilt voices in their projects.

## Features

- Browse a catalog of professional ElevenLabs voices
- Filter voices by gender, accent, and other attributes
- Preview voices with original samples
- Generate custom samples with any text
- Apply prebuilt voices to existing voice models

## Implementation Components

1. **ElevenLabs Integration**
   - Added functions in `src/lib/elevenlabs.ts` to fetch prebuilt voices and generate previews

2. **Server Actions**
   - Created `src/actions/prebuilt-voices.action.ts` with server actions for:
     - Fetching all prebuilt voices
     - Generating samples using prebuilt voices
     - Applying prebuilt voices to existing models

3. **Custom Hooks**
   - Added `src/hooks/use-prebuilt-voices.tsx` for client-side state management and data fetching

4. **UI Components**
   - Created `src/components/prebuilt-voices/prebuilt-voices-browser.tsx` - the main component for browsing voices
   - Integrated into the voice model details page as a new tab
   - Added a standalone page at `/prebuilt-voices`

## Getting Started

### Prerequisites

1. ElevenLabs API Key
   - Add your ElevenLabs API key to your `.env` file:
   ```
   ELEVENLABS_API_KEY=your-api-key-here
   ```

2. AWS S3 Configuration (for storing generated samples)
   - Make sure your S3 bucket is properly configured
   - Required environment variables:
   ```
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_REGION=your-region
   AWS_S3_BUCKET=your-bucket-name
   ```

### Using the Feature

**Standalone Page**
- Navigate to `/prebuilt-voices` to browse all available voices
- Search and filter voices
- Preview with original samples and generate custom samples

**Integration with Voice Models**
- Go to any voice model details page
- Click on the "Prebuilt Voices" tab
- Browse, preview, and apply voices to your model

## Implementation Notes

- Prebuilt voices are fetched directly from ElevenLabs API
- Generated samples are stored in S3 and can be associated with voice models
- Voice models using prebuilt voices are marked as "READY" status
- The prebuilt voice ID is stored as the model's `externalId`

## Future Improvements

- Add more detailed filtering options (language, use case)
- Implement pagination for large voice catalogs
- Add favorite/starred voices functionality
- Improve caching for better performance
- Add voice similarity search (find voices similar to a reference) 