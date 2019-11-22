const dotenv = require("dotenv");
const path = require("path");

const root = path.join.bind(this, __dirname);
dotenv.config({ path: root(".env") });

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URL: process.env.MONGO_URL /* mongodb://localhost/<db> */,
  SESSION_SECRET: process.env.SESSION_SECRET /* random initial key */,
  PER_PAGE: process.env.PER_PAGE
};
