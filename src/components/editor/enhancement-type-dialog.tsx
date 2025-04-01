"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { EnhancementType } from "@/actions/enhance-text.action";

interface EnhancementTypeDialogProps {
  onEnhance: (enhancementType: EnhancementType) => Promise<void>;
  isEnhancing: boolean;
  disabled?: boolean;
}

export function EnhancementTypeDialog({ 
  onEnhance, 
  isEnhancing, 
  disabled = false 
}: EnhancementTypeDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<EnhancementType>("both");

  const handleEnhance = async () => {
    await onEnhance(selectedType);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          disabled={disabled || isEnhancing}
          variant="outline"
          className="w-full"
        >
          {isEnhancing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enhancing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Enhance with AI
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>AI Text Enhancement</DialogTitle>
          <DialogDescription>
            Choose how you want to enhance your text with AI
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup 
            value={selectedType} 
            onValueChange={(value) => setSelectedType(value as EnhancementType)} 
            className="space-y-4"
          >
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="grammar" id="grammar" className="mt-1" />
              <div>
                <Label htmlFor="grammar" className="font-medium">Grammar & Spelling</Label>
                <p className="text-sm text-muted-foreground">
                  Fix grammar, spelling, and punctuation errors without changing style or tone.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="paraphrase" id="paraphrase" className="mt-1" />
              <div>
                <Label htmlFor="paraphrase" className="font-medium">Paraphrase</Label>
                <p className="text-sm text-muted-foreground">
                  Rewrite content to improve clarity and engagement while preserving meaning.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="both" id="both" className="mt-1" />
              <div>
                <Label htmlFor="both" className="font-medium">Complete Enhancement</Label>
                <p className="text-sm text-muted-foreground">
                  Both fix errors and improve writing quality for best results.
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleEnhance}
            disabled={isEnhancing}
          >
            {isEnhancing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enhancing...
              </>
            ) : (
              'Enhance Text'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 