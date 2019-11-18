const config = require("./config");
const app = require("./app");
const db = require("./db");

db()
  .then(info => {
    console.log(`Connected to ${info.host}:${info.port}/${info.name}`);

    app.listen(config.PORT, () =>
      console.log(`Server is running on port ${config.PORT}`)
    );
  })
  .catch(err => {
    console.log("err", err);
    process.exit();
  });
