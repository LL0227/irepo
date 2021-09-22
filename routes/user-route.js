'use strict';

const _ = require('lodash');
const util = require('util');
const fs = require('fs');
const express = require('express');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const unlink = util.promisify(fs.unlink);

const router = express.Router();

const getUserConfigFile = (userid) => {
    return 'users/' + userid + '/config.json';
};

router.get('/:userid/images', async (req, res, next) => {
    let userid = req.params.userid;
    let filePath = getUserConfigFile(userid);

    try {
        let data = await readFile(filePath);
        let userConfig = JSON.parse(data.toString());
        let images = userConfig.images ? userConfig.images : [];

        res.status(200).json(images);
    } catch (err) {
        res.status(200).json([]);
    }
});

router.delete('/:userid/images/:imageId', async (req, res, next) => {
    let userid = req.params.userid;
    let imageId = req.params.imageId;
    let filePath = getUserConfigFile(userid);

    try {
        let data = await readFile(filePath);
        let userConfig = JSON.parse(data.toString());
        let images = userConfig.images ? userConfig.images : [];
        let image = _.find(images, { id: imageId });

        if (image) {
            let p = 'users/' + userid + '/images/' + image.filename;
            try {
               await unlink(p);
            } catch (err) {
                // ignored if the image does not exist
            }

            let removedImage = _.remove(images, (img) => { 
                return img.id == imageId; 
            }); 
        }

        await writeFile(filePath, JSON.stringify(userConfig, null, 4));

        res.status(200).json({
            success: true,
            message: 'The image has been deleted.'
        });
    } catch (err) {
        res.status(200).json({
            success: false,
            message: err.message
        });
    }
});

module.exports = router;
