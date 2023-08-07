import express from "npm:express@4.17.1";

const app = express();

app.get("/", (req, res) => {
  res.send("welcome to the deno api!");
})

app.listen(8080);