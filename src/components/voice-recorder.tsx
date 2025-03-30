"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Icons } from "@/components/icons";
import { AudioPlayer } from "@/components/audio-player";
import { cloneVoiceWithElevenlabs, uploadAudioToS3 } from "@/actions/voice-sample.action";

interface VoiceRecorderProps {
  voiceModelId: string;
  onAudioUploaded?: () => void;
  isLoading?: boolean;
}

export default function VoiceRecorder({
  voiceModelId,
  onAudioUploaded,
  isLoading = false,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<Blob | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [visualizerValues, setVisualizerValues] = useState<number[]>(
    Array(20).fill(3)
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Cleanup function for audio resources
  const cleanupAudioResources = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (audioContextRef.current?.state !== "closed") {
      audioContextRef.current?.close();
      audioContextRef.current = null;
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupAudioResources();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Start recording function
  const startRecording = async () => {
    try {
      // Reset state
      setIsRecording(true);
      setRecordingComplete(false);
      setRecordingTime(0);
      setAudioURL(null);
      setAudioData(null);
      audioChunksRef.current = [];

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Initialize AudioContext for visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);

      // Configure analyser for visualization
      analyserRef.current.fftSize = 64;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Create media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
        audioChunksRef.current.push(event.data);
      });

      mediaRecorderRef.current.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setAudioData(audioBlob);
        setRecordingComplete(true);
        stream.getTracks().forEach((track) => track.stop());
        cleanupAudioResources();
      });

      // Start recording
      mediaRecorderRef.current.start();

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Start visualization
      const updateVisualizer = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);
        const values = Array.from(dataArray)
          .slice(0, 20)
          .map((v) => Math.max(3, Math.floor((v / 255) * 50)));
        setVisualizerValues(values);
        animationRef.current = requestAnimationFrame(updateVisualizer);
      };

      updateVisualizer();
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsRecording(false);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  // Stop recording function
  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Handle submitting the recording
  const handleSubmitRecording = async () => {
    if (!audioData) {
      toast.error("No recording available to submit");
      return;
    }

    try {
      setSubmitting(true);

      // Convert blob to base64 string for server action
      const arrayBuffer = await audioData.arrayBuffer();
      const base64Audio = Buffer.from(arrayBuffer).toString('base64');

      // Upload to S3
      const uploadResult = await uploadAudioToS3({
        voiceModelId,
        audioBase64: base64Audio,
        contentType: audioData.type,
      });

      if (!uploadResult.success || !uploadResult.data) {
        toast.error(uploadResult.error?.message || "Failed to upload audio");
        return;
      }

      // Clone voice with Elevenlabs
      // Also pass the audio data directly to avoid S3 fetching issues
      const cloneResult = await cloneVoiceWithElevenlabs({
        voiceModelId,
        voiceSampleId: uploadResult.data.id,
        audioBase64: base64Audio, // Pass the audio directly
      });

      if (!cloneResult.success) {
        toast.error(cloneResult.error?.message || "Failed to clone voice");
        return;
      }

      toast.success("Voice model created successfully!");
      
      // Reset state
      setRecordingComplete(false);
      setAudioURL(null);
      setAudioData(null);
      
      // Trigger callback if provided
      if (onAudioUploaded) {
        onAudioUploaded();
      }
    } catch (error) {
      console.error("Error submitting recording:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Cancel recording
  const cancelRecording = () => {
    setRecordingComplete(false);
    setAudioURL(null);
    setAudioData(null);
  };

  return (
    <div className="space-y-4">
      {!recordingComplete ? (
        <>
          <div className="flex justify-center mb-4">
            <div className="h-16 flex items-end space-x-1">
              {visualizerValues.map((value, i) => (
                <div
                  key={i}
                  className={`w-2 bg-primary rounded-full transition-all duration-75 ${
                    isRecording ? "opacity-100" : "opacity-50"
                  }`}
                  style={{ height: `${value}px` }}
                ></div>
              ))}
            </div>
          </div>

          <div className="flex justify-center items-center space-x-4">
            <Button
              variant={isRecording ? "destructive" : "default"}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading || submitting}
              className="rounded-full h-14 w-14 p-0"
            >
              {isRecording ? (
                <Icons.square className="h-6 w-6" />
              ) : (
                <Icons.mic className="h-6 w-6" />
              )}
            </Button>
            {isRecording && (
              <div className="text-sm font-mono">
                {formatTime(recordingTime)}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <p className="text-sm font-medium">Preview your recording</p>
          
          {audioURL && <AudioPlayer src={audioURL} />}
          
          <div className="flex justify-center space-x-2">
            <Button 
              variant="outline" 
              onClick={cancelRecording}
              disabled={submitting}
            >
              Record Again
            </Button>
            <Button 
              onClick={handleSubmitRecording}
              disabled={submitting || isLoading}
            >
              {submitting ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Finalize & Create Voice"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 