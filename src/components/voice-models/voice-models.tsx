"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { useVoiceModels } from "@/hooks/use-voice-models";
import { Skeleton } from "@/components/ui/skeleton";

export default function VoiceModels() {
  const { voiceModels = [], isLoading, error } = useVoiceModels();
  
  if (isLoading) {
    return <VoiceModelsSkeleton />;
  }
  
  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive">Error loading voice models</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }
  
  if (voiceModels.length === 0) {
    return (
      <div className="p-8 text-center">
        <Icons.mic className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No voice models yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Create your first voice model to get started
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid divide-y">
      {voiceModels.map((model) => (
        <div key={model.id} className="flex items-center justify-between p-4">
          <div>
            <h3 className="font-medium">{model.name}</h3>
            <p className="text-sm text-muted-foreground">
              Created {new Date(model.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                model.status === "READY" ? "success" : 
                model.status === "PROCESSING" ? "warning" : "destructive"
              }
            >
              {model.status}
            </Badge>
            <Link href={`/voice-models/${model.id}`}>
              <Button size="sm" variant="ghost">
                <Icons.chevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

function VoiceModelsSkeleton() {
  return (
    <div className="grid divide-y">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between p-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
