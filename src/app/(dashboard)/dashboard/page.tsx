import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Link from "next/link";
import Modal from "@/components/modal";
import CreateVoiceModelForm from "@/components/forms/create-voice-form";
import VoiceModels from "@/components/voice-models/voice-models";

// Mock data for demonstration
const mockData = {
  stats: {
    voiceModels: 3,
    audioProjects: 8,
    generatedStories: 12,
    minutesUsed: 45,
    totalMinutes: 60, // Based on FREE plan
  },
  recentProjects: [
    {
      id: "1",
      name: "Sci-fi Adventure",
      status: "COMPLETED",
      updatedAt: "2023-04-01",
    },
    {
      id: "2",
      name: "Meditation Guide",
      status: "DRAFT",
      updatedAt: "2023-03-28",
    },
    {
      id: "3",
      name: "Product Demo",
      status: "PROCESSING",
      updatedAt: "2023-03-25",
    },
  ],
  recentVoiceModels: [
    {
      id: "1",
      name: "My Voice",
      status: "READY",
      createdAt: "2023-03-20",
    },
    {
      id: "2",
      name: "Narrator",
      status: "READY",
      createdAt: "2023-03-15",
    },
  ],
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Icons.plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
          <Modal
            trigger={
              <Button size="sm" className="cursor-pointer">
                <Icons.plus className="mr-2 h-4 w-4" />
                New Voice Model
              </Button>
            }
            title="Create a voice model"
            description="Create your own voice model to use in any project and stories"
          >
            <CreateVoiceModelForm />
          </Modal>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-2">
            <Icons.mic className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Voice Models</h3>
          </div>
          <p className="mt-2 text-3xl font-bold">
            {mockData.stats.voiceModels}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-2">
            <Icons.music className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Audio Projects</h3>
          </div>
          <p className="mt-2 text-3xl font-bold">
            {mockData.stats.audioProjects}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-2">
            <Icons.creditCard className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Generated Stories</h3>
          </div>
          <p className="mt-2 text-3xl font-bold">
            {mockData.stats.generatedStories}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Icons.creditCard className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Minutes Used</h3>
            </div>
            <p className="mt-2 text-3xl font-bold">
              {mockData.stats.minutesUsed}/{mockData.stats.totalMinutes}
            </p>
            <div className="mt-2 h-2 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${
                    (mockData.stats.minutesUsed / mockData.stats.totalMinutes) *
                    100
                  }%`,
                }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Free Plan</p>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          <Link
            href="/projects"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="rounded-lg border">
          <div className="grid divide-y">
            {mockData.recentProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4"
              >
                <div>
                  <h3 className="font-medium">{project.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Updated {project.updatedAt}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`rounded-full px-2 py-1 text-xs ${
                      project.status === "COMPLETED"
                        ? "bg-green-100 text-green-700"
                        : project.status === "PROCESSING"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {project.status}
                  </div>
                  <Link href={`/projects/${project.id}`}>
                    <Button size="sm" variant="ghost">
                      <Icons.chevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Voice Models */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Voice Models</h2>
          <Link
            href="/voice-models"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="rounded-lg border">
          <div className="grid divide-y">
            <VoiceModels />
          </div>
        </div>
      </div>
    </div>
  );
}
