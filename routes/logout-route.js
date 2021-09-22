'use strict';

const express = require('express');

const router = express.Router();

router.post('/', (req, res, next) => {
    res.status(200).json({
        success: true,
        message: 'You have logged out successfully.'
    });
});

module.exports = router;
