/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ChatMessage } from "@/types/api";

class DatabaseService {
  private db: Promise<any> | null = null;

  private async initDB() {
    if (typeof window === "undefined") return null;

    const { openDB } = await import("idb");
    return openDB("chat-store", 2, {
      // CHANGE: Increased version number
      upgrade(db, oldVersion, _newVersion, transaction) {
        if (!db.objectStoreNames.contains("messages")) {
          const store = db.createObjectStore("messages", { keyPath: "id" });
          store.createIndex("by-date", "timestamp");
        }

        // CHANGE: Add new index for originalMessageId
        if (oldVersion < 2) {
          const store = transaction.objectStore("messages");
          if (!store.indexNames.contains("by-original-message")) {
            store.createIndex("by-original-message", "originalMessageId");
          }
        }
      },
    });
  }

  async getAllMessages(): Promise<ChatMessage[]> {
    if (!this.db) this.db = this.initDB();
    if (!this.db) return [];

    try {
      const db = await this.db;
      const messages = await db.getAll("messages");
      return messages.sort((a:ChatMessage, b:ChatMessage) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error("Failed to get messages:", error);
      return [];
    }
  }

  async saveMessage(message: ChatMessage): Promise<void> {
    if (!this.db) this.db = this.initDB();
    if (!this.db) return;

    try {
      const db = await this.db;
      await db.put("messages", message);
    } catch (error) {
      console.error("Failed to save message:", error);
      throw error;
    }
  }

  async getRelatedMessages(originalMessageId: string): Promise<ChatMessage[]> {
    if (!this.db) this.db = this.initDB();
    if (!this.db) return [];

    try {
      const db = await this.db;
      const index = db
        .transaction("messages")
        .store.index("by-original-message");
      return await index.getAll(originalMessageId);
    } catch (error) {
      console.error("Failed to get related messages:", error);
      return [];
    }
  }

  async clearMessages(): Promise<void> {
    if (!this.db) this.db = this.initDB();
    if (!this.db) return;

    try {
      const db = await this.db;
      await db.clear("messages");
    } catch (error) {
      console.error("Failed to clear messages:", error);
      throw error;
    }
  }
}

export const dbService = new DatabaseService();
