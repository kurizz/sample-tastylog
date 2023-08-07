import express from "express";
import router from "./routes/index.js"

const PORT = process.env.PORT || 3000;
const app = express();

app.set("view engine", "ejs");
app.use("/", router);
app.listen(PORT, () => {
  console.log(`Application listening at :${PORT}`);
});
