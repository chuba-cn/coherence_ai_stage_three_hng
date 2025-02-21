import { ModelInfo, ModelType } from "@/lib/model-manager";

interface ModelDownloadProgressProps {
  type: ModelType;
  info: ModelInfo
}

export default function ModelDownloadProgress({ type, info }: ModelDownloadProgressProps) {
  if(info.status !== "downloading" || !info.progress) return null;

  const progress = (info.progress.loaded / info.progress.total) * 100;
  const formattedSize = (info.progress.total / 1024 / 1024).toFixed(2);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="capitalize">{ type } Model</span>
        <span>{progress.toFixed(0)}</span>
      </div>
      <progress value={ progress } className="h-2" />
      <p className="text-xs text-muted-foreground">Downloading {formattedSize}MB...</p>
    </div>
  )
}