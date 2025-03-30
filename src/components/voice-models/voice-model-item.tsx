import { VoiceModel } from "@prisma/client";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { Icons } from "../icons";

type Props = {
  model: VoiceModel;
};

const VoiceModelItem = ({ model }: Props) => {
  return (
    <div key={model.id} className="flex items-center justify-between p-4">
      <div>
        <h3 className="font-medium">{model.name}</h3>
        <p className="text-sm text-muted-foreground">
          Created {model.createdAt.toDateString()}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div
          className={`rounded-full px-2 py-1 text-xs ${
            model.status === "READY"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {model.status}
        </div>
        <Link href={`/voice-models/${model.id}`}>
          <Button size="sm" variant="ghost">
            <Icons.chevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default VoiceModelItem;
