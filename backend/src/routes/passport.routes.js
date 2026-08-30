'use strict';

const express = require('express');
const { createUpload } = require('../middleware/upload');
const passport = require('../controllers/passport.controller');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();
const upload = createUpload('image');

// List available passport presets
router.get('/passport-photo/presets', passport.listPresets);

router.post('/passport-photo', upload, asyncHandler(passport.passportPhoto));

module.exports = router;
