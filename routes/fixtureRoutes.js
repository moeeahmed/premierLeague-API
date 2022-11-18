const express = require('express');
const fixtureController = require('../controller/fixtureController');
const authController = require('../controller/authController');

const router = express.Router();

//Route to update the fixtures
router.route('/updateFixture').patch(fixtureController.updateFixture);

//Route to update the fixtures
router
  .route('/updateStatistics')
  .patch(authController.protect, fixtureController.updateFixtureStats);

//Route to get a specific fixture
router.route('/getFixtures').get(fixtureController.getFixture);

//Route to get a average stats for a team
router.route('/getAverageStats/:team').get(fixtureController.getAverageStats);

//Get current table standing
router.route('/tableStanding').get(fixtureController.tableStanding);

module.exports = router;
