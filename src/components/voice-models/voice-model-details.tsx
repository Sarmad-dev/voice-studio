"use client";

import { useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import VoiceRecorder from "@/components/voice-recorder";
import { AudioPlayer } from "@/components/audio-player";
import { toast } from "sonner";
import { updateVoiceModel } from "@/actions/voiceModel.action";
import { generateTestAudio } from "@/actions/voice-sample.action";
import { useVoiceModel } from "@/hooks/use-voice-model";
import { useVoiceSamples } from "@/hooks/use-voice-samples";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PrebuiltVoicesBrowser } from "@/components/prebuilt-voices/prebuilt-voices-browser";

interface VoiceModelDetailsProps {
  modelId: string;
}

export default function VoiceModelDetails({ modelId }: VoiceModelDetailsProps) {
  const {
    voiceModel,
    error,
    isLoading: isVoiceModelLoading,
    refetch: refetchVoiceModel,
  } = useVoiceModel(modelId);

  const {
    originalSamples,
    generatedSamples,
    isLoading: isSamplesLoading,
    refetch: refetchSamples,
  } = useVoiceSamples(modelId);

  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(voiceModel?.name);
  const [description, setDescription] = useState(voiceModel?.description || "");
  const [isLoading, setIsLoading] = useState(false);
  const [generatingText, setGeneratingText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAudioUploaded = () => {
    // Refetch voice model and samples when a new audio is uploaded
    refetchVoiceModel();
    refetchSamples();
  };

  if (isVoiceModelLoading || isSamplesLoading) {
    return (
      <div className="w-full h-[90vh] flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!voiceModel) {
    notFound();
  }

  // Format the date for display
  const formattedDate = new Date(
    voiceModel?.createdAt as Date
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Handle saving changes
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await updateVoiceModel({
        id: voiceModel?.id as string,
        name,
        description,
      });

      if (result.success) {
        toast.success("Voice model updated successfully");
        setIsEditing(false);
        refetchVoiceModel();
      } else {
        toast.error(result.error?.message || "Failed to update voice model");
      }
    } catch (error) {
      console.error("Failed to update voice model:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate test audio with the cloned voice
  const handleGenerateTestAudio = async () => {
    if (!generatingText.trim()) {
      toast.error("Please enter some text to generate");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateTestAudio({
        voiceModelId: modelId,
        text: generatingText,
      });

      if (result.success) {
        toast.success("Test audio generated successfully");
        refetchSamples();
        setGeneratingText("");
      } else {
        toast.error(result.error?.message || "Failed to generate test audio");
      }
    } catch (error) {
      console.error("Failed to generate test audio:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const isModelReady = voiceModel.status === "READY";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditing ? "Edit Voice Model" : voiceModel?.name}
        </h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Icons.edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Model Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Model Details</CardTitle>
            <CardDescription>
              Basic information about your voice model
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Description
                  </p>
                  <p>{voiceModel?.description || "No description provided."}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <Badge
                    variant={
                      voiceModel?.status === "READY"
                        ? "success"
                        : voiceModel?.status === "PROCESSING"
                        ? "warning"
                        : "destructive"
                    }
                  >
                    {voiceModel?.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Provider
                  </p>
                  <p>{voiceModel?.provider}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Created
                  </p>
                  <p>{formattedDate}</p>
                </div>
                {voiceModel?.externalId && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      External ID
                    </p>
                    <p className="font-mono text-sm">{voiceModel.externalId}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
          {isEditing && (
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Voice Samples & Recording Card */}
        <Tabs defaultValue="record">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="record">Record</TabsTrigger>
            <TabsTrigger value="samples">
              Samples ({originalSamples.length})
            </TabsTrigger>
            <TabsTrigger value="generated" disabled={!isModelReady}>
              Generated ({generatedSamples.length})
            </TabsTrigger>
          </TabsList>
          
          {/* Recording Tab */}
          <TabsContent value="record">
            <Card>
              <CardHeader>
                <CardTitle>Voice Samples</CardTitle>
                <CardDescription>
                  Record voice samples to train your AI voice model
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VoiceRecorder
                  voiceModelId={modelId}
                  onAudioUploaded={handleAudioUploaded}
                  isLoading={isLoading}
                />
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                <p>
                  For best results, record in a quiet environment with clear speech.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Original Samples Tab */}
          <TabsContent value="samples">
            <Card>
              <CardHeader>
                <CardTitle>Original Voice Samples</CardTitle>
                <CardDescription>
                  Listen to your recorded voice samples
                </CardDescription>
              </CardHeader>
              <CardContent>
                {originalSamples.length > 0 ? (
                  <div className="space-y-4">
                    {originalSamples.map((sample) => (
                      <div key={sample.id} className="border rounded-lg p-4">
                        <AudioPlayer
                          sampleId={sample.id}
                          label={`Sample: ${new Date(sample.createdAt).toLocaleString()}`}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icons.audioWaveform className="mx-auto h-12 w-12 mb-2" />
                    <p>No voice samples recorded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Generated Samples Tab */}
          <TabsContent value="generated">
            <Card>
              <CardHeader>
                <CardTitle>Generated Voice</CardTitle>
                <CardDescription>
                  Test your AI voice model by generating speech
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isModelReady ? (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="generatingText" className="text-sm font-medium">
                        Text to Generate
                      </label>
                      <div className="flex space-x-2">
                        <Textarea
                          id="generatingText"
                          placeholder="Enter text to convert to speech..."
                          value={generatingText}
                          onChange={(e) => setGeneratingText(e.target.value)}
                          rows={3}
                          disabled={isGenerating}
                        />
                        <Button
                          className="self-end"
                          onClick={handleGenerateTestAudio}
                          disabled={!generatingText.trim() || isGenerating}
                        >
                          {isGenerating ? (
                            <>
                              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            "Generate"
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {generatedSamples.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="text-md font-medium">Generated Samples</h3>
                        {generatedSamples.map((sample) => (
                          <div key={sample.id} className="border rounded-lg p-4">
                            <AudioPlayer
                              sampleId={sample.id}
                              label={sample.transcription || "Generated sample"}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <p>No generated samples yet. Generate your first sample above.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icons.alertTriangle className="mx-auto h-12 w-12 mb-2" />
                    <p>Voice model is not ready yet</p>
                    <p className="text-sm mt-2">
                      Complete the voice recording process first
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Prebuilt Voices Tab */}
          <TabsContent value="prebuilt">
            <Card>
              <CardHeader>
                <CardTitle>Prebuilt Voices</CardTitle>
                <CardDescription>
                  Choose a professional voice from ElevenLabs to use as your voice model
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>
                    Instead of training your own voice model, you can select from a wide range
                    of professional, studio-quality voices provided by ElevenLabs.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Selecting a prebuilt voice will make it immediately available for generating
                    speech without requiring any training.
                  </p>
                  
                  {/* Include the PrebuiltVoicesBrowser component */}
                  <div className="mt-4">
                    <div className="mb-4 p-4 bg-muted rounded-lg">
                      <h3 className="font-medium mb-2">Important Note</h3>
                      <p className="text-sm">
                        When you apply a prebuilt voice to your model, it will replace any existing
                        voice training. This action can't be undone, but you can always record new
                        samples and retrain your model later.
                      </p>
                    </div>
                    
                    {/* Import and use the PrebuiltVoicesBrowser component */}
                    <PrebuiltVoicesBrowser 
                      voiceModelId={modelId}
                      showApplyButton={true}
                      onVoiceApplied={(voiceId) => {
                        // Refresh the voice model data after applying a voice
                        refetchVoiceModel();
                        // Show success message
                        toast.success("Prebuilt voice applied successfully!");
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
