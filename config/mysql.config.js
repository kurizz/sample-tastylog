export default {
  HOST: process.env.MYSQL_HOST || "127.0.0.1",
  PORT: process.env.MYSQL_PORT || "9999",
  USERNAME: process.env.MYSQL_USERNAME || "root",
  PASSWORD: process.env.MYSQL_PASSWORD || "root",
  DATABASE: process.env.MYSQL_DATABASE || "tastylog"
}