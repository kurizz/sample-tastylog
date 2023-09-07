import pool from "./pool.js"

const MySqlClient = {
  executeQuery: async function(query, values) {
    return await pool.executeQuery(query, values);
  }
}

export default MySqlClient;
