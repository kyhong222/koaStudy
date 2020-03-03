/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
var Schema = mongoose.Schema;
const crypto = require('crypto');
const {generateToken} = require('../lib/token');

const Account = new Schema({
    profile:{
        thumbnail:{
            type: String,
            default: '/static/images.default_thumnail.png'
        },
        email:{
            type: String
        },
        // social account exception
        social:{
            facebook:{
                id: String,
                accessToken: String
            },
            google:{
                id: String,
                accessToken: String
            }   
        },
        password: String,
        thoughtCount:{
            type: Number,
            default: 0
        },
        createAt: {
            type: Date,
            default: Date.now
        }
    }
})

function hash(password){
    return crypto.createHmac('sha256', process.env.SECRET_KEY).update(password).digest('hex');
}

Account.statics.findByUser = function (username) {
    return this.findOne({'profile.username':username}).exec();
};

Account.statics.findByEmail = function (email) {
    return this.findOne({email}).exec();
};
 
Account.statics.findByEmailOrUsername = function ({ username, email }){
    return this.findOne({
        $or: [
            {
                'profile.username': username
            },
            {email}
        ]
    }).exec()
};

Account.statics.localRegister = function ({username, email, password}){
    const account = new this({
        profile: {
            username
        },
        email,
        password: hash(password)
    });
    return account.save();
};

Account.methods.validatePassword = function (password) {
    const hashed = hash(password);
    return this.password === hashed;
};

Account.methods.generateToken = function() {
    // JWT 에 담을 내용
    const payload = {
        _id: this._id,
        profile: this.profile
    };

    return generateToken(payload, 'account');
};

module.exports=mongoose.model('Account', Account);
