'use strict';

const fs = require('fs');
const express = require('express');

const router = express.Router();

const getContentType = (filename) => {
    let pos = filename.lastIndexOf('.');
    let ext = (pos != -1) ? filename.substring(pos+1) : null;
    let ct = null;

    if (ext) {
        ext = ext.toLowerCase();
        if (ext === 'gif') {
            ct = 'image/gif';
        } else if (ext === 'jpg' || ext === 'jpeg') {
            ct = 'image/jpeg';
        } else if (ext === 'png') {
            ct = 'image/png';
        } else {
            ct = 'application/octet-stream';
        }
    } else {
        ct = 'application/octet-stream';
    }

    return ct;
};

const streamFile = (filePath, res) => {
    const contentType = getContentType(filePath);

    res.writeHead(200, {'Content-Type': contentType});
    fs.createReadStream(filePath).pipe(res);
};

router.get('/:userid/images/:filename', (req, res, next) => {
    let userid = req.params.userid;
    let filename = req.params.filename;
    let filePath = 'users/' + userid + '/images/' + filename;

    streamFile(filePath, res);
});

module.exports = router;
