const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');

//User schema
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
  },
  email: {
    type: String,
    required: [true, 'Please enter your name'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email'],
  },
  photo: { type: String, default: 'default.jpg' },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password; //check if both passwords are equal
      },
      message: 'Passwords must match',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
  },
});

//middleware runs between getting data and saving it to database
//checks for passowrd modifications
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  //hash the password
  this.password = await bcrypt.hash(this.password, 12);

  //remove passwordConfirm so it doesn't persist in the DB
  this.passwordConfirm = undefined;

  if (this.isNew) return next();
  //ensure token is created after password has been changed
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre('find', function (next) {
  this.find({ active: { $ne: false } });
  next();
});

//instance method to check if password is correct
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//instance method to check if password was changed after JWT was issued
userSchema.methods.changedPassword = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    //if time JWT was issued occured earlier than when password was changed
    return JWTTimestamp < parseInt(this.passwordChangedAt.getTime() / 1000, 10);
  }

  return false;
};

//instance method to create new password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
