import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  AudioWaveform,
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CreditCard,
  Download,
  Edit,
  FileText,
  Home,
  Loader2,
  LogOut,
  LucideProps,
  Menu,
  Mic,
  Moon,
  Music,
  Pause,
  Play,
  Plus,
  PlusCircle,
  RotateCw,
  Save,
  Search,
  Settings,
  Sparkles,
  Square,
  SunMedium,
  Trash,
  Trophy,
  UploadCloud,
  User,
  X,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export const Icons = {
  logo: (props: LucideProps) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M10.447 3.04168C11.7351 2.00001 13.5857 2.00001 15.3552 2.00001C17.6847 2.00001 20.0142 3.87335 20.0142 7.55335C20.0142 11.2333 15.9552 17.7333 14.7361 18.9867C14.1361 19.6 13.1361 19.6 12.5361 18.9867C11.3169 17.7333 8.0979 13.84 7.25789 10.1467"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8.67799 3.05996C6.41799 3.98663 5.28799 5.99996 5.28799 8.53329C5.28799 9.37329 5.70799 10.5333 6.20799 11.3333"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M14.0544 7.00001C13.5145 6.90667 12.2945 6.90667 11.7545 7.00001"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  google: FcGoogle,
  spinner: Loader2,
  sun: SunMedium,
  moon: Moon,
  check: Check,
  close: X,
  sparkle: Sparkles,
  edit: Edit,
  trophy: Trophy,
  mic: Mic,
  bell: Bell,
  logout: LogOut,
  settings: Settings,
  user: User,
  add: PlusCircle,
  plus: Plus,
  chevronsLeft: ChevronsLeft,
  chevronsRight: ChevronsRight,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  home: Home,
  square: Square,
  trash: Trash,
  upload: UploadCloud,
  download: Download,
  play: Play,
  pause: Pause,
  stop: Square,
  save: Save,
  creditCard: CreditCard,
  file: FileText,
  music: Music,
  arrowLeft: ArrowLeft,
  menu: Menu,
  search: Search,
  audioWaveform: AudioWaveform,
  alertTriangle: AlertTriangle,
  refresh: RotateCw,
  alertCircle: AlertCircle
}; 