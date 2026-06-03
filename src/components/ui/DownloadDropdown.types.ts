import type { LucideIcon } from "lucide-react";

export interface DownloadOption {
  label: string;
  icon?: LucideIcon;
  onClick: () => void | Promise<void>;
}

export interface DownloadGroup {
  label: string;
  options: DownloadOption[];
}
