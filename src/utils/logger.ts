import { existsSync, mkdirSync } from 'fs';
import { writeFile, appendFile } from 'fs/promises';
import { dirname } from 'path';

export class Logger {
  private verbose: boolean;
  private logFilePath?: string;
  
  constructor(verbose: boolean = false, logFilePath?: string) {
    this.verbose = verbose;
    this.logFilePath = logFilePath;
    
    if (logFilePath) {
      // Ensure directory exists
      const dir = dirname(logFilePath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    }
  }
  
  info(message: string): void {
    const formattedMessage = `[INFO] ${this.getTimestamp()} ${message}`;
    console.log(formattedMessage);
    this.writeToFile(formattedMessage);
  }
  
  error(message: string): void {
    const formattedMessage = `[ERROR] ${this.getTimestamp()} ${message}`;
    console.error(formattedMessage);
    this.writeToFile(formattedMessage);
  }
  
  debug(message: string): void {
    if (this.verbose) {
      const formattedMessage = `[DEBUG] ${this.getTimestamp()} ${message}`;
      console.debug(formattedMessage);
      this.writeToFile(formattedMessage);
    }
  }
  
  warn(message: string): void {
    const formattedMessage = `[WARN] ${this.getTimestamp()} ${message}`;
    console.warn(formattedMessage);
    this.writeToFile(formattedMessage);
  }
  
  private getTimestamp(): string {
    return new Date().toISOString();
  }
  
  private async writeToFile(message: string): Promise<void> {
    if (this.logFilePath) {
      try {
        await appendFile(this.logFilePath, `${message}\n`);
      } catch (error) {
        console.error(`Failed to write to log file: ${error}`);
      }
    }
  }
}