"use client";

import { Suspense } from "react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import VoiceModelCard from "@/components/voice-models/voice-model-card";
import CreateVoiceModelDialog from "@/components/voice-models/create-voice-model-dialog";
import { useVoiceModels } from "@/hooks/use-voice-models";

export default function VoiceModelsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Voice Models</h1>
        <CreateVoiceModelDialog />
      </div>

      <Suspense fallback={<VoiceModelsGridSkeleton />}>
        <VoiceModelsGrid />
      </Suspense>
    </div>
  );
}

function VoiceModelsGrid() {
  const { voiceModels = [], isLoading, error } = useVoiceModels();

  if (isLoading) {
    return <VoiceModelsGridSkeleton />;
  }

  if (error) {
    return (
      <div className="p-8 text-center rounded-lg border bg-card">
        <Icons.alertCircle className="mx-auto h-10 w-10 text-destructive mb-4" />
        <h3 className="text-lg font-medium mb-2">Error loading voice models</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          <Icons.refresh className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* User's Voice Models */}
      {voiceModels.map((model) => (
        <VoiceModelCard key={model.id} model={model} />
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
        <CreateVoiceModelDialog 
          trigger={
            <Button className="mt-6">Get Started</Button>
          }
        />
      </div>
    </div>
  );
}

function VoiceModelsGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-16 w-full" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex border-t pt-4 items-center justify-between">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      ))}
      {/* Skeleton for the "Create New" card */}
      <Skeleton className="h-[250px] rounded-lg" />
    </div>
  );
} 