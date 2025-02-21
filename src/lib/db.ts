import { openDB } from "idb";
import type { ChatMessage } from "@/types/api";

const DB_NAME = "chat-store";
const DB_VERSION = 1;

class DatabaseService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db: Promise<any > | null;

  constructor () {
    this.db = this.initDB();
  }

  private async initDB() {
    if (typeof window === "undefined") return null;

    return openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore("messages", { keyPath: "id" });
        store.createIndex("by-date", "timestamp");
      }
    })
  }

  async getAllMessages(): Promise<ChatMessage[]> {
    if (!this.db) this.db = this.initDB();
    if (!this.db) return [];
    
    try {
      const db = await this.db;
      const messages = await db.getAll("messages");
      return messages.sort((a: ChatMessage, b: ChatMessage) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error("Failed to get all messages:", error);
      return [];
    }
  }

  async saveMessages(message: ChatMessage): Promise<void> {

    if (!this.db) this.db = this.initDB();
    if (!this.db) return;

    try {
      const db = await this.db;
      await db.put("messages", message)
    } catch (error) {
      console.error("Failed to save message:", error);
      throw error;
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