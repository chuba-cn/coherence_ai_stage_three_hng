/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "sonner";

export type ModelType = "translator" | "summarizer" | "languageDetector";
export type ModelStatus = "unavailable" | "downloading" | "ready";

interface ModelProgress {
  loaded: number;
  total: number;
}

export interface ModelInfo {
  status: ModelStatus;
  progress?: ModelProgress;
}

type ModelEventCallback = (info: ModelInfo) => void;

class ModelManager {
  private models: Map<ModelType, ModelInfo> = new Map();
  private listeners: Map<ModelType, Set<ModelEventCallback>> = new Map();

  constructor() {
    this.initializeModels();
  }

  async initializeModels() {
    if (typeof window === "undefined") return;

    await this.checkModel("summarizer");
    await this.checkModel("translator");
    await this.checkModel("languageDetector");
  }

  private async notifyListeners(type: ModelType, info: ModelInfo) {
    this.models.set(type, info);
    this.listeners.get(type)?.forEach((callback) => callback(info));
  }

  subscribe(type: ModelType, callback: ModelEventCallback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);

    const currentInfo = this.models.get(type);
    if (currentInfo) {
      callback(currentInfo);
    }

    return () => {
      this.listeners.get(type)?.delete(callback);
    };
  }

  async checkModel(type: ModelType): Promise<ModelInfo> {
    if (typeof window === "undefined") {
      return { status: "unavailable" };
    }

    if (!("ai" in window)) {
      const info = { status: "unavailable" as const };
      this.notifyListeners(type, info);
      return info;
    }

    try {
      let capabilities;

      switch (type) {
        case "summarizer":
          capabilities = await (window as any).ai.summarizer.capabilities();
          console.log("capabilities summarizer:", capabilities);
          break;
        case "translator":
          capabilities = await (window as any).ai.translator.capabilities();
          console.log("capabilities translator:", capabilities);
          break;
        case "languageDetector":
          capabilities = await (
            window as any
          ).ai.languageDetector.capabilities();
          console.log("capabilities detector:", capabilities);
          break;
      }

      if (capabilities.available === "no") {
        const info = { status: "unavailable" as const };
        this.notifyListeners(type, info);
        return info;
      }

      if (capabilities.available === "readily") {
        const info = { status: "ready" as const };
        this.notifyListeners(type, info);
        return info;
      }

      // Download the model
      return this.downloadModel(type);
    } catch (error) {
      console.error(`Failed to check ${type} model:`, error);
      const info = { status: "unavailable" as const };
      this.notifyListeners(type, info);
      return info;
    }
  }

  private async downloadModel(type: ModelType): Promise<ModelInfo> {
    this.notifyListeners(type, { status: "downloading" });

    try {
      let model;

      switch (type) {
        case "summarizer":
          model = await (window as any).ai.summarizer.create({
            monitor: this.createMonitor(type),
          });
          break;
        case "translator":
          model = await (window as any).ai.translator.create({
            sourceLanguage: "en",
            targetLanguage: "es",
            monitor: this.createMonitor(type),
          });
          break;
        case "languageDetector":
          model = await (window as any).ai.languageDetector.create({
            monitor: this.createMonitor(type),
          });
          break;
      }

      await model.ready;
      const info = { status: "ready" as const };
      this.notifyListeners(type, info);
      return info;
    } catch (error) {
      console.error(`Failed to download ${type} model:`, error);
      toast.error(`Failed to download ${type} model. Please try again.`);
      const info = { status: "unavailable" as const };
      this.notifyListeners(type, info);
      return info;
    }
  }

  private createMonitor(type: ModelType) {
    return (monitor: any) => {
      monitor.addEventListener(
        "downloadprogress",
        (event: { loaded: number; total: number }) => {
          this.notifyListeners(type, {
            status: "downloading",
            progress: {
              loaded: event.loaded,
              total: event.total,
            },
          });
        }
      );
    };
  }

  getModelInfo(type: ModelType): ModelInfo | undefined {
    return this.models.get(type);
  }

  async ensureModelReady(type: ModelType): Promise<boolean> {
    const info = await this.checkModel(type);
    return info.status === "ready";
  }
}

export const modelManager = new ModelManager();
