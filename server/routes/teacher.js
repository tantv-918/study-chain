const router = require('express').Router();
const USER_ROLES = require('../configs/constant').USER_ROLES;
const network = require('../fabric/network');
const User = require('../models/User');
const { check, validationResult, sanitizeParam } = require('express-validator');

router.get('/create', async (req, res) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.status(403).json({
      success: false,
      msg: 'Permission Denied'
    });
  }
  return res.json({
    hello: 'new teacher'
  });
});

router.post(
  '/create',
  [
    check('username')
      .not()
      .isEmpty()
      .trim()
      .escape(),

    check('fullname')
      .isLength({ min: 6 })
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        success: false,
        msg: 'Permission Denied'
      });
    }
    User.findOne({ username: req.body.username }, async (err, existing) => {
      if (err) return res.status(500).json({ success: false, msg: 'error query teacher' });
      if (existing) {
        return res.status(409).json({
          success: false,
          msg: 'Teacher username is exist'
        });
      }
      let createdUser = {
        username: req.body.username,
        fullname: req.body.fullname
      };
      const networkObj = await network.connectToNetwork(req.decoded.user);
      const response = await network.registerTeacherOnBlockchain(networkObj, createdUser);
      if (!response.success) {
        return res.status(500).json({
          success: false,
          msg: response.msg
        });
      }
      const teachers = await network.query(networkObj, 'GetAllTeachers');

      if (!teachers.success) {
        return res.status(500).json({
          success: false,
          msg: response.msg
        });
      }

      return res.json({
        success: true,
        msg: response.msg,
        teachers: JSON.parse(teachers.msg)
      });
    });
  }
);

router.get('/all', async (req, res, next) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.status(403).json({
      success: false,
      msg: 'Permission Denied'
    });
  }
  const networkObj = await network.connectToNetwork(req.decoded.user);
  const response = await network.query(networkObj, 'GetAllTeachers');
  if (!response.success) {
    return res.status(500).json({
      success: false,
      msg: response.msg.toString()
    });
  }
  return res.json({
    success: true,
    teachers: JSON.parse(response.msg)
  });
});

router.get(
  '/:username',
  [
    sanitizeParam('username')
      .trim()
      .escape()
  ],
  async (req, res, next) => {
    if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
      return res.status(403).json({
        success: false,
        msg: 'Permission Denied'
      });
    }
    var username = req.params.username;

    User.findOne({ username: username, role: USER_ROLES.TEACHER }, async (err, teacher) => {
      if (err) {
        return res.status(500).json({
          success: false,
          msg: err
        });
      }
      if (!teacher) {
        res.status(404).json({
          success: false,
          msg: 'teacher is not exists'
        });
      }
      const networkObj = await network.connectToNetwork(req.decoded.user);
      const response = await network.query(networkObj, 'QueryTeacher', username);
      let subjects = await network.query(networkObj, 'GetSubjectsByTeacher', username);
      if (!response.success || !subjects.success) {
        return res.status(500).json({
          success: false,
          msg: response.msg.toString()
        });
      }
      return res.json({
        success: true,
        msg: response.msg.toString(),
        subjects: JSON.parse(subjects.msg)
      });
    });
  }
);

router.get('/:username/subjects', async (req, res, next) => {
  if (req.decoded.user.role !== USER_ROLES.ADMIN_ACADEMY) {
    return res.status(403).json({
      success: false,
      msg: 'Permission Denied'
    });
  }
  await User.findOne({ username: req.params.username }, async (err, teacher) => {
    if (err) {
      return res.status(500).json({
        success: false,
        msg: err
      });
    }
    if (!teacher) return res.status(404).json({ success: false, msg: 'teacher is not exists' });

    const networkObj = await network.connectToNetwork(req.decoded.user);
    let subjectsByTeacher = await network.query(
      networkObj,
      'GetSubjectsByTeacher',
      teacher.username
    );
    let subjects = await network.query(networkObj, 'GetAllSubjects');
    let subjectsNoTeacher = JSON.parse(subjects.msg).filter(
      (subject) => subject.TeacherUsername === ''
    );

    if (!subjectsByTeacher.success || !subjects.success) {
      return res.status(500).json({
        success: false,
        msg: subjectsByTeacher.msg.toString()
      });
    }
    return res.json({
      success: true,
      subjects: JSON.parse(subjectsByTeacher.msg),
      subjectsNoTeacher: subjectsNoTeacher
    });
  });
});

module.exports = router;
