'use strict';

const express = require('express');
const config = require('../config');

const router = express.Router();

// Lightweight liveness for Docker HEALTHCHECK / load balancers
router.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

module.exports = router;
