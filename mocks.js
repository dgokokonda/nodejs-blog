const faker = require("faker");
const tr = require('transliter');
const { Post } = require("./models");

const author =
  "5dd52f0e5dde6f26786562a4"; /*home: "5dd817ce21fcbd14d472c117"; office: '5dd52f0e5dde6f26786562a4' */

module.exports = async () => {
  try {
    await Post.remove();
    Array.from({ length: 20 }).forEach(async () => {
      const title = faker.lorem.words(5);
      const url = `${tr.slugify(title)}-${Date.now().toString(36)}`;
      await Post.create({
        title,
        body: faker.lorem.words(40),
        url,
        author
      })
    });
  }
  catch (err) {
    console.log(err)
  }
};
