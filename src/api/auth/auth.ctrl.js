/* eslint-disable no-unused-vars */

const Joi = require('joi');
const Account = require('../../models/account');

exports.localRegister = async (ctx) => {
    // data verificate
    const schema = Joi.object().keys({
        username: Joi.string().alphanum().min(4).max(15).required(),
        email: Joi.string().email().required(),
        password: Joi.string().email().required().min(6)
    });

    const result = Joi.validate(ctx.request.body, schema);

    // verification fail
    if(result.error) {
        ctx.status = 400;
        return;
    }

    // ID and email existing check
    let existing = null;
    try{
        existing = await Account.findByEmailOrUsername(ctx.request.body);
    }
    catch(e) {
        ctx.throw(500, e);
    }

    if(existing)
    {
        ctx.status = 409;
        ctx.body = {
            // email이 중복이면 email을, 아니면 username을 key에 담아줌
            key: existing.email === ctx.request.body.email ? 'email' : 'username'
        }
        return;
    }

    // regist account
    let account = null;
    try
    {
        account = await Account.localRegister(ctx.request.body);
    }
    catch(e)
    {
        ctx.throw(500, e);
    }

    let token = null;
    try
    {
        token = await account.generateToken();
    }
    catch(e)
    {
        ctx.throw(500, e);
    }

    ctx.cookies.set('access_token', token, {httpOnly: true, maxAge: 1000* 60 * 60 * 24 * 7});
    ctx.body = account.profile; // 프로필 정보로 응답
};

exports.localLogin = async (ctx) => {
    // ctx.body = 'login';
    const schema = Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    const result = Joi.validate(ctx.request.body, schema);

    if(result.error)
    {
        ctx.status = 400;
        return;
    }

    const{email, password} = ctx.request.body;

    let account = null;
    try
    {
        // 이메일로 계정 찾기
        account = await Account.findByEmail(email);
    }
    catch(e)
    {
        ctx.throw(500, e);
    }

    if(!account||!account.validatePassword(password)) {
        // 유저가 없거나, 비번이 틀렸으면 403 전달
        ctx.status = 403;
        return;
    }

    let token = null;
    try
    {
        token = await account.generateToken();
    }
    catch(e)
    {
        ctx.throw(500, e);
    }

    ctx.cookies.set('access_token', token, {httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7});
    ctx.body = account.profile;
};

exports.exists = async (ctx) => {
    const{key, value} = ctx.params;
    let account = null;

    try
    {
        account = await (key=='email' ? Account.findByEmail(value) : Account.findByEmailOrUsername(value));
    }
    catch(e)    
    {
        ctx.throw(500, e);
    }

    ctx.body={
        exists: account !== null
    };
};


exports.logout = async (ctx) => {
    ctx.cookies.set('access_token', null, {
        maxAge: 0,
        httpOnly: true
    });
    ctx.status = 204;
};

// 만약에 쿠키에 access_token 이 있다면, 현재 로그인된 유저의 정보를 알려주는 API
exports.check = (ctx) => {
    const { user } = ctx.request;

    if(!user) {
        ctx.status = 403; // Forbidden
        return;
    }

    ctx.body = user.profile;
};