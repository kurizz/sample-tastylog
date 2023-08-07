// @deno-types="npm:@types/express"
import express from "npm:express@4.17.1";

const app = express();
const port = 8080

app.use((_req, _res, next) => {
  console.log("hello, middleware");
  next();
})

app.get("/", (_req, res) => {
  res.send("welcome to the deno api!");
});

app.listen(port, () => {
  console.log(`app listening at ${port}`);
});
