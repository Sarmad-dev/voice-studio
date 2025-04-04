"use client";

import React from "react";
import ProjectForm from "@/components/projects/project-form";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewProjectPage() {
  return (
    <div className="container max-w-3xl mx-auto py-8">
      <div className="flex items-center mb-8">
        <Link href="/projects" className="mr-4">
          <Button variant="ghost" size="sm">
            <Icons.arrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Create New Project</h1>
      </div>
      
      <div className="bg-card rounded-lg border p-6 shadow-sm">
        <ProjectForm />
      </div>
    </div>
  );
} 