process.env.NODE_DEV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const chai = require('chai');
const Cert = require('../models/Certificate');
const sinon = require('sinon');
const network = require('../fabric/network');
const USER_ROLES = require('../configs/constant').USER_ROLES;
const User = require('../models/User');
const app = require('../app');

require('dotenv').config();

describe('Route : /score', () => {
  describe('# GET /score/:subjectId/:studentUsername ', () => {
    let connect;
    let query;
    let findOneStub;

    beforeEach(() => {
      connect = sinon.stub(network, 'connectToNetwork');
      query = sinon.stub(network, 'query');
      findOneStub = sinon.stub(User, 'findOne');
    });

    afterEach(() => {
      connect.restore();
      query.restore();
      findOneStub.restore();
    });

    it('do not success query score with admin student', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_STUDENT });
      request(app)
        .get('/score/IT00/tan')
        .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('do not success query score with student', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.STUDENT });
      request(app)
        .get('/score/IT00/tan')
        .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('do not success query score with teacher', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.TEACHER });
      request(app)
        .get('/score/IT00/tan')
        .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('error check jwt', (done) => {
      findOneStub.yields({ error: 'can not check jwt' }, undefined);
      request(app)
        .get(`/score/IT00/tan`)
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.body.success).equal(false);
          expect(res.status).equal(403);
          done();
        });
    });

    it('do not success because error when query indentity', (done) => {
      findOneStub
        .onFirstCall()
        .yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });

      findOneStub.onSecondCall().yields({ error: 'fake' }, null);
      request(app)
        .get('/score/IT00/tan')
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.body.success).equal(false);
          expect(res.status).equal(403);
          done();
        });
    });

    it('error when query chaincode', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });

      query.returns({ success: false, msg: 'error' });
      request(app)
        .get('/score/IT00/tan')
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(500);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('error');
          done();
        });
    });

    it('success query score', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });

      let data = JSON.stringify({
        SubjectId: '00',
        studentUsername: 'tan',
        scoreValue: 10.0,
        Certificate: true
      });

      query.returns({ success: true, msg: data });
      request(app)
        .get('/score/IT00/tan')
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          done();
        });
    });
  });

  describe('# GET /score/all ', () => {
    let connect;
    let query;
    let findOneStub;

    beforeEach(() => {
      connect = sinon.stub(network, 'connectToNetwork');
      query = sinon.stub(network, 'query');
      findOneStub = sinon.stub(User, 'findOne');
    });

    afterEach(() => {
      connect.restore();
      query.restore();
      findOneStub.restore();
    });

    it('do not success query all score with admin student', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_STUDENT });
      request(app)
        .get('/score/all')
        .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('do not success query score with student', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.STUDENT });
      request(app)
        .get('/score/all')
        .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('do not success query score with teacher', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.TEACHER });
      request(app)
        .get('/score/all')
        .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(403);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('Permission Denied');
          done();
        });
    });

    it('error check jwt', (done) => {
      findOneStub.yields({ error: 'can not check jwt' }, undefined);
      request(app)
        .get(`/score/all`)
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.body.success).equal(false);
          expect(res.status).equal(403);
          done();
        });
    });

    it('get all score faild', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });
      query.returns({ success: false, msg: 'error' });
      request(app)
        .get('/score/all')
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(500);
          expect(res.body.success).equal(false);
          expect(res.body.msg).equal('error');
          done();
        });
    });

    it('get all score success', (done) => {
      findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.ADMIN_ACADEMY });
      let data = JSON.stringify({
        SubjectId: '00',
        studentUsername: 'tan',
        scoreValue: 10.0,
        Certificate: true
      });
      query.returns({ success: true, msg: data });
      request(app)
        .get('/score/all')
        .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
        .then((res) => {
          expect(res.status).equal(200);
          expect(res.body.success).equal(true);
          done();
        });
    });
  });
});
