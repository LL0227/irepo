'use strict';

const config = require('config');
const jwt = require('jsonwebtoken');

const validateToken = (token, req, res, next) => {
    const secretBase64 = Buffer.from(config.jwt.secret).toString('base64');

    // Verify issuer
    try {
        const decoded = jwt.verify(token, secretBase64, {
            issuer: config.jwt.issuer
        });
        req.userid = decoded.id;
        req.email = decoded.email;
        req.access_token = token;

        // continue
        next();
    } catch (err) {
        console.log(err);
        let msg = (err instanceof jwt.TokenExpiredError) ? 
            'JWT token has expired' : 'Invalid JWT token';
        res.status(401).json({
            success: false,
            message: msg
        });
    }
};

const auth = (req, res, next) => {
    const authHeader = req.headers['jwt-token'];

    if (authHeader) {
        return validateToken(authHeader, req, res, next);
    }

    return res.status(401).json({
        success: false,
        message: 'Required JWT token is missing'
    });
};

module.exports = auth;
