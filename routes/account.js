import express from "express";
import accountReviews from "./account.reviews.js"

const router = express();
router.use("/reviews", accountReviews)

export default router;