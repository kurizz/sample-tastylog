import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import favicon from "serve-favicon";

import { application }  from "./lib/log/logger.js";
import accesslogger  from "./lib/log/accesslogger.js";
import applicationlogger  from "./lib/log/applicationlogger.js";
import router from "./routes/index.js";
import MySqlClient from "./lib/database/client.js";

const PORT = process.env.PORT || 3000;
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");

app.use(favicon(path.join(__dirname, "public/favicon.ico")));
app.use("/public", express.static(path.join(__dirname, "/public")));

app.use(accesslogger());

app.use("/", router);

app.use("/test", async(req, res, next) => {

  try {
    const data = await MySqlClient.executeQuery('SELECT * FROM `t_shop` WHERE `id`=?', [10]);
    console.log(data);
  } catch (err) {
    next(err);
  }

  res.end("OK");
});

app.use(applicationlogger())

app.listen(PORT, () => {
  application.log(`Application listening at :${PORT}`);
});
