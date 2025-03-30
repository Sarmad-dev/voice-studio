import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Link from "next/link";

// Mock data for demonstration
const mockVoiceModels = [
  {
    id: "1",
    name: "My Voice",
    description: "My personal voice clone",
    status: "READY",
    createdAt: "2023-03-20",
    provider: "ELEVENLABS",
  },
  {
    id: "2",
    name: "Narrator",
    description: "Professional narrator voice",
    status: "READY",
    createdAt: "2023-03-15",
    provider: "ELEVENLABS",
  },
  {
    id: "3",
    name: "Character Voice",
    description: "Sci-fi character voice for animations",
    status: "PROCESSING",
    createdAt: "2023-04-02",
    provider: "RESEMBLEAI",
  },
];

export default function VoiceModelsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Voice Models</h1>
        <Button>
          <Icons.plus className="mr-2 h-4 w-4" />
          New Voice Model
        </Button>
      </div>

      {/* Voice Models Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockVoiceModels.map((model) => (
          <div
            key={model.id}
            className="flex flex-col justify-between rounded-lg border bg-card transition-colors hover:bg-accent/10"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{model.name}</h3>
                <div
                  className={`rounded-full px-2 py-1 text-xs ${
                    model.status === "READY"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {model.status}
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {model.description}
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Icons.mic className="h-3 w-3" />
                <span>{model.provider}</span>
                <span>•</span>
                <span>Created {model.createdAt}</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t p-4">
              <Button variant="ghost" size="sm">
                <Icons.play className="mr-2 h-4 w-4" />
                Test
              </Button>
              <Link href={`/voice-models/${model.id}`}>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </Link>
            </div>
          </div>
        ))}

        {/* Add New Voice Model Card */}
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Icons.plus className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mt-4 font-medium">Create New Voice Model</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload voice samples to train a new custom voice model
          </p>
          <Button className="mt-6">Get Started</Button>
        </div>
      </div>
    </div>
  );
} 