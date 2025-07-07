import { config } from '../config';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;

  private constructor() {
    this.logLevel = config.server.environment === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, data?: any) {
    if (level <= this.logLevel) {
      const timestamp = new Date().toISOString();
      const levelName = LogLevel[level];
      
      const logEntry = {
        timestamp,
        level: levelName,
        message,
        ...(data && { data })
      };

      // In production, you might want to use a proper logging service
      console.log(JSON.stringify(logEntry, null, 2));
    }
  }

  error(message: string, error?: Error | any) {
    this.log(LogLevel.ERROR, message, error);
  }

  warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data);
  }

  info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data);
  }

  debug(message: string, data?: any) {
    this.log(LogLevel.DEBUG, message, data);
  }
}

export const logger = Logger.getInstance();
