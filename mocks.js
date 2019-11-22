const faker = require("faker");
const TurndownService = require("turndown");
const { Post } = require("./models");

const author =
  "5dd52f0e5dde6f26786562a4"; /*home: "5dd817ce21fcbd14d472c117"; office: '5dd52f0e5dde6f26786562a4' */

module.exports = () => {
  Post.remove()
    .then(() => {
      Array.from({ length: 20 }).forEach(() => {
        const turndownService = new TurndownService();

        Post.create({
          title: faker.lorem.words(10),
          body: turndownService.turndown(faker.lorem.words(100)),
          author
        })
          .then(console.log)
          .catch(console.log);
      });
    })
    .catch(console.log);
};
