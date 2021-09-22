'use strict';

const Promise = require('bluebird');

module.exports.methodNotAllowedHandler = (methods = ["HEAD"]) => {
    return (req, res, next) => {
        res.set("Allow", ["HEAD", ...methods].join(", "));
        return res.status(405).send({
            success: false,
            message: `The ${req.method} method for the '${req.originalUrl}' route is not supported.`
        });
    };
};

module.exports.wrap = (fn) => {
    return async (req, res, next) => {
        return Promise.resolve(fn(req, res, next)).catch((err) => {
            return res.status(500).send({
                success: false,
                message: `Error occured in processing '${req.originalUrl}' request`
            });
        });
    };
};