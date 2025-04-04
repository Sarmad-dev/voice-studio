"use client";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { useCreateProjectFromStory } from "@/hooks/use-project-mutations";
import { useVoiceModels } from "@/hooks/use-voice-models";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

interface ButtonProps {
  buttonLabel?: string;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost";
  buttonSize?: "default" | "sm" | "lg";
  fullWidth?: boolean;
}

interface CreateProjectFromStoryProps {
  storyId: string;
  storyTitle: string;
  buttonProps: ButtonProps
}

const projectFromStorySchema = z.object({
  storyId: z.string(),
  voiceModelId: z.string().optional(),
  name: z.string().min(3, "Project name must be at least 3 characters"),
});

export default function CreateProjectFromStory({
  storyId,
  storyTitle,
  buttonProps: { buttonLabel, buttonVariant, buttonSize, fullWidth }
}: CreateProjectFromStoryProps) {
  const [open, setOpen] = useState(false);
  const { createProjectFromStory, isLoading } = useCreateProjectFromStory();
  const { voiceModels, isLoading: isLoadingVoiceModels } = useVoiceModels();

  const form = useForm<z.infer<typeof projectFromStorySchema>>({
    resolver: zodResolver(projectFromStorySchema),
    defaultValues: {
      storyId,
      name: `Project from ${storyTitle}`,
      voiceModelId: undefined,
    },
  });

  const onSubmit = async (data: z.infer<typeof projectFromStorySchema>) => {
    try {
      await createProjectFromStory(data);
      setOpen(false);
      form.reset({
        storyId,
        name: `Project from ${storyTitle}`,
        voiceModelId: undefined,
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  // Get ready voice models
  const readyVoiceModels = voiceModels?.filter(
    (model) => model.status === "READY"
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={buttonVariant}
          size={buttonSize}
          className={fullWidth ? "w-full" : ""}
        >
          <Icons.music className="mr-2 h-4 w-4" />
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Audio Project</DialogTitle>
          <DialogDescription>
            Convert "{storyTitle}" into an audio project. Optionally select a
            voice model to use.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input {...field} autoFocus={false} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="voiceModelId"
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

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || form.formState.isSubmitting}
              >
                {isLoading || form.formState.isSubmitting ? (
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
      </DialogContent>
    </Dialog>
  );
}
