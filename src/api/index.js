/* eslint-disable no-unused-vars */
const Router = require('koa-router');
const api = new Router();

api.get('/', (ctx, next) => {
    ctx.body = 'GET' + ctx.request.path;
});

module.exports = api;