const auth = require("./auth");
const post = require("./post");
const journal = require("./journal");
const comment = require("./comment");
const upload = require("./upload");
// список роутов
module.exports = {
  auth,
  post,
  journal,
  comment,
  upload
};
