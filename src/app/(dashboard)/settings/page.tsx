import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

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
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Profile Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Profile</h2>
          <p className="text-sm text-muted-foreground">
            Manage your personal information.
          </p>
        </div>
        <div className="rounded-lg border p-6">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
            <div className="flex flex-1 flex-col gap-2">
              <label className="text-sm font-medium">Name</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={mockUserData.profile.name}
                  readOnly
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <label className="text-sm font-medium">Email</label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={mockUserData.profile.email}
                  readOnly
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button>
              <Icons.edit className="mr-2 h-4 w-4" />
              Update Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Subscription Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Subscription</h2>
          <p className="text-sm text-muted-foreground">
            Manage your subscription plan and usage.
          </p>
        </div>
        <div className="rounded-lg border p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Current Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    {mockUserData.subscription.plan} Plan
                  </p>
                </div>
                <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {mockUserData.subscription.plan}
                </div>
              </div>
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Usage</span>
                  <span>
                    {mockUserData.subscription.minutesUsed}/
                    {mockUserData.subscription.minutesTotal} minutes
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${(mockUserData.subscription.minutesUsed / mockUserData.subscription.minutesTotal) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button size="lg">
                <Icons.creditCard className="mr-2 h-4 w-4" />
                Upgrade to Premium
              </Button>
              <Link
                href="/settings/subscription"
                className="text-center text-xs text-muted-foreground hover:underline"
              >
                View all plans
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* API Keys Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">API Keys</h2>
          <p className="text-sm text-muted-foreground">
            Manage your external API integrations.
          </p>
        </div>
        <div className="rounded-lg border">
          <div className="p-6">
            <h3 className="font-medium">ElevenLabs API Key</h3>
            <p className="text-sm text-muted-foreground">
              Required for voice cloning and text-to-speech functionality.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <input
                type="password"
                value={mockUserData.apiKeys.elevenLabsApiKey}
                readOnly
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button variant="outline">
                <Icons.edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
            </div>
          </div>
          <div className="border-t p-6">
            <h3 className="font-medium">OpenAI API Key</h3>
            <p className="text-sm text-muted-foreground">
              Required for story generation functionality.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <input
                type="password"
                value={mockUserData.apiKeys.openAiApiKey}
                readOnly
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button variant="outline">
                <Icons.edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Appearance</h2>
          <p className="text-sm text-muted-foreground">
            Customize the look and feel of the application.
          </p>
        </div>
        <div className="rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Theme</h3>
              <p className="text-sm text-muted-foreground">
                Toggle between light and dark mode.
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-destructive">Danger Zone</h2>
          <p className="text-sm text-muted-foreground">
            Permanent actions that cannot be undone.
          </p>
        </div>
        <div className="rounded-lg border border-destructive/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Delete Account</h3>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </div>
      </div>
    </div>
  );
} 