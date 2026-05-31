export interface DownloadOption {
  label: string;
  onClick: () => void | Promise<void>;
}

export interface DownloadGroup {
  label: string;
  options: DownloadOption[];
}
