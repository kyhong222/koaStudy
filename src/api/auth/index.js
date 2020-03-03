/* eslint-disable no-unused-vars */
const Router = require('koa-router');
const auth = new Router();
const authCtrl = require('./auth.ctrl');

auth.post('/register/local', authCtrl.localRegister);
auth.post('/login/local', authCtrl.localLogin);
auth.get('/exists/:key(enail|username)/:value', authCtrl.exists);
auth.post('/logout', authCtrl.logout);

module.exports = auth;
