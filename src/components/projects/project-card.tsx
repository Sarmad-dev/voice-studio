"use client";

import { AudioProject } from "@prisma/client";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatTime } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { useState } from "react";
import { useDeleteProject } from "@/hooks/use-project-mutations";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProjectWithRelations extends AudioProject {
  voiceModel: { name: string } | null;
  story: { title: string } | null;
}

interface ProjectCardProps {
  project: ProjectWithRelations;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deleteProject, isLoading: isDeleting } = useDeleteProject();

  // Format the creation date
  const formattedDate = new Date(project.updatedAt).toLocaleDateString();
  
  // Format the duration
  const duration = project.duration 
    ? formatTime(project.duration)
    : "-";

  const handleDelete = async () => {
    await deleteProject({ projectId: project.id });
    setShowDeleteDialog(false);
  };

  const statusVariant = 
    project.status === "COMPLETED" ? "success" :
    project.status === "PROCESSING" ? "warning" : "default";

  return (
    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
      <td className="p-4 align-middle">
        <div>
          <div className="font-medium">{project.name}</div>
          <div className="text-xs text-muted-foreground line-clamp-1">
            {project.description || "No description"}
          </div>
        </div>
      </td>
      <td className="p-4 align-middle">
        {project.voiceModel ? project.voiceModel.name : "Not selected"}
      </td>
      <td className="p-4 align-middle">{duration}</td>
      <td className="p-4 align-middle">
        <Badge variant={statusVariant}>
          {project.status}
        </Badge>
      </td>
      <td className="p-4 align-middle">{formattedDate}</td>
      <td className="p-4 align-middle">
        <div className="flex items-center gap-2">
          <Link href={`/projects/${project.id}`}>
            <Button variant="outline" size="sm">
              <Icons.edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
          </Link>
          {project.status === "COMPLETED" && project.exportUrl && (
            <a 
              href={project.exportUrl} 
              download 
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                <Icons.download className="h-4 w-4" />
                <span className="sr-only">Download</span>
              </Button>
            </a>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            disabled={isDeleting}
            onClick={() => setShowDeleteDialog(true)}
          >
            <Icons.trash className="h-4 w-4 text-destructive" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </td>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project "{project.name}" and all associated audio files.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </tr>
  );
} 