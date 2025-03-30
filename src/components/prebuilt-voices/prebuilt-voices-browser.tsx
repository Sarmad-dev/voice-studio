"use client";

import { useState, useEffect } from "react";
import { usePrebuiltVoices } from "@/hooks/use-prebuilt-voices";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AudioPlayer } from "@/components/audio-player";
import { Icons } from "@/components/icons";

interface PrebuiltVoicesBrowserProps {
  voiceModelId?: string;
  showApplyButton?: boolean;
  onVoiceApplied?: (voiceId: string) => void;
}

export function PrebuiltVoicesBrowser({
  voiceModelId,
  showApplyButton = true,
  onVoiceApplied,
}: PrebuiltVoicesBrowserProps) {
  const {
    voices,
    isLoading,
    error,
    selectedVoice,
    setSelectedVoice,
    generatedSamples,
    generateSample,
    isGeneratingSample,
    applyVoice,
    isApplyingVoice,
    filterVoices,
  } = usePrebuiltVoices();

  const [searchQuery, setSearchQuery] = useState("");
  const [gender, setGender] = useState<string>("");
  const [accent, setAccent] = useState<string>("");
  const [currentTab, setCurrentTab] = useState("browse");
  const [sampleText, setSampleText] = useState(
    "Hello, I'm a prebuilt voice from ElevenLabs."
  );

  // Filtered voices
  const filteredVoices = filterVoices({
    gender: gender || undefined,
    accent: accent || undefined,
    searchQuery: searchQuery || undefined,
  });

  // Get unique filter options
  const genderOptions = [
    ...new Set(voices?.map((voice) => voice.gender)),
  ].filter(Boolean);
  const accentOptions = [
    ...new Set(voices?.map((voice) => voice.accent)),
  ].filter(Boolean);

  // Handle voice selection
  const handleSelectVoice = (voice: any) => {
    setSelectedVoice(voice);
    setCurrentTab("preview");
  };

  // Generate a sample with the currently selected voice
  const handleGenerateSample = () => {
    if (!selectedVoice) return;

    generateSample({
      voiceId: selectedVoice.id,
      text: sampleText,
      voiceModelId: voiceModelId, // Optional - only if we want to save it to a model
    });
  };

  // Apply the selected voice to the model
  const handleApplyVoice = () => {
    if (!selectedVoice || !voiceModelId) return;

    applyVoice({
      voiceId: selectedVoice.id,
      voiceModelId: voiceModelId,
    });

    if (onVoiceApplied) {
      onVoiceApplied(selectedVoice.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-destructive/10 text-destructive">
        <p>Error loading prebuilt voices: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="browse">Browse Voices</TabsTrigger>
          <TabsTrigger value="preview" disabled={!selectedVoice}>
            Preview Voice
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Icons.search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search voices..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>All Genders</SelectLabel>
                    {genderOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select value={accent} onValueChange={setAccent}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Accent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>All Accents</SelectLabel>
                    {accentOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredVoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icons.audioWaveform className="mx-auto h-12 w-12 mb-2" />
              <p>No voices found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVoices.map((voice) => (
                <Card key={voice.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{voice.name}</CardTitle>
                      {voice.gender && (
                        <Badge variant="outline">
                          {voice.gender.charAt(0).toUpperCase() +
                            voice.gender.slice(1)}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {voice.description || "No description available"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-0">
                    <div className="space-y-1 text-sm">
                      {voice.accent && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Accent:</span>
                          <span>{voice.accent}</span>
                        </div>
                      )}
                      {voice.age && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Age:</span>
                          <span>{voice.age}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4">
                    <div className="w-full space-y-2">
                      {voice.previewUrl && (
                        <AudioPlayer src={voice.previewUrl} label="Preview" />
                      )}
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => handleSelectVoice(voice)}
                      >
                        Select Voice
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {selectedVoice && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{selectedVoice.name}</CardTitle>
                    <CardDescription>
                      {selectedVoice.description}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentTab("browse")}
                  >
                    Browse Other Voices
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {selectedVoice.gender && (
                    <Badge variant="outline">
                      Gender: {selectedVoice.gender}
                    </Badge>
                  )}
                  {selectedVoice.accent && (
                    <Badge variant="outline">
                      Accent: {selectedVoice.accent}
                    </Badge>
                  )}
                  {selectedVoice.age && (
                    <Badge variant="outline">Age: {selectedVoice.age}</Badge>
                  )}
                </div>

                <Separator />

                {/* Original preview */}
                <div>
                  <Label>Original Preview</Label>
                  {selectedVoice.previewUrl ? (
                    <AudioPlayer src={selectedVoice.previewUrl} />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No preview available
                    </p>
                  )}
                </div>

                <Separator />

                {/* Generate custom sample */}
                <div className="space-y-2">
                  <Label htmlFor="sampleText">Generate Custom Sample</Label>
                  <Textarea
                    id="sampleText"
                    placeholder="Enter text to convert to speech..."
                    value={sampleText}
                    onChange={(e) => setSampleText(e.target.value)}
                    rows={3}
                    disabled={isGeneratingSample}
                  />
                  <Button
                    onClick={handleGenerateSample}
                    disabled={!sampleText.trim() || isGeneratingSample}
                  >
                    {isGeneratingSample ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Sample"
                    )}
                  </Button>
                </div>

                {/* Display generated samples */}
                {Object.values(generatedSamples).length > 0 && (
                  <div className="space-y-2">
                    <Label>Generated Samples</Label>
                    <div className="space-y-4">
                      {Object.values(generatedSamples).map((sample) => (
                        <div key={sample.id} className="border rounded-lg p-4">
                          <AudioPlayer
                            src={sample.fileUrl}
                            label={sample.transcription || "Generated sample"}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>

              {voiceModelId && showApplyButton && (
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={handleApplyVoice}
                    disabled={isApplyingVoice}
                  >
                    {isApplyingVoice ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Applying voice to model...
                      </>
                    ) : (
                      "Apply Voice to My Model"
                    )}
                  </Button>
                </CardFooter>
              )}
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
