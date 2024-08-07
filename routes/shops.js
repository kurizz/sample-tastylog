import express from "express";
import MySqlClient from "../lib/database/client.js";

const router = express.Router();

router.get("/:id", (req, res, next) => {
  const id = req.params.id;

  Promise.all([
    MySqlClient.executeQuery(
      'SELECT sc.id, sc.name, sc.post_code, sc.address, sc.tel, sc.holiday, sc.seats, sc.price_range, sc.score, sc.geolocation_latitude, sc.geolocation_longitude, GROUP_CONCAT(m_category.name separator ", ") as categories \
       FROM ( \
         SELECT * FROM (SELECT * FROM t_shop WHERE id=?) AS t_shop \
         LEFT JOIN t_shop_category ON t_shop.id=t_shop_category.shop_id \
       ) AS sc \
       LEFT JOIN m_category ON sc.category_id=m_category.id \
       GROUP BY sc.id',
      [id]
    ),
    MySqlClient.executeQuery(
      'SELECT t_review.id, t_user.id as user_id, t_user.name as user_name, t_review.score, t_review.visit, t_review.post, t_review.description \
       FROM t_review LEFT JOIN t_user on t_review.user_id = t_user.id  \
       WHERE t_review.shop_id = ? \
      ',
     [id]
    )
  ]).then((results) => {
    var data = results[0][0];
    data.reviews = results[1] || [];
    res.render("./shops/index.ejs", data);
  }).catch((err) => {
    next(err);
  });
});

export default router