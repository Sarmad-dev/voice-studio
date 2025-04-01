"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

export function S3CorsDebugger() {
  const [corsConfig, setCorsConfig] = useState<any>(null);
  const [corsError, setCorsError] = useState<string | null>(null);
  const [corsConfigured, setCorsConfigured] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [testUrl, setTestUrl] = useState("");
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const checkCorsConfig = async () => {
    setIsLoading(true);
    setCorsError(null);
    setCorsConfig(null);
    setCorsConfigured(null);
    
    try {
      const response = await fetch("/api/check-s3-cors");
      const data = await response.json();
      
      setCorsConfig(data);
      setCorsConfigured(data.success);
    } catch (error: any) {
      setCorsError(error.message || "Failed to check CORS configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const configureCors = async () => {
    setIsConfiguring(true);
    setCorsError(null);
    
    try {
      const response = await fetch("/api/setup-s3-cors", {
        method: "POST",
      });
      const data = await response.json();
      
      if (data.success) {
        setCorsConfigured(true);
        // Refresh the CORS configuration
        await checkCorsConfig();
      } else {
        setCorsError(data.error || "Failed to configure CORS");
      }
    } catch (error: any) {
      setCorsError(error.message || "Failed to configure CORS");
    } finally {
      setIsConfiguring(false);
    }
  };

  const testAudioUrl = async () => {
    if (!testUrl) return;
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const response = await fetch(`/api/debug-audio-url?url=${encodeURIComponent(testUrl)}`);
      const data = await response.json();
      
      setTestResult(data);
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message || "Failed to test audio URL",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>S3 CORS Configuration</CardTitle>
          <CardDescription>
            Check and configure CORS for your S3 bucket to enable audio playback
          </CardDescription>
        </CardHeader>
        <CardContent>
          {corsConfigured === true && (
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 mb-4">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle>CORS is properly configured</AlertTitle>
              <AlertDescription>
                Your S3 bucket has CORS configured, which should allow audio playback in the browser.
              </AlertDescription>
            </Alert>
          )}
          
          {corsConfigured === false && (
            <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 mb-4">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertTitle>CORS is not configured</AlertTitle>
              <AlertDescription>
                Your S3 bucket does not have CORS configured, which may prevent audio playback in the browser.
              </AlertDescription>
            </Alert>
          )}
          
          {corsError && (
            <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 mb-4">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertTitle>Error checking CORS</AlertTitle>
              <AlertDescription>{corsError}</AlertDescription>
            </Alert>
          )}
          
          {corsConfig && (
            <div className="mt-4 p-4 bg-muted rounded-md overflow-auto max-h-60">
              <pre className="text-xs">{JSON.stringify(corsConfig, null, 2)}</pre>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between gap-2">
          <Button onClick={checkCorsConfig} disabled={isLoading}>
            {isLoading ? "Checking..." : "Check CORS Configuration"}
          </Button>
          <Button onClick={configureCors} disabled={isConfiguring || corsConfigured === true}>
            {isConfiguring ? "Setting up..." : "Configure CORS for Audio"}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Test Audio URL</CardTitle>
          <CardDescription>
            Test if an audio URL is accessible from the browser
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter an S3 audio URL to test"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
              />
              <Button onClick={testAudioUrl} disabled={isTesting || !testUrl}>
                {isTesting ? "Testing..." : "Test URL"}
              </Button>
            </div>
            
            {testResult && (
              <div className="mt-4 p-4 bg-muted rounded-md overflow-auto max-h-60">
                <pre className="text-xs">{JSON.stringify(testResult, null, 2)}</pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 