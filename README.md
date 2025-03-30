# Voice Studio - AI Voice Cloning & Audio Editing Platform

Voice Studio is a comprehensive platform for AI voice cloning, text-to-speech generation, story creation, and audio editing - all in one place.

## Features

- **Voice Cloning**: Record or upload voice samples (5-10 minutes) and train custom AI voice models.
- **Text-to-Speech**: Generate speech in your custom voice with adjustable pitch, speed, and emotional tone.
- **Story Generation**: Create AI-generated stories based on prompts and convert them to audio.
- **Audio Editing**: Add background music, sound effects, trim, split, and merge audio clips.
- **Project Management**: Save, organize, and export projects in various formats.
- **Subscription Tiers**: Free tier with limited minutes, premium tier with unlimited usage.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Shadcn UI
- **State Management**: Zustand
- **Audio Processing**: Wavesurfer.js, Howler.js, Web Audio API
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **File Storage**: AWS S3
- **Voice APIs**: ElevenLabs / Resemble.ai
- **AI Text Generation**: OpenAI

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- AWS S3 bucket (for file storage)
- API keys for voice services (ElevenLabs/Resemble.ai)
- OpenAI API key

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/voice-studio.git
   cd voice-studio
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with:
   ```
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/voice_studio"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"

   # AWS S3
   AWS_ACCESS_KEY_ID="your-access-key"
   AWS_SECRET_ACCESS_KEY="your-secret-access-key"
   AWS_REGION="us-east-1"
   AWS_S3_BUCKET="voice-studio-uploads"

   # OpenAI
   OPENAI_API_KEY="your-openai-api-key"

   # Voice APIs
   ELEVENLABS_API_KEY="your-elevenlabs-api-key"
   RESEMBLE_API_KEY="your-resemble-api-key"
   ```

4. Initialize the database
   ```
   npx prisma db push
   ```

5. Run the development server
   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This application can be deployed on Vercel or any other Next.js-compatible hosting platform.

## License

[MIT](LICENSE)
