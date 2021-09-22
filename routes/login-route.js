'use strict';

const express = require('express');
const routeHandler = require('../middlewares/route-handler');
const userLogic = require('../logics/user-logic');

const router = express.Router();

router.post('/', routeHandler.wrap(async (req, res) => {
    const payload = req.body;

    console.log(`Process [User] login request - { "Parameters": { "Email": ${payload.email} }, "Method": ${req.method} }`);

    const result = await userLogic.login(payload.email, payload.password);
    if (result) {
        const resp = {
            success: true,
            userid: result.id,
            email: result.email,
            firstName: result.firstName,
            lastName: result.lastName,
            access_token: result.access_token
        };
        return res.status(200).json(resp);
    } else {
        return res.status(200).json({
            success: false,
            message: 'Please provide correct credentials.'
        });
    }
}));

module.exports = router;
