const faker = require('faker');
const TurndownService = require('turndown');
const { Post } = require('./models');

const author = '5dd69d1f37aedb2700c85170';

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
                    .catch(console.log)
            });
        })
        .catch(console.log);
};