import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import favicon from "serve-favicon";
import moment from "moment";
import cookie from "cookie-parser";
import session from "express-session";
import MySQLStore from "express-mysql-session";
import flash from "connect-flash"

import { application } from "./lib/log/logger.js";
import accesslogger from "./lib/log/accesslogger.js";
import applicationlogger from "./lib/log/applicationlogger.js";
import { initialize } from "./lib/security/accesscontrol.js";

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
const IS_PRODUCTION = process.env.NODE_ENV === "production";

app.set("view engine", "ejs");

app.use((req, res, next) => {
  res.locals.moment = moment;
  res.locals.padding = padding;
  next();
});

app.use(favicon(path.join(__dirname, "public/favicon.ico")));
app.use("/public", express.static(path.join(__dirname, "/public")));

app.use(accesslogger());

app.use(cookie());
app.use(session({
  store: new MySQLStore({
    host: dbconfig.HOST,
    port: dbconfig.PORT,
    user: dbconfig.USERNAME,
    password: dbconfig.PASSWORD,
    database: dbconfig.DATABASE,
  }),
  cookie: {
    secure: IS_PRODUCTION,
  },
  secret: appconfig.security.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: "sid"
}));
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(...initialize());

app.use("/", (() => {
  const _router = express.Router();
  _router.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    next();
  });
  _router.use("/", router);
  _router.use("/shops", shops);
  _router.use("/search", search);
  _router.use("/account", account);

  return _router;
})());

app.use(applicationlogger())

app.use((req, res, next) => {
  res.status(404);
  res.render("./404.ejs");
})


app.listen(appconfig.PORT, () => {
  application.log(`Application listening at :${appconfig.PORT}`);
});
