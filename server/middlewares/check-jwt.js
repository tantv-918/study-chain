const jwt = require('jsonwebtoken');
let secretJWT = require('../configs/secret').secret;
const User = require('../models/User');

module.exports = (req, res, next) => {
  let token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({
      success: false,
      message: 'No token provided'
    });
  }

  jwt.verify(token, secretJWT, (err, decoded) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to authentication token'
      });
    }
    User.findOne(
      { username: decoded.user.username, oauthType: decoded.user.oauthType },
      (err, user) => {
        if (err) {
          return res.status(403).json({
            success: false,
            message: 'Error find username'
          });
        }
        if (user) {
          req.decoded = decoded;
          next();
        }
      }
    );
  });
};
