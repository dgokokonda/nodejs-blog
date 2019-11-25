const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const autopopulate = require("mongoose-autopopulate");
const Post = require("./post");

const schema = new Schema(
  {
    comment: {
      type: String,
      required: true
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post"
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      autopopulate: true
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Comment"
    },
    children: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        autopopulate: true
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

schema.plugin(autopopulate);
schema.pre("save", async function(next) {
  if (this.isNew) {
    await Post.incCommentCount(this.post);
  }
  next();
});

schema.set("toJSON", {
  virtuals: true
});

module.exports = mongoose.model("Comment", schema);