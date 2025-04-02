"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import CreateVoiceModelForm from "@/components/forms/create-voice-form";

interface CreateVoiceModelDialogProps {
  trigger?: React.ReactNode;
}

export default function CreateVoiceModelDialog({
  trigger,
}: CreateVoiceModelDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Icons.plus className="mr-2 h-4 w-4" />
            New Voice Model
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New Voice Model</DialogTitle>
          <DialogDescription>
            Create a new voice model that you can train with your voice samples.
          </DialogDescription>
        </DialogHeader>
        <CreateVoiceModelForm />
      </DialogContent>
    </Dialog>
  );
} 