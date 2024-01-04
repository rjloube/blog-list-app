const _ = require("lodash");

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0);
};

const favoriteBlog = (blogs) => {
  let maxLikesBlog = blogs.reduce((max, blog) =>
    max.likes > blog.likes ? max : blog
  );
  let { _id, url, __v, ...rest } = maxLikesBlog; // Remove _id, url, __v from object
  console.log(rest);
  return rest;
};

const mostBlogs = (blogs) => {
  const groupedByAuthor = _.groupBy(blogs, "author");
  const authorWithMostBlogs = _.maxBy(
    Object.entries(groupedByAuthor),
    ([, blogs]) => blogs.length
  );

  return {
    author: authorWithMostBlogs[0],
    blogs: authorWithMostBlogs[1].length,
  };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
};
