"use server";

import { ActionResponse } from "@/actions/voiceModel.action";
import { protectedAction } from "@/lib/server/trpc";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createProjectSchema } from "@/lib/validation";

// Get all projects for the current user
export const getUserProjects = protectedAction
  .meta({ span: "getUserProjects" })
  .input(z.object({}))
  .query(async ({ ctx }) => {
    try {
      const projects = await prisma.audioProject.findMany({
        where: {
          userId: ctx.user.id,
        },
        include: {
          voiceModel: true,
          story: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      return {
        success: true,
        data: projects,
      };
    } catch (error) {
      console.error("Error fetching user projects:", error);
      return {
        success: false,
        error: {
          message: "Failed to fetch projects",
        },
      };
    }
  });

// Get a project by ID
export const getProjectById = protectedAction
  .meta({ span: "getProjectById" })
  .input(
    z.object({
      projectId: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    try {
      const project = await prisma.audioProject.findUnique({
        where: {
          id: input.projectId,
          userId: ctx.user.id,
        },
        include: {
          voiceModel: true,
          story: true,
          audioClips: true,
        },
      });

      if (!project) {
        return {
          success: false,
          error: {
            message: "Project not found",
          },
        };
      }

      return {
        success: true,
        data: project,
      };
    } catch (error) {
      console.error("Error fetching project:", error);
      return {
        success: false,
        error: {
          message: "Failed to fetch project",
        },
      };
    }
  });

// Create a new project
export const createProject = protectedAction
  .meta({ span: "createProject" })
  .input(createProjectSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      const project = await prisma.audioProject.create({
        data: {
          name: input.name,
          description: input.description,
          userId: ctx.user.id,
          voiceModelId: input.voiceModelId || null,
          storyId: input.storyId || null,
          status: "DRAFT",
        },
      });

      revalidatePath("/projects");

      return {
        success: true,
        data: project,
      };
    } catch (error) {
      console.error("Error creating project:", error);
      return {
        success: false,
        error: {
          message: "Failed to create project",
        },
      };
    }
  });

// Update a project
export const updateProject = protectedAction
  .meta({ span: "updateProject" })
  .input(
    z.object({
      projectId: z.string(),
      name: z
        .string()
        .min(3, "Project name must be at least 3 characters")
        .optional(),
      description: z.string().optional(),
      voiceModelId: z.string().optional(),
      status: z.string().optional(),
      exportUrl: z.string().optional(),
      duration: z.number().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      // First check if the project exists and belongs to the user
      const existingProject = await prisma.audioProject.findUnique({
        where: {
          id: input.projectId,
          userId: ctx.user.id,
        },
      });

      if (!existingProject) {
        return {
          success: false,
          error: {
            message:
              "Project not found or you don't have permission to update it",
          },
        };
      }

      // Update the project
      const project = await prisma.audioProject.update({
        where: {
          id: input.projectId,
        },
        data: {
          name: input.name,
          description: input.description,
          voiceModelId: input.voiceModelId,
          status: input.status,
          exportUrl: input.exportUrl,
          duration: input.duration,
        },
      });

      revalidatePath(`/projects/${input.projectId}`);
      revalidatePath("/projects");

      return {
        success: true,
        data: project,
      };
    } catch (error) {
      console.error("Error updating project:", error);
      return {
        success: false,
        error: {
          message: "Failed to update project",
        },
      };
    }
  });

// Delete a project
export const deleteProject = protectedAction
  .meta({ span: "deleteProject" })
  .input(
    z.object({
      projectId: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      // First check if the project exists and belongs to the user
      const existingProject = await prisma.audioProject.findUnique({
        where: {
          id: input.projectId,
          userId: ctx.user.id,
        },
      });

      if (!existingProject) {
        return {
          success: false,
          error: {
            message:
              "Project not found or you don't have permission to delete it",
          },
        };
      }

      // Delete the project
      await prisma.audioProject.delete({
        where: {
          id: input.projectId,
        },
      });

      revalidatePath("/projects");

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error deleting project:", error);
      return {
        success: false,
        error: {
          message: "Failed to delete project",
        },
      };
    }
  });

// Create a new audio clip for a project
export const createAudioClip = protectedAction
  .meta({ span: "createAudioClip" })
  .input(
    z.object({
      speechId: z.string(),
      projectId: z.string(),
      name: z.string(),
      type: z.string(),
      fileUrl: z.string(),
      startTime: z.number(),
      duration: z.number(),
      text: z.string().optional(),
      volume: z.number().optional(),
      pitch: z.number().optional(),
      speed: z.number().optional(),
      emotionTone: z.string().optional(),
      modelId: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      // First check if the project exists and belongs to the user
      const existingProject = await prisma.audioProject.findUnique({
        where: {
          id: input.projectId,
          userId: ctx.user.id,
        },
      });

      if (!existingProject) {
        return {
          success: false,
          error: {
            message:
              "Project not found or you don't have permission to add clips",
          },
        };
      }

      // Create the audio clip
      const audioClip = await prisma.audioClip.update({
        where: {
          id: input.speechId,
        },
        data: {
          name: input.name,
          type: input.type,
          fileUrl: input.fileUrl,
          startTime: input.startTime,
          duration: input.duration,
          text: input.text,
          volume: input.volume || 1.0,
          pitch: input.pitch,
          speed: input.speed || 1.0,
          emotionTone: input.emotionTone,
          projectId: input.projectId,
          modelId: input.modelId || "default",
        },
      });

      revalidatePath(`/projects/${input.projectId}`);

      return {
        success: true,
        data: audioClip,
      };
    } catch (error) {
      console.error("Error creating audio clip:", error);
      return {
        success: false,
        error: {
          message: "Failed to create audio clip",
        },
      };
    }
  });

// Create a project from a story
export const createProjectFromStory = protectedAction
  .meta({ span: "createProjectFromStory" })
  .input(
    z.object({
      storyId: z.string(),
      voiceModelId: z.string().optional(),
      name: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      // Get the story
      const story = await prisma.story.findUnique({
        where: {
          id: input.storyId,
          userId: ctx.user.id,
        },
      });

      if (!story) {
        return {
          success: false,
          error: {
            message:
              "Story not found or you don't have permission to access it",
          },
        };
      }

      // Create a new project from the story
      const project = await prisma.audioProject.create({
        data: {
          name: input.name || `Project from ${story.title}`,
          description: `Project created from the story "${story.title}"`,
          userId: ctx.user.id,
          storyId: story.id,
          voiceModelId: input.voiceModelId || null,
          status: "DRAFT",
        },
      });

      revalidatePath("/projects");

      return {
        success: true,
        data: project,
      };
    } catch (error) {
      console.error("Error creating project from story:", error);
      return {
        success: false,
        error: {
          message: "Failed to create project from story",
        },
      };
    }
  });
