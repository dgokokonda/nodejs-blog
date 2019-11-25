const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const URLSlugs = require("mongoose-url-slugs");
const transliter = require("transliter");

const schema = new Schema(
  {
    title: {
      type: String
    },
    body: {
      type: String
    },
    author: {
      // user's model id
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      required: true,
      default: 'published'
    },
    commentCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

schema.statics = {
  incCommentCount(postId) {
    return this.findByIdAndUpdate(
      postId,
      { $inc: { commentCount: 1 } },
      { new: true }
    );
  }
};

// add post's identificator by url
schema.plugin(
  URLSlugs("title", {
    field: "url",
    generator: text => transliter.slugify(text)
  })
);

schema.set("toJSON", {
  virtuals: true
});

module.exports = mongoose.model("Post", schema);
