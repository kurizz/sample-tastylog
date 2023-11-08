import Router from "express";
import MySqlClient from "../lib/database/client.js";

const router = Router.Router()
const MAX_ITEMS = 5;

router.get("/", async (req, res, next) => {
  const keyword = req.query.keyword || "";
  let results;

  try {
    if (keyword) {
      results = await MySqlClient.executeQuery(
        'SELECT sc.id, sc.name, sc.post_code, sc.address, sc.tel, sc.holiday, sc.seats, sc.score, GROUP_CONCAT(m_category.name separator ", ") as categories \
         FROM \
         ( \
           SELECT * FROM (SELECT * FROM t_shop WHERE name LIKE ?) as shop \
           LEFT JOIN t_shop_category ON shop.id = t_shop_category.shop_id \
         ) as sc \
         LEFT JOIN m_category on sc.category_id = m_category.id \
         GROUP BY sc.id \
         LIMIT ?',
        [`%${keyword}%`, MAX_ITEMS]
      )
    } else {
      results = await MySqlClient.executeQuery(
        'SELECT sc.id, sc.name, sc.post_code, sc.address, sc.tel, sc.holiday, sc.seats, sc.score, GROUP_CONCAT(m_category.name separator ", ") as categories \
         FROM \
         ( \
           SELECT * FROM (SELECT * FROM t_shop ORDER BY score DESC LIMIT ?) as shop \
           LEFT JOIN t_shop_category ON shop.id = t_shop_category.shop_id \
         ) as sc \
         LEFT JOIN m_category on sc.category_id = m_category.id \
         GROUP BY sc.id \
         ORDER BY score DESC',
        [MAX_ITEMS]
      )
    }
    res.render("./search/list.ejs", { keyword, results });
  } catch (err) {
    next(err);
  }
})

export default router;