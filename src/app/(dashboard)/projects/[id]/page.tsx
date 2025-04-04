"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { useProject } from "@/hooks/use-project";
import { useDeleteProject } from "@/hooks/use-project-mutations";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTime } from "@/lib/utils";
import { AudioPlayer } from "@/components/audio-player";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CreateAudioClip } from "@/components/projects/create-audio-clip";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { project, isLoading, error, refetch } = useProject(projectId);
  const { deleteProject } = useDeleteProject();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProject({ projectId });
      router.push("/projects");
    } catch (error) {
      console.error("Failed to delete project:", error);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="p-8 text-center rounded-lg border bg-card">
        <Icons.alertCircle className="mx-auto h-10 w-10 text-destructive mb-4" />
        <h3 className="text-lg font-medium mb-2">Error loading project</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <div className="flex items-center justify-center gap-4">
          <Button onClick={() => router.push("/projects")}>
            <Icons.arrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
          <Button onClick={() => window.location.reload()}>
            <Icons.refresh className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center rounded-lg border bg-card">
        <Icons.alertCircle className="mx-auto h-10 w-10 text-destructive mb-4" />
        <h3 className="text-lg font-medium mb-2">Project not found</h3>
        <p className="text-sm text-muted-foreground mb-4">
          The project you are looking for does not exist or has been deleted
        </p>
        <Link href="/projects">
          <Button>
            <Icons.arrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  const statusColors = {
    DRAFT: "bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300",
    PROCESSING:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300",
    COMPLETED:
      "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300",
    ERROR: "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300",
  };

  // Extract the voice model name safely
  const voiceModelName = project.voiceModel
    ? typeof project.voiceModel === "string"
      ? project.voiceModel
      : project.voiceModel.name
    : "None selected";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <Button variant="outline" size="icon">
              <Icons.arrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          <Badge
            className={
              statusColors[project.status as keyof typeof statusColors] ||
              statusColors.DRAFT
            }
          >
            {project.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {project.status === "COMPLETED" && (
            <Button variant="outline">
              <Icons.download className="mr-2 h-4 w-4" />
              Download Audio
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Icons.trash className="mr-2 h-4 w-4" />
                Delete Project
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  project and all associated audio clips.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Project"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audio-clips">Audio Clips</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                View and manage project information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Project Name</h3>
                  <p className="text-sm text-muted-foreground">
                    {project.name}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Voice Model</h3>
                  <p className="text-sm text-muted-foreground">
                    {voiceModelName}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Total Duration</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(project.duration || 0)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Last Updated</h3>
                  <p className="text-sm text-muted-foreground">
                    {project.updatedAt
                      ? new Date(project.updatedAt).toLocaleDateString()
                      : "Not available"}
                  </p>
                </div>
                <div className="col-span-2">
                  <h3 className="text-sm font-medium">Description</h3>
                  <p className="text-sm text-muted-foreground">
                    {project.description || "No description"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {project.status === "COMPLETED" && (
            <Card>
              <CardHeader>
                <CardTitle>Final Audio</CardTitle>
                <CardDescription>Full audio of your project</CardDescription>
              </CardHeader>
              <CardContent>
                {project.exportUrl ? (
                  <AudioPlayer src={project.exportUrl} />
                ) : (
                  <div className="p-4 text-center border rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      No audio generated yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="audio-clips" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Audio Clips</CardTitle>
                <CardDescription>
                  Individual audio clips in this project
                </CardDescription>
              </div>
              <CreateAudioClip
                projectId={projectId}
                voiceModel={project.voiceModelId || undefined}
                onClipCreated={() => refetch()}
              />
            </CardHeader>
            <CardContent>
              {project.audioClips && project.audioClips.length > 0 ? (
                <div className="space-y-4">
                  {project.audioClips.map((clip, index) => (
                    <div
                      key={clip.id || index}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">
                          {clip.name || `Clip ${index + 1}`}
                        </h3>
                        <Badge variant="outline">
                          {formatTime(clip.duration || 0)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {clip.text}
                      </p>
                      {clip.fileUrl ? (
                        <AudioPlayer src={clip.fileUrl} />
                      ) : (
                        <div className="p-4 text-center border rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground">
                            Processing audio...
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center rounded-lg border">
                  <Icons.music className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No audio clips</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    This project doesn't have any audio clips yet
                  </p>
                  <CreateAudioClip
                    projectId={projectId}
                    voiceModel={project.voiceModelId || undefined}
                    onClipCreated={() => refetch()}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProjectDetailSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}
