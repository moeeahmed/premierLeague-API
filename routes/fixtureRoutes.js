const express = require('express');
const tableController = require('../controller/tableController');
const fixtureController = require('../controller/fixtureController');
const authController = require('../controller/authController');

const router = express.Router();

//Route to update the table
router
  .route('/updateTable')
  .put(authController.protect, tableController.updateTable);

//Route to update the fixtures
router.route('/updateFixture').patch(fixtureController.updateFixture);

//Route to update the fixtures
router
  .route('/updateStatistics')
  .patch(authController.protect, fixtureController.updateFixtureStats);

//Route to get a specific fixture
router.route('/getFixtures/:fixture').get(fixtureController.getFixtures);

//Route to get a average stats for a team
router.route('/getAverageStats/:team').get(fixtureController.getAverageStats);

router
  .route('/getTableFromFixtures')
  .get(fixtureController.makeTableFromFixtures);

module.exports = router;
