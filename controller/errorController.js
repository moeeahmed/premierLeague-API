const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

//Handles any duplication client posts
//Returns meainingful string to the client
const handleDuplicateFieldsDB = (err) => {
  const message = `${
    Object.values(err.keyValue)[0]
  } already in use. Please use another ${Object.keys(err.keyValue)[0]}.`;
  return new AppError(message, 400);
};

//Handles any invlaid/ expired JWT
const handleJWTError = (err) =>
  new AppError(
    err.name === 'TokenExpiredError' ? 'token expired' : 'Unauthorised Access',
    401
  );

//Handles all validation errors and joins them in a single string
//Returns that string to the client
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;

  return new AppError(message, 400);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  console.log(err);

  let error = { name: err.name, ...err };

  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')
    error = handleJWTError(error);

  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
};
