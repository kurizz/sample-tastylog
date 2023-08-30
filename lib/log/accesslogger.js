import log4js from "log4js";
import { access } from "./logger.js"

const DEFAULT_LOG_LEVEL = "auto";

export default function(options) {
  options = options || {};
  options.level = options.level || DEFAULT_LOG_LEVEL;
  return log4js.connectLogger(access, options);
}
