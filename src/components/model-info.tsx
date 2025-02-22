import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  modelManager,
  type ModelInfo as ModelInfoType,
  type ModelType,
} from "@/lib/model-manager";
import { Loader2, Download, CheckCircle2 } from "lucide-react";

interface ModelInfoProps {
  type: ModelType;
  info: ModelInfoType;
}

export function ModelInfo({ type, info }: ModelInfoProps) {
  const handleDownload = async () => {
    await modelManager.checkModel(type);
  };

  return (
    <Card className="w-full">
      <CardHeader className="p-3 md:p-4">
        {" "}
        <CardTitle className="capitalize text-sm md:text-base">
          {type} Model
        </CardTitle>{" "}
      </CardHeader>
      <CardContent className="p-3 md:p-4">
        {" "}
        <p className="text-xs md:text-sm">
          {" "}
          {info.status === "ready" && "Ready to use"}
          {info.status === "unavailable" && "Not available"}
          {info.status === "downloading" && "Downloading..."}
        </p>
        {info.status === "downloading" && info.progress && (
          <div className="flex items-center mt-1">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />{" "}
            <span className="text-xs">
              {Math.round((info.progress.loaded / info.progress.total) * 100)}%
              downloaded
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-3 md:p-4">
        {" "}
        {info.status === "unavailable" && (
          <Button onClick={handleDownload} size="sm" className="text-xs">
            {" "}
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
        )}
        {info.status === "ready" && (
          <Button variant="ghost" size="sm" className="text-xs text-green-500">
            {" "}
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Ready
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
