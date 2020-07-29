const AppError = require('../utils/appError');

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const handleJWTError = () =>
  new AppError('Invalid token. PLease log in again!', 401);

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.message.match(/(["'])(?:\\.|[^\\])*?\1/)[0];
  const message = `Duplicate field value : ${value}. Please use another value! `;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    /**A)FOR THE API */
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  /**B)FOR RENDERED WEBSITE */
  console.error('ERROR 🤯', err);

  return res.status(err.statusCode).render('error', {
    title: 'Something went very wrong!',
    msg: err.message,
  });
};
const sendErrorProd = (err, req, res) => {
  /**A)FOR THE API */
  if (req.originalUrl.startsWith('/api')) {
    //A).a) Operational,trusted error : send message to the client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //A).b)Programming or other unknown error : we don't leak error details
    //1) Log the error
    console.error('ERROR 🤯', err);

    //2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }

  /**B)FOR RENDERED WEBSITE */
  if (err.isOperational) {
    //B).a) Operational,trusted error : send rendered error template with a message to the client

    return res.status(err.statusCode).render('error', {
      title: 'Something went very wrong!',
      msg: err.message,
    });
  }

  //B).b)Programming or other unknown error : we don't leak error details
  //1) Log the error
  console.error('ERROR 🤯', err);

  //2) Send the rendered error template with a generic message

  return res.status(err.statusCode).render('error', {
    title: 'Something went very wrong!',
    msg: 'Please Try Again Later.',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { name: err.name, message: err.message };
    error = Object.assign(error, err);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
