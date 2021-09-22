'use strict';

const _ = require('lodash');
const config = require('config');
const fs = require('fs');
const util = require('util');
const express = require('express');
const uploader = require('../app').uploader;

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const copyFile = util.promisify(fs.copyFile);
const exists = util.promisify(fs.exists);
const unlink = util.promisify(fs.unlink);

const router = express.Router();

const formalizeFilename = (filename) => {
    // Remove all spaces in the filename
    let fn = filename.split(/\s+/).join('');
    let pos = fn.lastIndexOf('.');
    let ext = (pos !== -1) ? fn.substring(pos+1) : null;

    // Change the extension to lower case
    if (ext) {
        ext = ext.toLowerCase();
        return fn.substring(0, pos) + '.' + ext;
    }

    return fn;
};

// Upload an image
router.post('/', uploader.array('files[]', 1), async (req, res, next) => {
    let userid = req.userid;
    let file = req.files[0];
    let srcPath = file.path;
    let filename = formalizeFilename(file.originalname);
    let dstPath = 'users/' + userid + '/images/' + filename;
    let filePath = 'users/' + userid + '/config.json';

    try {
        let data = await readFile(filePath);
        let userConfig = JSON.parse(data.toString());

        if (!userConfig.images) {
            userConfig.images = [];
        }

        userConfig.images.push({
            id: filename,
            filename: filename
        });

        await copyFile(srcPath, dstPath);
        await unlink(srcPath);
        await writeFile(filePath, JSON.stringify(userConfig, null, 4));

        let url = '/v1/users/' + userid + '/images/' + filename;

        res.status(200).json({
            success: true,
            message: 'The image has been uploaded successfully.',
            url: url
        });
    } catch (err) {
        let found = await exists(srcPath);
        if (found) {
            await unlink(srcPath);
        }
        res.status(200).json({
            success: false,
            message: err.message
        });
    }
});

module.exports = router;