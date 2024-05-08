export default {
  PORT: process.env.PORT || 3000,
  security: {
    SESSION_SECRET: "YOUR-SESSION-SECRET-STRRING",
  },
  search: {
    MAX_ITEMS_PER_PAGE: 5
  }
}