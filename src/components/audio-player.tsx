"use client";

import { useState, useRef, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { useAudioUrl } from "@/hooks/use-audio-url";
import { RefreshCw, Info } from "lucide-react";
import { getOptimalAudioUrl } from "@/lib/s3-client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AudioPlayerProps {
  src?: string;
  sampleId?: string;
  label?: string;
  onEnded?: () => void;
}

export function AudioPlayer({ src, sampleId, label, onEnded }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<{url: string; optimized: boolean} | null>(null);
  
  // Get the signed URL if sampleId is provided
  const { signedUrl, isLoading: isUrlLoading, error: urlError } = useAudioUrl(sampleId || "");
  
  // Determine which URL to use (direct src or signed URL from hook)
  const initialAudioSrc = sampleId ? signedUrl : src;
  const [audioSrc, setAudioSrc] = useState<string | null>(initialAudioSrc || null);
  const isLoading = sampleId ? isUrlLoading : false;

  // Try to optimize the audio URL if we have a source
  useEffect(() => {
    async function optimizeUrl() {
      if (initialAudioSrc) {
        try {
          // Log the URL we're trying to optimize to help with debugging
          console.log("Attempting to optimize URL:", initialAudioSrc);
          
          // For direct playback without optimization (may help in some cases)
          setAudioSrc(initialAudioSrc);
          setDebugInfo({
            url: initialAudioSrc,
            optimized: false
          });
          
          // Try optimization in the background
          const optimizedUrl = await getOptimalAudioUrl(initialAudioSrc);
          if (optimizedUrl !== initialAudioSrc) {
            console.log("Optimized URL:", optimizedUrl);
            setAudioSrc(optimizedUrl);
            setDebugInfo({
              url: optimizedUrl,
              optimized: true
            });
          }
        } catch (error) {
          console.error("Error optimizing URL:", error);
          // Fall back to the direct URL if there's an error
          setAudioSrc(initialAudioSrc);
          setDebugInfo({
            url: initialAudioSrc || '',
            optimized: false
          });
        }
      }
    }
    
    optimizeUrl();
  }, [initialAudioSrc]);
  
  // Set up audio element with error handling
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    
    // Reset any previous errors when audio source changes
    setAudioError(null);
    
    const setAudioData = () => {
      setDuration(audioElement.duration);
      console.log("Audio loaded successfully:", audioSrc);
    };
    
    const setAudioTime = () => {
      setCurrentTime(audioElement.currentTime);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    };
    
    const handleError = (e: Event) => {
      const audioElement = audioRef.current;
      if (!audioElement) return;
      
      // Get the media error
      const error = audioElement.error;
      if (error) {
        console.error("Audio element error:", {
          code: error.code,
          message: error.message,
          src: audioElement.src
        });
        
        // Update debugging info
        setDebugInfo({
          url: audioElement.src,
          optimized: debugInfo?.optimized || false
        });
        
        // Handle specific media error codes
        let errorMessage = "Unable to play audio";
        
        switch (error.code) {
          case 1: // MEDIA_ERR_ABORTED
            errorMessage = "Audio playback was aborted";
            break;
          case 2: // MEDIA_ERR_NETWORK
            errorMessage = "A network error occurred while loading the audio";
            // Try to fetch as blob on network errors
            fetchAudioAsBlob(audioElement.src);
            break;
          case 3: // MEDIA_ERR_DECODE
            errorMessage = "Audio decoding error";
            break;
          case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
            errorMessage = "Audio format not supported";
            
            // For format errors, try direct fetch as blob with specific handling for wav files
            const url = audioElement.src;
            if (url.includes('.wav') || url.includes('audio-proxy')) {
              console.log("Format not supported, trying blob method for WAV file");
              // For WAV files or proxy URLs, try to fetch as blob
              fetchAudioAsBlob(url, true);
            }
            break;
          default:
            errorMessage = `Audio error: ${error.message}`;
        }
        
        setAudioError(errorMessage);
      }
    };
    
    audioElement.addEventListener("loadeddata", setAudioData);
    audioElement.addEventListener("timeupdate", setAudioTime);
    audioElement.addEventListener("ended", handleEnded);
    audioElement.addEventListener("error", handleError as EventListener);
    
    // If we have a source, attempt to load it
    if (audioSrc) {
      audioElement.load();
    }
    
    return () => {
      audioElement.removeEventListener("loadeddata", setAudioData);
      audioElement.removeEventListener("timeupdate", setAudioTime);
      audioElement.removeEventListener("ended", handleEnded);
      audioElement.removeEventListener("error", handleError as EventListener);
    };
  }, [audioSrc, onEnded]);
  
  // Add a blob fallback method
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const fetchAudioAsBlob = async (url: string, forceWav = false) => {
    try {
      console.log("Fetching audio as blob:", url);
      setAudioError("Attempting to fetch audio directly...");
      
      const fetchOptions: RequestInit = {
        method: 'GET',
        cache: 'no-store',
        headers: {}
      };
      
      // If we're dealing with a wav file that had format issues
      if (forceWav) {
        fetchOptions.headers = {
          'Accept': 'audio/wav,audio/wave,audio/x-wav,audio/webm,audio/mpeg,audio/*',
        };
      }
      
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Create a more specific blob based on format if needed
      let finalBlob = blob;
      if (forceWav && blob.type === 'application/octet-stream') {
        finalBlob = new Blob([await blob.arrayBuffer()], { type: 'audio/wav' });
      }
      
      // Revoke any existing blob URL to prevent memory leaks
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      
      // Create a local blob URL
      const newBlobUrl = URL.createObjectURL(finalBlob);
      setBlobUrl(newBlobUrl);
      
      console.log("Created blob URL:", newBlobUrl);
      
      // Set the audio source to the blob URL
      setAudioSrc(newBlobUrl);
      setAudioError(null);
      
      // Try playing the audio after a short delay
      setTimeout(() => {
        const audio = audioRef.current;
        if (audio) {
          audio.load();
          audio.play().catch(e => console.error("Error playing blob audio:", e));
        }
      }, 300);
      
      return newBlobUrl;
    } catch (error) {
      console.error("Error fetching audio as blob:", error);
      setAudioError(`Failed to fetch audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };

  // Modify the attemptDirectPlay function to try the blob approach if other methods fail
  const attemptDirectPlay = async () => {
    if (!audioSrc || !audioRef.current) return;
    
    try {
      console.log("Attempting direct audio playback with:", audioSrc);
      
      // If we already have a blob URL, use it directly
      if (blobUrl) {
        audioRef.current.src = blobUrl;
        audioRef.current.load();
        await audioRef.current.play();
        setIsPlaying(true);
        return;
      }
      
      try {
        // Try standard playback first
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (mainPlayError) {
        console.error("Standard playback failed:", mainPlayError);
        
        // Try blob fallback if standard playback fails
        try {
          const blobAudioUrl = await fetchAudioAsBlob(audioSrc);
          
          // Update audio element
          audioRef.current.src = blobAudioUrl as string;
          audioRef.current.load();
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (blobError) {
          console.error("Blob fallback failed:", blobError);
          setAudioError("Audio playback failed. Please try using a different browser or check CORS settings.");
        }
      }
    } catch (error) {
      console.error("All playback attempts failed:", error);
      setAudioError("Failed to play audio. The file may not be accessible.");
    }
  };

  // Modify the togglePlayPause function to use our new function
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Reset error state when attempting to play
      setAudioError(null);
      
      // Try our enhanced playback method
      attemptDirectPlay();
    }
  };
  
  const handleSliderChange = (value: number[]) => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };
  
  // Add a cleanup effect for blob URLs
  useEffect(() => {
    return () => {
      // Cleanup any blob URLs when component unmounts
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 bg-muted rounded-md">
        <Icons.spinner className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  console.log("DURATION: ", duration)
  
  if (!audioSrc || audioError || urlError) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-md">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-muted-foreground text-center">
            {audioError || urlError || "No audio available"}
          </span>
          {debugInfo && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">URL: {debugInfo.url.substring(0, 50)}...</p>
                  <p className="text-xs">Optimized: {debugInfo.optimized ? "Yes" : "No"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {(audioError || urlError) && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setAudioError(null);
                if (audioRef.current) {
                  audioRef.current.load();
                }
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-2 w-full">
      {label && <p className="text-sm font-medium">{label}</p>}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={togglePlayPause}
        >
          {isPlaying ? (
            <Icons.pause className="h-4 w-4" />
          ) : (
            <Icons.play className="h-4 w-4" />
          )}
        </Button>
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSliderChange}
          className="flex-1"
        />
        <div className="min-w-16 text-xs text-right">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
      <audio 
        ref={audioRef} 
        preload="auto"
        crossOrigin="anonymous"
        className="hidden"
      >
        {/* For WAV files */}
        {audioSrc && audioSrc.includes('.wav') && (
          <>
            <source src={audioSrc} type="audio/wav" />
            <source src={audioSrc} type="audio/wave" />
            <source src={audioSrc} type="audio/x-wav" />
          </>
        )}
        {/* Standard audio formats */}
        {audioSrc && (
          <>
            <source src={audioSrc} type="audio/mpeg" />
            <source src={audioSrc} type="audio/mp4" />
            <source src={audioSrc} type="audio/webm" />
            {/* Fallback - no type specified, let browser determine */}
            <source src={audioSrc} />
          </>
        )}
        Your browser does not support the audio element.
      </audio>
    </div>
  );
} 