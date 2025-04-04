import { Icons } from "@/components/icons";
import Link from "next/link";

interface CreateAudioClipProps {
  projectId: string;
  voiceModel?: string;
  onClipCreated?: () => void;
}

export function CreateAudioClip({
  projectId,
  voiceModel,
}: CreateAudioClipProps) {
  return (
    <Link
      className="px-5 py-1.5 flex items-center justify-center bg-primary hover:bg-primary/80 text-primary-foreground rounded-md"
      href={`/editor?projectId=${projectId}${
        voiceModel ? `&voiceModelId=${voiceModel}` : ""
      }`}
    >
      <Icons.plus className="mr-2 h-4 w-4" />
      Add Audio Clip
    </Link>
  );
}
