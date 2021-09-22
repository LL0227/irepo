'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const config = require('config');
const jwt = require('jsonwebtoken');

module.exports.login = async (email, password) => {
    let user = await _.find(config.users, {email: email});

    if (user) {
        if (user.password === password) {
            const info = {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            };
            info.access_token = createToken(info);
            return info;
        }
    }

    return null;
};

function createToken(user) {
    let options = {};

    // "expiresIn" contains the number of seconds since the epoch.
    options.expiresIn = config.jwt.expiresInMinutes * 60;
    options.issuer = config.jwt.issuer;

    let message = {
        id: user.id,
        email: user.email
    };
    let secretBase64 = Buffer.from(config.jwt.secret).toString('base64');

    // Create a JWT
    let token = jwt.sign(message, secretBase64, options);

    return token;
}
