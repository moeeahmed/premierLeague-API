const express = require('express');
const userController = require('../controller/userController');
const authController = require('../controller/authController');
const rateLimit = require('express-rate-limit');
const AppError = require('../utils/appError');

//middleware

const router = express.Router();

//Routes for authentication
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post(
  '/forgotPassword',
  rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 5,
    message: new AppError('No more resets can be requesed until tomorrow', 429),
  }),
  authController.forgotPassword
);
router.patch('/resetPassword', authController.resetPassword);

//Routes for updating anything to do with settings
router.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword
);
router.patch(
  '/updateDetails',
  authController.protect,
  userController.uploadPhoto,
  userController.resizePhoto,
  userController.updateDetails
);

router
  .route('/deleteAccount')
  .delete(authController.protect, authController.deleteAccount);

router.route('/getUser').get(authController.protect, userController.getUser);

router
  .route('/getAllUsers')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    userController.getAllUsers
  );

module.exports = router;
