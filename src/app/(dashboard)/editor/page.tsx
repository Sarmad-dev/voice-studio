"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { TipTapEditor } from "@/components/editor/tiptap-editor";
import { VoiceSelector } from "@/components/editor/voice-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AudioPlayer } from "@/components/audio-player";
import { Icons } from "@/components/icons";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { useTextEnhancement } from "@/hooks/use-text-enhancement";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wand2, AlertCircle, ScrollText, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ArrowLeft } from "lucide-react";
import { EnhancementTypeDialog } from "@/components/editor/enhancement-type-dialog";
import { EnhancementType } from "@/actions/enhance-text.action";
import { createAudioClip } from "@/actions/project.action";
import Link from "next/link";
import { AudioClip } from "@prisma/client";

export default function EditorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialVoiceId = searchParams.get("voiceId");
  const projectId = searchParams.get("projectId");
  const voiceModelId = searchParams.get("voiceModelId");
  
  const [editorContent, setEditorContent] = useState<string>("<p>Start typing your content here...</p>");
  const [plainText, setPlainText] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [selectedContent, setSelectedContent] = useState<"original" | "enhanced">("original");
  const [activeSpeechTab, setActiveSpeechTab] = useState<"text" | "audio">("text");
  const [isAddingToProject, setIsAddingToProject] = useState<boolean>(false);
  const [generatedSpeech, setGeneratedSpeech] = useState<AudioClip | null>(null)
  
  const [selectedVoice, setSelectedVoice] = useState<{
    id: string;
    name: string;
    type: "prebuilt" | "custom";
  } | null>(initialVoiceId ? { id: initialVoiceId, name: "", type: "prebuilt" } : null);
  
  const { enhanceText, enhancedContent, isEnhancing, clearEnhancedContent } = useTextEnhancement();
  const { generateAudio, generatedAudio, isGenerating, clearGeneratedAudio } = useTextToSpeech();
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState<boolean>(true);

  // Set initial voice from voiceModelId if provided
  useEffect(() => {
    if (voiceModelId && !initialVoiceId) {
      setSelectedVoice({
        id: voiceModelId,
        name: "", // This will be populated when voice data is fetched
        type: "custom"
      });
    }
  }, [voiceModelId, initialVoiceId]);

  // Extract plain text from HTML content
  useEffect(() => {
    if (editorContent) {
      const div = document.createElement("div");
      div.innerHTML = editorContent;
      const text = div.textContent || "";
      setPlainText(text);
    }
  }, [editorContent]);

  // Clear enhanced content when editor content changes
  useEffect(() => {
    clearEnhancedContent();
  }, [editorContent, clearEnhancedContent]);

  // Check if OpenAI API key is configured
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const response = await fetch('/api/check-openai-key');
        const data = await response.json();
        setIsApiKeyConfigured(data.configured);
      } catch (error) {
        console.error('Failed to check API key:', error);
        setIsApiKeyConfigured(false);
      }
    };
    
    checkApiKey();
  }, []);

  // Handle voice selection
  const handleVoiceSelected = (voice: { id: string; name: string; type: "prebuilt" | "custom" }) => {
    setSelectedVoice(voice);
    
    // Update URL query params to reflect selected voice
    const params = new URLSearchParams(searchParams.toString());
    params.set("voiceId", voice.id);
    
    // Preserve projectId in URL if it exists
    if (projectId) {
      params.set("projectId", projectId);
    }
    
    router.push(`/editor?${params.toString()}`);
  };

  // Handle enhance text with AI
  const handleEnhanceText = async (enhancementType: EnhancementType) => {
    if (!plainText) {
      toast.error("Please enter some text before enhancing");
      return;
    }

    try {
      await enhanceText(plainText, enhancementType);
    } catch (error) {
      console.error('Error enhancing text:', error);
    }
  };

  // Handle generate speech
  const handleGenerateSpeech = async () => {
    const textToUse = selectedContent === "original" ? plainText : enhancedContent?.enhanced || plainText;
    
    if (!textToUse) {
      toast.error("Please enter some text before generating speech");
      return;
    }

    if (!selectedVoice) {
      toast.error("Please select a voice before generating speech");
      return;
    }

    try {
      const audioClip = await generateAudio({
        text: textToUse,
        title: title || "Untitled",
        voiceId: selectedVoice.id,
      });

      setGeneratedSpeech(audioClip?.data as AudioClip)
      setActiveSpeechTab("audio");
    } catch (error) {
      console.error('Error generating speech:', error);
    }
  };

  // Add the audio to project
  const addToProject = async () => {
    if (!projectId || !generatedAudio) {
      toast.error("Project ID or generated audio not available");
      return;
    }

    setIsAddingToProject(true);
    try {
      // Create audio clip in the project
      await createAudioClip({
        speechId: generatedSpeech?.id as string,
        projectId,
        name: title || "Generated Audio",
        text: selectedContent === "original" ? plainText : enhancedContent?.enhanced || plainText,
        type: "tts",
        fileUrl: generatedAudio.fileUrl,
        startTime: 0,
        duration: generatedAudio.duration || 0,
        volume: 1,
        modelId: selectedVoice?.id || "default",
      });
      
      toast.success("Audio added to project successfully");
      
      // Navigate back to the project
      router.push(`/projects/${projectId}`);
    } catch (error) {
      console.error('Error adding audio to project:', error);
      toast.error("Failed to add audio to project");
    } finally {
      setIsAddingToProject(false);
    }
  };

  // Handle content change from editor
  const handleEditorChange = (content: string) => {
    setEditorContent(content);
    
    // Clear enhanced content when editor content changes
    if (enhancedContent) {
      clearEnhancedContent();
    }
  };

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      {projectId && (
        <div className="mb-4 flex items-center">
          <Link href={`/projects/${projectId}`} className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Project
          </Link>
          {projectId && <div className="ml-4 text-sm bg-muted px-2 py-1 rounded-md">Adding audio to project</div>}
        </div>
      )}
      
      {isApiKeyConfigured === false && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>OpenAI API Key Not Configured</AlertTitle>
          <AlertDescription>
            The OpenAI API key is not properly configured. AI enhancement features will not work. Please add your API key to the environment variables.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col gap-4 md:flex-row">
        {/* Main content */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Text-to-Speech Editor</h1>
            {selectedVoice && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Using voice:</span>
                <span className="font-medium">{selectedVoice.name || selectedVoice.id}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter a title for your content"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="editor">Content</Label>
              <TipTapEditor 
                onChange={handleEditorChange}
                initialContent={editorContent || undefined}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <EnhancementTypeDialog 
                onEnhance={handleEnhanceText}
                isEnhancing={isEnhancing}
                disabled={!plainText}
              />
              
              <Button 
                onClick={handleGenerateSpeech}
                disabled={isGenerating || !plainText || !selectedVoice}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Speech"
                )}
              </Button>
            </div>
            
            <Tabs 
              defaultValue="text" 
              value={activeSpeechTab}
              onValueChange={(value) => setActiveSpeechTab(value as "text" | "audio")}
              className="pt-4"
            >
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="text">
                  <ScrollText className="h-4 w-4 mr-2" />
                  Text Content
                </TabsTrigger>
                <TabsTrigger value="audio" disabled={!generatedAudio}>
                  <Icons.audioWaveform className="h-4 w-4 mr-2" />
                  Generated Audio
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="text" className="space-y-4 pt-2">
                {enhancedContent && (
                  <div className="space-y-4">
                    <div className="bg-muted/40 p-4 rounded-md border">
                      <RadioGroup 
                        value={selectedContent} 
                        onValueChange={(value) => setSelectedContent(value as "original" | "enhanced")}
                        className="flex flex-col space-y-3"
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="original" id="original" />
                          <Label htmlFor="original" className="font-medium">Use Original Text</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="enhanced" id="enhanced" />
                          <Label htmlFor="enhanced" className="font-medium">Use AI Enhanced Text</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-medium">
                          {selectedContent === "original" ? "Original Text" : "AI Enhanced Text"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea 
                          readOnly
                          value={selectedContent === "original" ? plainText : enhancedContent.enhanced}
                          className="min-h-32 resize-none"
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {(!enhancedContent && plainText) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">Text Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea 
                        readOnly
                        value={plainText}
                        className="min-h-32 resize-none"
                      />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="audio">
                {generatedAudio && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">Generated Audio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AudioPlayer 
                        src={generatedAudio.fileUrl}
                        label={generatedAudio.name} 
                      />
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="text-xs text-muted-foreground">
                        Duration: {Math.round(generatedAudio.duration)}s | Created: {new Date(generatedAudio.createdAt).toLocaleString()}
                      </div>
                      
                      {projectId && (
                        <Button 
                          onClick={addToProject}
                          disabled={isAddingToProject}
                          variant="default"
                        >
                          {isAddingToProject ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <Icons.plus className="mr-2 h-4 w-4" />
                              Add to Project
                            </>
                          )}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="w-full md:w-80 shrink-0">
          <VoiceSelector 
            selectedVoiceId={selectedVoice?.id}
            onVoiceSelected={handleVoiceSelected}
          />
        </div>
      </div>
    </div>
  );
} 