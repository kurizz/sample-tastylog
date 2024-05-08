import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import favicon from "serve-favicon";
import moment from "moment";
import cookie from "cookie-parser";
import session from "express-session";
import MySQLStore from "express-mysql-session";

import { application }  from "./lib/log/logger.js";
import accesslogger  from "./lib/log/accesslogger.js";
import applicationlogger  from "./lib/log/applicationlogger.js";

import router from "./routes/index.js";
import shops from "./routes/shops.js";
import search from "./routes/search.js";
import account from "./routes/account.js";

import appconfig from "./config/application.config.js";
import dbconfig from "./config/mysql.config.js";

import { padding } from "./lib/math/math.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");

app.use((req, res, next) => {
  res.locals.moment = moment;
  res.locals.padding = padding;
  next();
});

app.use(favicon(path.join(__dirname, "public/favicon.ico")));
app.use("/public", express.static(path.join(__dirname, "/public")));

app.use(accesslogger());

//import MySqlClient from "./lib/database/client.js";
// app.get("/test", async (req, res, next) => {
//   let tran;
//   try {
//     tran = await MySqlClient.beginTransaction();
//     await tran.executeQuery("UPDATE t_shop SET score=? WHERE id=?", [4.00, 1]);
//     throw new Error("Test Exception");
//     await tran.commit();
//     res.end("OK");
//   } catch (err) {
//     await tran.rollback();
//     next(err);
//   }
// });

app.use(cookie());
app.use(session({
  store: new MySQLStore({
    host: dbconfig.HOST,
    port: dbconfig.PORT,
    user: dbconfig.USERNAME,
    password: dbconfig.PASSWORD,
    database: dbconfig.DATABASE,
  }),
  secret: appconfig.security.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  name: "sid"
}));
app.use(express.urlencoded({ extended: true }));

app.use("/", router);
app.use("/shops", shops);
app.use("/search", search);
app.use("/account", account);

app.use(applicationlogger())

app.listen(appconfig.PORT, () => {
  application.log(`Application listening at :${appconfig.PORT}`);
});
