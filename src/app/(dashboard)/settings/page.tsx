"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { S3CorsDebugger } from "@/components/admin/s3-cors-debugger";

// Mock user data for demonstration
const mockUserData = {
  profile: {
    name: "Demo User",
    email: "demo@example.com",
    image: null,
  },
  subscription: {
    plan: "FREE",
    minutesUsed: 45,
    minutesTotal: 60,
    nextBillingDate: "N/A",
  },
  apiKeys: {
    elevenLabsApiKey: "el_•••••••••••••••",
    openAiApiKey: "sk-••••••••••••••••••",
  },
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account");

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="developer">Developer Tools</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account details and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Account settings content will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Settings</CardTitle>
              <CardDescription>Manage your subscription and payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Billing settings content will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Notification settings content will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Advanced configuration options</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Advanced settings content will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="developer">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Developer Tools</CardTitle>
                <CardDescription>Advanced tools for debugging and configuration</CardDescription>
              </CardHeader>
            </Card>
            
            <S3CorsDebugger />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 