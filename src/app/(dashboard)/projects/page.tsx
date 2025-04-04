"use client";

import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { useProjects } from "@/hooks/use-projects";
import ProjectCard from "@/components/projects/project-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Audio Projects</h1>
        <Link href="/projects/new">
          <Button>
            <Icons.plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <Suspense fallback={<ProjectTableSkeleton />}>
        <ProjectsTable />
      </Suspense>

      {/* Create New Project Card */}
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Icons.music className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-4 font-medium">Create New Audio Project</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a voice model and create a new audio project from scratch or use an existing story
        </p>
        <div className="mt-6 flex gap-4">
          <Link href="/projects/new">
            <Button>
              <Icons.plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </Link>
          <Link href="/stories">
            <Button variant="outline">
              <Icons.fileText className="mr-2 h-4 w-4" />
              From Story
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProjectsTable() {
  const { projects, isLoading, error } = useProjects();

  if (isLoading) {
    return <ProjectTableSkeleton />;
  }

  if (error) {
    return (
      <div className="p-8 text-center rounded-lg border bg-card">
        <Icons.alertCircle className="mx-auto h-10 w-10 text-destructive mb-4" />
        <h3 className="text-lg font-medium mb-2">Error loading projects</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          <Icons.refresh className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="p-8 text-center rounded-lg border bg-card">
        <Icons.music className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No projects yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Create your first audio project to get started
        </p>
        <Link href="/projects/new">
          <Button>
            <Icons.plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Name
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Voice Model
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Duration
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Status
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Last Updated
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProjectTableSkeleton() {
  return (
    <div className="rounded-md border">
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Name
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Voice Model
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Duration
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Status
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Last Updated
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <td className="p-4 align-middle">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </td>
                <td className="p-4 align-middle">
                  <Skeleton className="h-5 w-24" />
                </td>
                <td className="p-4 align-middle">
                  <Skeleton className="h-5 w-12" />
                </td>
                <td className="p-4 align-middle">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </td>
                <td className="p-4 align-middle">
                  <Skeleton className="h-5 w-20" />
                </td>
                <td className="p-4 align-middle">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 