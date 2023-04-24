const express = require('express');
const fixtureController = require('../controller/fixtureController');
const authController = require('../controller/authController');

const router = express.Router();

//Route to update the fixtures
router
  .route('/updateFixture')
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    fixtureController.updateFixture
  );

//Route to get a specific fixture
router.route('/getFixtures').get(fixtureController.getFixture);

//Route to get a average stats for a team
router.route('/getAverageStats').get(fixtureController.getAverageStats);

//Get current table standing
router.route('/home').get(fixtureController.getHome);

//Get current table standing
router.route('/fixtures').get(fixtureController.getAllFixtures);

//Get all past fixtures that need score updating
router
  .route('/getScoresToUpdate')
  .get(authController.protect, fixtureController.getScoresToUpdate);

//Route to update the fixtures
router
  .route('/updateStatistics')
  .patch(authController.protect, fixtureController.updateFixtureStats);

//Get all past fixtures that need score updating
router
  .route('/getStatsToUpdate')
  .get(authController.protect, fixtureController.getStatsToUpdate);

module.exports = router;
