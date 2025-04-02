"use client";

import { VoiceModel } from "@prisma/client";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "../ui/badge";

interface VoiceModelCardProps {
  model: VoiceModel;
}

export default function VoiceModelCard({ model }: VoiceModelCardProps) {
  // Format the creation date
  const formattedDate = new Date(model.createdAt).toLocaleDateString();
  
  // Determine the provider based on the model (can be expanded based on your application's logic)
  const provider = model.provider || "UNKNOWN"
  
  return (
    <div className="flex flex-col justify-between rounded-lg border bg-card transition-colors hover:bg-accent/10">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{model.name}</h3>
          <Badge
            variant={
              model.status === "READY" ? "success" : 
              model.status === "PROCESSING" ? "warning" : "default"
            }
          >
            {model.status}
          </Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {model.description || "No description provided"}
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Icons.mic className="h-3 w-3" />
          <span>{provider}</span>
          <span>•</span>
          <span>Created {formattedDate}</span>
        </div>
      </div>
      <div className="flex items-center justify-between border-t p-4">
        <Button variant="ghost" size="sm" disabled={model.status !== "READY"}>
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
  );
} 