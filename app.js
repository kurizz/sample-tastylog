import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { application }  from "./lib/log/logger.js";
import accesslogger  from "./lib/log/accesslogger.js";
import applicationlogger  from "./lib/log/applicationlogger.js";
import favicon from "serve-favicon";
import router from "./routes/index.js";

const PORT = process.env.PORT || 3000;
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");

app.use(favicon(path.join(__dirname, "public/favicon.ico")));
app.use("/public", express.static(path.join(__dirname, "/public")));

app.use(accesslogger());

app.use("/", router);

import { promisify } from "util";
import config from "./config/mysql.config.js";
import mysql from "mysql";
//import SqlFileLoader from "@garafu/mysql-fileloader"

app.use("/test", async(req, res, next) => {
  //const { sql } = SqlFileLoader({ root: path.join(__dirname, "./lib/database/sql") });
  const conn = mysql.createConnection({
    host: config.HOST,
    port: config.PORT,
    user: config.USERNAME,
    password: config.PASSWORD,
    database: config.DATABASE
  });

  const client = {
    connect: promisify(conn.connect).bind(conn),
    query: promisify(conn.query).bind(conn),
    end: promisify(conn.end).bind(conn),
  };

  try {
    await client.connect();
    const data = await client.query('SELECT * FROM `t_shop` WHERE `id`=1')
    console.log(data[0])
  } catch (err) {
    next(err);
  } finally {
    await client.end();
  }

  res.end("OK");
});

app.use(applicationlogger())

app.listen(PORT, () => {
  application.log(`Application listening at :${PORT}`);
});
