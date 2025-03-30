import { Icons } from "@/components/icons";
import { FileText } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-center p-10 bg-muted">
        <div className="flex items-center gap-2 mb-4">
          <Icons.logo className="h-10 w-10" />
          <h1 className="text-2xl font-bold">Voice Studio</h1>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">
            Create, Clone, Craft
          </h2>
          <p className="text-muted-foreground">
            Train custom AI voice models, generate stories, and edit audio - all in one powerful studio.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="p-4 bg-background rounded-lg">
              <Icons.mic className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">Voice Cloning</h3>
              <p className="text-sm text-muted-foreground">
                Train a custom AI voice with just a few minutes of audio.
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg">
              <FileText className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">Story Generation</h3>
              <p className="text-sm text-muted-foreground">
                Generate engaging stories with AI in any genre.
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg">
              <Icons.music className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">Audio Editing</h3>
              <p className="text-sm text-muted-foreground">
                Trim, split, add background music, and export your audio.
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg">
              <Icons.save className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">Project Management</h3>
              <p className="text-sm text-muted-foreground">
                Save and organize your voice models and projects.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center">
        {children}
      </div>
    </div>
  );
} 