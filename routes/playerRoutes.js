const express = require('express');
const playersController = require('../controller/playersController');
const AppError = require('../utils/appError');

//middleware
const router = express.Router();

router.route('/getAllUsers').get(playersController.getAllPlayers);

module.exports = router;
