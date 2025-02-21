import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  modelManager,
  type ModelInfo,
  type ModelType,
} from "@/lib/model-manager";
import { Loader2, Download, CheckCircle2 } from "lucide-react";

interface ModelInfoProps {
  type: ModelType;
  info: ModelInfo;
}

export function ModelInfo({ type, info }: ModelInfoProps) {
  const handleDownload = async () => {
    await modelManager.checkModel(type);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="capitalize">{type} Model</CardTitle>
        <CardDescription>
          {info.status === "ready" && "Ready to use"}
          {info.status === "unavailable" && "Not available"}
          {info.status === "downloading" && "Downloading..."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {info.status === "downloading" && info.progress && (
          <div className="flex items-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span>
              {Math.round((info.progress.loaded / info.progress.total) * 100)}%
              downloaded
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {info.status === "unavailable" && (
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download Model
          </Button>
        )}
        {info.status === "ready" && (
          <Button variant="ghost" className="text-green-500">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Model Ready
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
