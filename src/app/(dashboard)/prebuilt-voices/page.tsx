import { Metadata } from "next";
import { PrebuiltVoicesBrowser } from "@/components/prebuilt-voices/prebuilt-voices-browser";

export const metadata: Metadata = {
  title: "Prebuilt Voices | Voice Studio",
  description: "Browse and use ElevenLabs prebuilt voices for your projects",
};

export default function PrebuiltVoicesPage() {
  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prebuilt Voices</h1>
          <p className="text-muted-foreground">
            Browse and use ElevenLabs' professional voices for your content.
          </p>
        </div>
        
        <div className="mt-8">
          <PrebuiltVoicesBrowser showApplyButton={false} />
        </div>
      </div>
    </div>
  );
} 