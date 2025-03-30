import { Suspense } from "react";
import VoiceModelDetails from "@/components/voice-models/voice-model-details";
import { Skeleton } from "@/components/ui/skeleton";

interface VoiceModelPageProps {
  params: Promise<{modelId: string}>;
}

export default async function VoiceModelPage({ params }: VoiceModelPageProps) {
  const { modelId } = await params;
  
  return (
    <div className="space-y-8">
      <Suspense fallback={<VoiceModelSkeleton />}>
        <VoiceModelDetails modelId={modelId} />
      </Suspense>
    </div>
  );
}

function VoiceModelSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-lg" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
} 