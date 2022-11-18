const express = require('express');
const viewController = require('../controller/viewController');
const authController = require('../controller/authController');

const router = express.Router();

//Home page
router.get('/', authController.isLoggedIn, viewController.getHome);

//Authentication pages
router.get('/login', viewController.login);
router.get('/sign-up', viewController.signUp);
router.get('/account/resetPassword', viewController.resetPassword);
router.get(
  '/account/settings',
  authController.isLoggedIn,
  viewController.accountSettings
);
router.get(
  '/admin/manage-users',
  authController.protect,
  viewController.manageUsers
);
router.get(
  '/fixtures',
  authController.isLoggedIn,
  viewController.getAllFixtures
);

router.get(
  '/admin/update-stats',
  authController.protect,
  viewController.updateStats
);

router.get(
  '/admin/update-scores',
  authController.protect,
  viewController.updateScore
);

module.exports = router;
