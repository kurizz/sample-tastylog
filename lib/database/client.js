import pool from "./pool.js"
import Transaction from "./transaction.js"

const MySqlClient = {
  executeQuery: async function(query, values) {
    return await pool.executeQuery(query, values);
  },
  beginTransaction: async function() {
    const tran = new Transaction();
    await tran.begin();
    return tran;
  }
};

export default MySqlClient;
