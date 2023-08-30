import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_ROOT_DIR = process.env.LOG_ROOT_DIR || path.join(__dirname, "../logs");

export default {
  appenders: {
    ConsoleLogAppender: {
      type: "console"
    },
    ApplicationLogAppender: {
        type: "dateFile",
        filename: path.join(LOG_ROOT_DIR, "./application.log"),
        pattern: "yyyyMMdd",
        daysToKeep: 7,
    },
    AccessLogAppender: {
      type: "dateFile",
        filename: path.join(LOG_ROOT_DIR, "./access.log"),
        pattern: "yyyyMMdd",
        daysToKeep: 7,
    }
  },
  categories: {
    "default": {
      appenders: ["ConsoleLogAppender"],
      level: "ALL"
    },
    "application": {
      appenders: [
        "ApplicationLogAppender",
        "ConsoleLogAppender"
      ],
      level: "INFO"
    },
    "access": {
      appenders: [
        "AccessLogAppender",
        "ConsoleLogAppender"
      ],
      level: "INFO"
    },
  }
};