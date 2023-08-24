import { application } from "./logger.js";

export default function(options) {
  return function(err, req, res, next) {
    application.error(err.message);
    next(err);
  }
}
