import { promisify } from "util";
import config from "../../config/mysql.config.js";
import mysql from "mysql";

const pool = mysql.createPool({
  host: config.HOST,
  port: config.PORT,
  user: config.USERNAME,
  password: config.PASSWORD,
  database: config.DATABASE,
  connectionLimit: config.CONNECTION_LIMIT,
  queueLimit: config.QUEUE_LIMIT
});

export default {
  //pool,
  getConnection: promisify(pool.getConnection).bind(pool),
  executeQuery: promisify(pool.query).bind(pool),
  //releaseConnection: function(connection) {connection.release();},
  end: promisify(pool.end).bind(pool),
};
