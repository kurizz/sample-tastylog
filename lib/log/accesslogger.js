import log4js from "log4js";
import { access } from "./logger.js"

const DEFAULT_LOG_LEVEL = "auto";

export default function(options) {
  options = options || {};
  options.level = options.level || DEFAULT_LOG_LEVEL;
  options.format = options.format || function (req, res, format) {
    let address = req.headers["x-forwarded-for"] || req.ip;
    address = address.replace(/(\.|:)\d+(,|$)/g, "$10$2")

    return format(
      `${address} ` + ":method " + ":url " + "HTTP/:http-version " + ":status " + ":response-time " + ":user-agent "
    );
  }
  return log4js.connectLogger(access, options);
}
