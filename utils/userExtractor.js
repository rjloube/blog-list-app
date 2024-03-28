const User = require("../models/user");
const jwt = require("jsonwebtoken");

const assignUserToRequest = async (request) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  const user = await User.findById(decodedToken.id);
  if (user) {
    request.user = user;
  }
};

module.exports = { assignUserToRequest };
