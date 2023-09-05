import { promisify } from "util";
import config from "../../config/mysql.config.js";
import mysql from "mysql";

const conn = mysql.createConnection({
  host: config.HOST,
  port: config.PORT,
  user: config.USERNAME,
  password: config.PASSWORD,
  database: config.DATABASE
});

const MySqlClient = {
  connect: promisify(conn.connect).bind(conn),
  query: promisify(conn.query).bind(conn),
  end: promisify(conn.end).bind(conn),
};

export default MySqlClient;
