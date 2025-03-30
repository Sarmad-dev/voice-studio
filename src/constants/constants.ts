import { Icons } from "@/components/icons";
import { FileText } from "lucide-react";

export const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Icons.home,
    },
    {
      title: "Voice Models",
      href: "/voice-models",
      icon: Icons.mic,
    },
    {
      title: "Prebuilt Voices",
      href: "/prebuilt-voices",
      icon: Icons.audioWaveform,
    },
    {
      title: "Stories",
      href: "/stories",
      icon: FileText,
    },
    {
      title: "Projects",
      href: "/projects",
      icon: Icons.music,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Icons.settings,
    },
  ];