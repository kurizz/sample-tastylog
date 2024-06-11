import express from "express";
import accountReviews from "./account.reviews.js"

const router = express();

router.get("/login", (req, res, next) => {
  res.render("./account/login.ejs");
})

router.use("/reviews", accountReviews)

export default router;