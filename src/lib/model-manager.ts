/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-explicit-any */

import { toast } from "sonner";

export type ModelType = "summarizer" | "translator" | "detector";
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

  async initializeModels() {
    if (typeof window === "undefined") return;

    await this.checkModel("summarizer");
    await this.checkModel("translator");
    await this.checkModel("detector");
  }

  private notify(type: ModelType, info: ModelInfo) {
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
      this.notify(type, info);
      return info;
    }

    try {
      let capabilities;
      switch (type) {
        case "summarizer":
          capabilities = await (window as any).ai.summarizer.capabilities();
          break;
        case "translator":
          capabilities = await (window as any).ai.translator.capabilities();
          break;
        case "detector":
          capabilities = await (
            window as any
          ).ai.languageDetector.capabilities();
          break;
      }

      if (capabilities.available === "no") {
        const info = { status: "unavailable" as const };
        this.notify(type, info);
        return info;
      }

      if (capabilities.available === "readily") {
        const info = { status: "ready" as const };
        this.notify(type, info);
        return info;
      }

      // Need to download
      return this.downloadModel(type);
    } catch (error) {
      console.error(`Failed to check ${type} model:`, error);
      const info = { status: "unavailable" as const };
      this.notify(type, info);
      return info;
    }
  }

  private async downloadModel(type: ModelType): Promise<ModelInfo> {
    this.notify(type, { status: "downloading" });

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
        case "detector":
          model = await (window as any).ai.languageDetector.create({
            monitor: this.createMonitor(type),
          });
          break;
      }

      await model.ready;
      const info = { status: "ready" as const };
      this.notify(type, info);
      return info;
    } catch (error) {
      console.error(`Failed to download ${type} model:`, error);
      toast.error(`Failed to download ${type} model. Please try again.`);
      const info = { status: "unavailable" as const };
      this.notify(type, info);
      return info;
    }
  }

  private createMonitor(type: ModelType) {
    return (m: any) => {
      m.addEventListener(
        "downloadprogress",
        (e: { loaded: number; total: number }) => {
          this.notify(type, {
            status: "downloading",
            progress: {
              loaded: e.loaded,
              total: e.total,
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


