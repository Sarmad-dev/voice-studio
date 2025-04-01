"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePrebuiltVoices } from "@/hooks/use-prebuilt-voices";
import { useVoiceModels } from "@/hooks/use-voice-models";
import { AudioPlayer } from "@/components/audio-player";
import { Icons } from "@/components/icons";
import { PrebuiltVoice } from "@/lib/elevenlabs";
import { VoiceModel } from "@prisma/client";

interface VoiceSelectorProps {
  selectedVoiceId?: string;
  onVoiceSelected: (voice: { id: string; name: string; type: "prebuilt" | "custom" }) => void;
}

export function VoiceSelector({ selectedVoiceId, onVoiceSelected }: VoiceSelectorProps) {
  const { voices: prebuiltVoices, isLoading: prebuiltLoading, filterVoices } = usePrebuiltVoices();
  const { voiceModels, isLoading: modelsLoading } = useVoiceModels();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("prebuilt");
  
  // Filter prebuilt voices based on search query
  const filteredPrebuiltVoices = filterVoices({
    searchQuery: searchQuery || undefined,
  });
  
  // Filter user's voice models based on search query
  const filteredVoiceModels = (voiceModels || []).filter(model => 
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (model.description && model.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Set initial selected voice based on URL param
  useEffect(() => {
    if (selectedVoiceId && !modelsLoading && !prebuiltLoading) {
      // Check in prebuilt voices
      const prebuiltVoice = (prebuiltVoices as PrebuiltVoice[])?.find(v => v.id === selectedVoiceId);
      if (prebuiltVoice) {
        setActiveTab("prebuilt");
        return;
      }
      
      // Check in user's voice models
      const userVoice = (voiceModels || []).find(v => v.id === selectedVoiceId);
      if (userVoice) {
        setActiveTab("custom");
        return;
      }
    }
  }, [selectedVoiceId, prebuiltVoices, voiceModels, prebuiltLoading, modelsLoading]);

  // Handle selecting a prebuilt voice
  const handleSelectPrebuiltVoice = (voice: PrebuiltVoice) => {
    onVoiceSelected({ 
      id: voice.id, 
      name: voice.name,
      type: "prebuilt" 
    });
  };
  
  // Handle selecting a custom voice model
  const handleSelectCustomVoice = (model: VoiceModel) => {
    if (model.externalId) {
      onVoiceSelected({ 
        id: model.externalId, 
        name: model.name,
        type: "custom" 
      });
    }
  };

  if (prebuiltLoading || modelsLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Select Voice</CardTitle>
        <div className="relative mt-2">
          <Icons.search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search voices..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="prebuilt">Prebuilt</TabsTrigger>
            <TabsTrigger value="custom">My Voices</TabsTrigger>
          </TabsList>

          <TabsContent value="prebuilt" className="px-4 py-2 max-h-[70vh] overflow-y-auto">
            {filteredPrebuiltVoices.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <p>No prebuilt voices found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPrebuiltVoices.map((voice: PrebuiltVoice) => (
                  <div 
                    key={voice.id} 
                    className={`p-3 border rounded-md hover:bg-accent/10 transition-colors cursor-pointer ${
                      selectedVoiceId === voice.id ? "border-primary bg-accent/20" : ""
                    }`}
                    onClick={() => handleSelectPrebuiltVoice(voice)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{voice.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {voice.description || "No description"}
                        </p>
                      </div>
                      {voice.gender && (
                        <Badge variant="outline" className="text-xs">
                          {voice.gender}
                        </Badge>
                      )}
                    </div>
                    {voice.previewUrl && (
                      <AudioPlayer src={voice.previewUrl} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="custom" className="px-4 py-2 max-h-[70vh] overflow-y-auto">
            {filteredVoiceModels.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <p>No custom voice models found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredVoiceModels.map((model) => (
                  <div 
                    key={model.id} 
                    className={`p-3 border rounded-md hover:bg-accent/10 transition-colors ${
                      model.externalId ? "cursor-pointer" : "opacity-50 cursor-not-allowed"
                    } ${
                      selectedVoiceId === model.externalId ? "border-primary bg-accent/20" : ""
                    }`}
                    onClick={() => model.externalId && handleSelectCustomVoice(model)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{model.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {model.description || "No description"}
                        </p>
                      </div>
                      <Badge variant={model.status === "READY" ? "success" : "warning"} className="text-xs">
                        {model.status}
                      </Badge>
                    </div>
                    {!model.externalId && (
                      <p className="text-xs text-muted-foreground mt-2">
                        This voice model is not ready for text-to-speech
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 