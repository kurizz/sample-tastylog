import express from "express";
import accountReviews from "./account.reviews.js"
import { authenticate, authorize, PRIVILEGE } from "../lib/security/accesscontrol.js";

const router = express();

router.get("/", authorize(PRIVILEGE.NORMAL), (req, res, next) => {
  res.render("./account/index.ejs");
})

router.get("/login", (req, res, next) => {
  res.render("./account/login.ejs", { "message": req.flash("message") });
})

router.post("/login", (req, res, next) => {
  console.log("Login request received:", req.body);  // 追加
  next();
}, authenticate());
router.post("/login", authenticate());

router.use("/reviews", authorize(PRIVILEGE.NORMAL), accountReviews)

export default router;
