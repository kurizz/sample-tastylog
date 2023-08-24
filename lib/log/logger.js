import log4js from "log4js";
import config from "../../config/log4js.config.js";

log4js.configure(config);
const console = log4js.getLogger();
const application = log4js.getLogger("application");

export { console, application };