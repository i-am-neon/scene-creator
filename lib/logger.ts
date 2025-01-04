/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import path from "path";
import { format } from "date-fns";

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, any>;
}

class Logger {
  private static instance: Logger;
  private logFilePath: string;

  private constructor() {
    // Set log file path to project root
    this.logFilePath = path.join(process.cwd(), "log.log");

    // Ensure log directory exists
    const logDir = path.dirname(this.logFilePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private async writeToFile(entry: LogEntry): Promise<void> {
    const logLine = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${
      entry.message
    }${entry.metadata ? " " + JSON.stringify(entry.metadata) : ""}\n`;

    try {
      await fs.promises.appendFile(this.logFilePath, logLine, "utf8");
    } catch (error) {
      console.error("Failed to write to log file:", error);
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>
  ): LogEntry {
    return {
      timestamp: format(new Date(), "yyyy-MM-dd HH:mm:ss.SSS"),
      level,
      message,
      metadata,
    };
  }

  public async info(
    message: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const entry = this.createLogEntry("info", message, metadata);
    await this.writeToFile(entry);
  }

  public async warn(
    message: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const entry = this.createLogEntry("warn", message, metadata);
    await this.writeToFile(entry);
  }

  public async error(
    message: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const entry = this.createLogEntry("error", message, metadata);
    await this.writeToFile(entry);
  }

  public async debug(
    message: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    if (process.env.NODE_ENV === "development") {
      const entry = this.createLogEntry("debug", message, metadata);
      await this.writeToFile(entry);
    }
  }

  public async clearLogs(): Promise<void> {
    try {
      await fs.promises.writeFile(this.logFilePath, "", "utf8");
    } catch (error) {
      console.error("Failed to clear log file:", error);
    }
  }
}

export const logger = Logger.getInstance();
