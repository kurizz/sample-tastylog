import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import favicon from "serve-favicon";
import router from "./routes/index.js"

const PORT = process.env.PORT || 3000;
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");

app.use(favicon(path.join(__dirname, "public/favicon.ico")));
app.use("/public", express.static(path.join(__dirname, "/public")));

app.use("/", router);

app.listen(PORT, () => {
  console.log(`Application listening at :${PORT}`);
});
