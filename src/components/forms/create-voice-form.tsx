"use client";
import { createVoiceModelSchema } from "@/lib/forms-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
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
import { DialogClose, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useCreateVoiceModel } from "@/hooks/use-create-voice-model";

type Props = {};

const CreateVoiceModelForm = (props: Props) => {
  const { createVoiceModel, isLoading, error } = useCreateVoiceModel();
  
  const form = useForm<z.infer<typeof createVoiceModelSchema>>({
    mode: "onSubmit",
    resolver: zodResolver(createVoiceModelSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof createVoiceModelSchema>) => {
    try {
      const result = await createVoiceModel(data);
      
      if (result.success) {
        form.reset();
        // No need for toast here as it's handled in the hook
      }
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  const isSubmitting = form.formState.isSubmitting || isLoading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name of Voice Model</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Voice Model Name" type="text" autoFocus={false} />
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
              <FormLabel>Describe your model</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Describe the characteristics of your voice model"
                  className="min-h-[200px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className="flex items-center gap-5">
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              Close
            </Button>
          </DialogClose>
          <Button size="lg" disabled={isSubmitting} className="min-w-[170px]" type="submit">
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                Submitting... <Loader2 className="animate-spin" />
              </span>
            ) : (
              "Submit"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default CreateVoiceModelForm;
