const express = require('express');
const userController = require('../controller/userController');
const authController = require('../controller/authController');

const router = express.Router();

//Routes for authentication
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
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
  .route('/deleteUser')
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    userController.deleteUser
  );

router
  .route('/getAllUsers')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    userController.getAllUsers
  );

module.exports = router;
