import log4js from "log4js";
import config from "../../config/log4js.config.js";

log4js.configure(config);

const application = log4js.getLogger("application");
const access = log4js.getLogger("access");

export { application, access };
