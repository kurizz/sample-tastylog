import Router from "express";
import MySqlClient from "../lib/database/client.js";

const router = Router.Router();

router.get("/:id", (req, res, next) => {
  const id = req.params.id;

  Promise.all([
    MySqlClient.executeQuery('SELECT * FROM t_shop WHERE id = ?', [id])
  ]).then((results) => {
    const data = results[0][0];
    res.render("./shops/index.ejs", data);
  }).catch((err) => {
    next(err);
  });
});

export default router