"use client";

import { useState, useRef, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { useAudioUrl } from "@/hooks/use-audio-url";

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
  
  // Get the signed URL if sampleId is provided
  const { signedUrl, isLoading: isUrlLoading } = useAudioUrl(sampleId || "");
  
  // Determine which URL to use (direct src or signed URL from hook)
  const audioSrc = sampleId ? signedUrl : src;
  const isLoading = sampleId ? isUrlLoading : false;
  
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    
    const setAudioData = () => {
      setDuration(audioElement.duration);
    };
    
    const setAudioTime = () => {
      setCurrentTime(audioElement.currentTime);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    };
    
    audioElement.addEventListener("loadeddata", setAudioData);
    audioElement.addEventListener("timeupdate", setAudioTime);
    audioElement.addEventListener("ended", handleEnded);
    
    return () => {
      audioElement.removeEventListener("loadeddata", setAudioData);
      audioElement.removeEventListener("timeupdate", setAudioTime);
      audioElement.removeEventListener("ended", handleEnded);
    };
  }, [onEnded, audioSrc]);
  
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
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
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 bg-muted rounded-md">
        <Icons.spinner className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!audioSrc) {
    return (
      <div className="flex items-center justify-center p-4 bg-muted rounded-md">
        <span className="text-muted-foreground">No audio available</span>
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
        src={audioSrc || ""} 
        preload="metadata"
        crossOrigin="anonymous"
        className="hidden" 
      />
    </div>
  );
} 