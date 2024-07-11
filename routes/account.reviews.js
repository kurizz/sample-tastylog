import express from "express";
import MySqlClient from "../lib/database/client.js";
import moment from "moment"
import tokens from "csrf";

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

const validateReviewData = req => {
  let error = {};
  if (req.body.visit && !moment(req.body.visit, "YYYY/MM/DD").isValid()) {
    error.visit = "訪問日の日付文字列が不正です。";
    return error;
  }

  return undefined;
};

const router = express();

router.get("/regist/:shopId(\\d+)", async(req, res, next) => {
  let shopId = req.params.shopId;
  let secret, token, shop, shopName, review, results;

  let _tokens = new tokens();
  secret = await _tokens.secret();
  token = _tokens.create(secret);
  req.session._csrf = secret;
  res.cookie("_csrf", token);

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
  let error = validateReviewData(req);
  let review = createReviewData(req);
  let { shopId, shopName } = req.body;

  if (error) {
    res.render("./account/reviews/regist-form.ejs", { error, shopId, shopName, review });
    return
  }

  res.render("./account/reviews/regist-confirm.ejs", { shopId, shopName, review })
});

router.post("/regist/execute", async (req, res, next) => {
  let secret = req.session._csrf;
  let token = req.cookies._csrf;

  let _tokens = new tokens();
  if (_tokens.verify(secret, token) == false) {
    next(new Error("Invalid Token."));
    return;
  }

  let error = validateReviewData(req);
  let review = createReviewData(req);
  let { shopId, shopName } = req.body;
  let userId = 1; // TODO: ログイン機能実装後にやる
  let transaction;

  if (error) {
    res.render("./account/reviews/regist-form.ejs", { error, shopId, shopName, review });
    return
  }

  try {
    transaction = await MySqlClient.beginTransaction();

    await transaction.executeQuery("SELECT * FROM t_shop WHERE id = ? FOR UPDATE", [shopId]);

    await transaction.executeQuery(
      "INSERT INTO t_review (`shop_id`, `user_id`, `score`, `visit`, `description`) VALUES (?, ?, ?, ?, ?)",
      [shopId, userId, review.score, review.visit, review.description]
    );

    await transaction.executeQuery(
      "UPDATE t_shop SET score = (SELECT round(avg(score), 2) FROM t_review WHERE shop_id = ?) WHERE id = ?",
      [shopId, shopId]
    );

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    next(err);
    return
  }

  delete req.session._csrf;
  res.clearCookie("_csrf");

  res.redirect(`/account/reviews/regist/complete?shopId=${shopId}`);
});

router.get("/regist/complete", (req, res, next) => {
    res.render("./account/reviews/regist-complete.ejs", { shopId: req.query.shopId })
});

export default router;