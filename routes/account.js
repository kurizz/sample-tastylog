import express from "express";
import accountReviews from "./account.reviews.js"
import { authenticate, authorize, PRIVILEGE } from "../lib/security/accesscontrol.js";

const router = express.Router();

router.get("/", authorize(PRIVILEGE.NORMAL), (req, res, next) => {
  res.render("./account/index.ejs");
});

router.get("/login", (req, res, next) => {
  res.render("./account/login.ejs", { "message": req.flash("message") });
});

router.post("/login", authenticate());

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err)
    } else {
      res.redirect("/account/login");
    }
  });
});

router.use("/reviews", authorize(PRIVILEGE.NORMAL), accountReviews)

export default router;
