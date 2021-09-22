'use strict';

const _ = require('lodash');
const config = require('config');
const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const favicon = require('serve-favicon');

const uploader = multer({
    dest: './uploads/'
});
// expose this object BEFORE importing routes
module.exports.uploader = uploader;

const auth = require('./middlewares/auth.js');

const loginRoute = require('./routes/login-route');
const logoutRoute = require('./routes/logout-route');
const userRoute = require('./routes/user-route');
const uploaderRoute = require('./routes/uploader-route');
const viewerRoute = require('./routes/viewer-route');

///////////////////////////////////////////////////////////////////////////////
// Set up app

const app = express();
const env = app.get('env');

console.log('env: ' + env);

app.use(favicon(path.join(__dirname, 'favicon.ico')));

// CORS-enable for all origins
app.use(cors({allowedHeaders: ['jwt-token']}));

app.use(bodyParser.urlencoded({extended: false, limit: '10mb'}));
app.use(bodyParser.json({limit: '25mb'}));
app.use(bodyParser.text());

app.use(cookieParser());

app.get('/favicon.ico', function(req, res) {
    return res.sendStatus(204);
});

const dist = path.resolve(__dirname, 'ui');
app.use(express.static(dist));

console.log('Working directory: ' + __dirname);

///////////////////////////////////////////////////////////////////////////////
// routes
///////////////////////////////////////////////////////////////////////////////

app.use('/v1/login', loginRoute);
app.use('/v1/viewer', viewerRoute);

///////////////////////////////////////////////////////////////////////////////
// Everything after this middleware will be authenticated!
///////////////////////////////////////////////////////////////////////////////

function startServer() {
    let port = config.http.port;

    // Create the Express server.
    let httpServer = http.createServer(app);

    setupSecuredRoutes();

    httpServer.listen(port, (error) => {
        if (error) {
            console.log(error);
        } else {
            let msg = 'API Gateway listening on port ' + httpServer.address().port;
            console.log(msg);
        }
    });
}

function setupSecuredRoutes() {
    app.use(auth);

    app.use(function(req, res, next) {
        res.set({ 'Cache-Control': 'no-cache, no-store, must-revalidate' });
        next();
    });

    // These APIs require auth
    app.use('/v1/logout', logoutRoute);
    app.use('/v1/users', userRoute);
    app.use('/v1/uploader', uploaderRoute);

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        let err = new Error('Not Found: ' + req.url);
        err.status = 404;
        next(err);
    });
}

startServer();

module.exports.app = app;
