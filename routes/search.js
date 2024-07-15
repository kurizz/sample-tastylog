import express from "express";
import MySqlClient from "../lib/database/client.js";
import applicationConfig from "../config/application.config.js";

const router = express.Router()
const MAX_ITEMS = applicationConfig.search.MAX_ITEMS_PER_PAGE

router.get("/", async (req, res, next) => {
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const keyword = req.query.keyword || "";
  let results, count;

  try {
    if (keyword) {
      count = (
        await MySqlClient.executeQuery('SELECT count(*) as count FROM t_shop WHERE name LIKE ?', [`%${keyword}%`])
      )[0].count;

      results = await MySqlClient.executeQuery(
        'SELECT sc.id, sc.name, sc.post_code, sc.address, sc.tel, sc.holiday, sc.seats, sc.score, GROUP_CONCAT(m_category.name separator ", ") as categories \
         FROM \
         ( \
           SELECT * FROM (SELECT * FROM t_shop WHERE name LIKE ?) as shop \
           LEFT JOIN t_shop_category ON shop.id = t_shop_category.shop_id \
         ) as sc \
         LEFT JOIN m_category on sc.category_id = m_category.id \
         GROUP BY sc.id \
         LIMIT ?, ?',
        [`%${keyword}%`, (page-1)*MAX_ITEMS, MAX_ITEMS]
      )
    } else {
      count = MAX_ITEMS;
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
    res.render(
      "./search/list.ejs",
      {
        keyword,
        count,
        results,
        pagenation: {
          max: Math.ceil(count/MAX_ITEMS),
          min: 1,
          current: page
        }
      }
    );
  } catch (err) {
    next(err);
  }
})

export default router;