/* eslint-disable no-unused-vars */
require('dotenv').config();
const port = process.env.PORT || 4000

const bodyParser = require('koa-bodyparser');
const Koa = require('koa');
const Router = require('koa-router');
const mongoose = require('mongoose');
const api = require('./api');

const app = new Koa();
const router = new Router();

mongoose.Promise=global.Promise;
mongoose.connect(process.env.MONGO_URI)
    .then(response =>{
        console.log('mongoDB conneted');
    })
    .catch(error => {
        console.log(error);
    });

router.get('/', (ctx, next) => {
    ctx.body = 'it is root page';
});

app
    .use(bodyParser())
    .use(router.routes())
    .use(router.allowedMethods());

router.get('/api', api.routes());

app.listen(4000, () => {
    console.log('Koa server is listening to port 4000');
});