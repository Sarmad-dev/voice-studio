"use client";

import { createProjectSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useCreateProject } from "@/hooks/use-project-mutations";
import { useVoiceModels } from "@/hooks/use-voice-models";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useRouter, useSearchParams } from "next/navigation";

interface ProjectFormProps {
  storyId?: string;
  onSuccess?: () => void;
}

export default function ProjectForm({ storyId, onSuccess }: ProjectFormProps) {
  const { createProject, isLoading, error } = useCreateProject();
  const { voiceModels, isLoading: isLoadingVoiceModels } = useVoiceModels();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const form = useForm<z.infer<typeof createProjectSchema>>({
    mode: "onSubmit",
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      voiceModelId: undefined,
      storyId: storyId || searchParams.get("storyId") || undefined,
    },
  });

  const onSubmit = async (data: z.infer<typeof createProjectSchema>) => {
    try {
      const result = await createProject(data);
      
      if (result.success) {
        form.reset();
        if (onSuccess) {
          onSuccess();
        }
        // Navigation is handled in the mutation hook
      }
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  const isSubmitting = form.formState.isSubmitting || isLoading;

  // Load voice models
  const readyVoiceModels = voiceModels?.filter(model => model.status === "READY");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Enter a name for your project" 
                  type="text" 
                  autoFocus={false} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Describe your project"
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="voiceModelId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Voice Model (Optional)</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a voice model" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingVoiceModels ? (
                    <SelectItem value="loading" disabled>
                      Loading voice models...
                    </SelectItem>
                  ) : readyVoiceModels?.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No ready voice models available
                    </SelectItem>
                  ) : (
                    readyVoiceModels?.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {storyId && (
          <FormField
            name="storyId"
            control={form.control}
            render={({ field }) => (
              <FormItem className="hidden">
                <FormControl>
                  <Input {...field} type="hidden" />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end space-x-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                Creating... <Loader2 className="h-4 w-4 animate-spin" />
              </span>
            ) : (
              "Create Project"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
} 