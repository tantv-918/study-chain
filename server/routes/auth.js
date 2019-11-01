const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
let secretJWT = require('../configs/secret').secret;
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network');
const passport = require('passport');
const passportOauth = require('../configs/passport-oauth');
const signJWT = require('../middlewares/sign-jwt');
const OAUTH_TYPES = require('../configs/constant').OAUTH_TYPES;

router.get('/', async (req, res) => {
  return res.json({
    hello: 'auth'
  });
});

// Register
router.post(
  '/register',
  [
    check('username')
      .not()
      .isEmpty()
      .trim()
      .escape(),

    // password must be at least 5 chars long
    check('password').isLength({ min: 6 }),
    // name must be at least 5 chars long
    check('fullname').isLength({ min: 6 })
  ],
  async (req, res, next) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    User.findOne({ username: req.body.username }, async (err, existing) => {
      if (err) {
        return res.status(500).json({
          success: false,
          msg: err
        });
      }

      if (existing) {
        return res.json({
          success: false,
          msg: 'Account is exits'
        });
      }
      // Save data
      let createdUser = {
        username: req.body.username,
        password: req.body.password,
        oauthType: OAUTH_TYPES.NO,
        fullname: req.body.fullname
      };
      const response = await network.registerStudentOnBlockchain(createdUser);
      if (response.success) {
        return res.json({
          success: true,
          msg: response.msg
        });
      }
      return res.json({
        success: false,
        msg: response.msg
      });
    });
  }
);

// Login
router.post(
  '/login',
  [
    check('username')
      .not()
      .isEmpty()
      .trim()
      .escape(),

    // password must be at least 6 chars long
    check('password').isLength({ min: 6 })
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // After the validation
    User.findOne({ username: req.body.username }, async (err, user) => {
      if (err) {
        return res.status(500).json({
          success: false,
          msg: err
        });
      }

      if (!user) {
        return res.json({
          success: false,
          msg: 'Username or Password incorrect'
        });
      }

      let validPassword = await bcrypt.compare(req.body.password, user.password);

      if (!validPassword) {
        return res.json({
          success: false,
          msg: 'Username or Password incorrect'
        });
      }
      var token = jwt.sign(
        {
          user: user
        },
        secretJWT
      );

      return res.json({
        success: true,
        fullname: user.fullname,
        msg: 'Login success',
        token: token,
        role: user.role
      });
    });
  }
);

router.get(
  '/google',
  passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email']
  })
);

router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  signJWT.signToken(req, res);
});

router.get(
  '/facebook',
  passport.authenticate('facebook', {
    session: false
  })
);

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { session: false }),
  (req, res) => {
    signJWT.signToken(req, res);
  }
);

module.exports = router;
