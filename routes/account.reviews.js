import express from "express";
import MySqlClient from "../lib/database/client.js";
import moment from "moment"

const createReviewData = req => {
  let date;

  return {
    shopId: req.params.shopId,
    score: parseFloat(req.body.score),
    visit: (date = moment(req.body.visit, "YYYY/MM/DD")) && date.isValid() ? date.toDate() : null,
    post: new Date(),
    description: req.body.description,
  };
}

const router = express();
router.get("/regist/:shopId(\\d+)", async(req, res, next) => {
  let shopId = req.params.shopId;
  let shop, shopName, review, results;

  try {
    results = await MySqlClient.executeQuery("SELECT * FROM t_shop WHERE id = ?", [shopId]);
    shop = results[0] || {};
    shopName = shop.name;
    review = {}
    res.render("./account/reviews/regist-form.ejs", { shopId, shopName, review });
  } catch (err) {
    next(err);
  }
});

router.post("/regist/:shopId(\\d+)", (req, res, next) => {
  let review = createReviewData(req);
  let { shopId, shopName } = req.body;
  res.render("./account/reviews/regist-form.ejs", { shopId, shopName, review })
});

router.post("/regist/confirm", (req, res, next) => {
  let review = createReviewData(req);
  let { shopId, shopName } = req.body;
  res.render("./account/reviews/regist-confirm.ejs", { shopId, shopName, review })
});

export default router;