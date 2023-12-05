import express from "express";
import MySqlClient from "../lib/database/client.js";

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

export default router;