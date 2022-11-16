const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWK_COOKIE_EXPIRES_IN * 86_400_000
    ),
    secure: true,
    httpOnly: true,
    secure: req.secure || req.headers('x-forwarded-proto') === 'https',
  };

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  //Check if user exist and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  //send jwt to client
  createSendToken(user, 200, req, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expiresIn: new Date(Date.now() + 5000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  //check if password matches existing password
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Old password does not match', 500));
  }

  //update password
  Object.assign(user, req.body);

  await user.save();

  createSendToken(user, 200, req, res);
});

//forgot password route middleware
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //get user based on posted email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('User does not exist', 400));
  }

  //genereate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //send reset token to the users email
  const resetURL = `${req.protocol}://${req.get('host')}/account/resetPassword`;

  try {
    await new Email(user, resetURL, resetToken).sendPasswordReset();
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Please try again later',
        500
      )
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'Reset Token Sent',
  });
});

//reset the password
exports.resetPassword = catchAsync(async (req, res, next) => {
  //get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.body.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //if token has not expired, and user exists, set new password
  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }

  //update changedPasswordAt property for user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password reset. Account recovered',
  });
});

//middleware function to protect unauthorised access
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //get token & check if it exists
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not authorised to carry out this action', 401)
    );
  }

  //verify the token
  const payloadDecoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  //check if user exists in DB
  const user = await User.findById(payloadDecoded.id);
  if (!user) {
    return next(
      new AppError('The user associated with the token no longer exists', 401)
    );
  }

  //check if user changed password after token was issued
  if (user.changedPassword(payloadDecoded.iat)) {
    return next(
      new AppError(
        'Password was changed recently, please login in with the new password',
        401
      )
    );
  }

  //grant access to the protected middleware
  res.locals.user = user;
  req.user = user;
  next();
});

//restrict certain routes to user with correct clearances
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles {'admin','users'} currently
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perfom this action', 403)
      );
    }

    next();
  };
};

//Only for rendered pages
exports.isLoggedIn = async (req, res, next) => {
  let token;
  //get token & check if it exists
  if (req.cookies.jwt) {
    try {
      token = req.cookies.jwt;

      //verify the token
      const payloadDecoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );

      //check if user exists in DB
      const user = await User.findById(payloadDecoded.id);

      if (!user) {
        return next();
      }

      //check if user changed password after token was issued
      if (user.changedPassword(payloadDecoded.iat)) {
        return next();
      }

      //there is a logged in user
      res.locals.user = user;
      return next();
    } catch (err) {
      return next();
    }
  }
  //there are no logged in user
  next();
};
