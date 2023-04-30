const path = require('path');

const express = require('express');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');

const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const fixtureRoutes = require('./routes/fixtureRoutes');
const userRouter = require('./routes/userRoutes');
const playersRouter = require('./routes/playersRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');

const cookieParser = require('cookie-parser');

const app = express();

app.enable('trust proxy');

//view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// LOBAL MIDDLEWARES
//Implement CORS
//Access-Control-Allow-Origin *
app.use(cors());

// Set security HTTP headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'http://127.0.0.1:9000/*'],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'", 'https:', 'http:', 'blob:'],
      styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
      upgradeInsecureRequests: [],
    },
  })
);

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

app.use(compression());

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 3_600_000,
  message:
    'Maximum number of requested reached. You can only make 100 requests per hour',
});

// Body parser, reading data from body into req.body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.locals.moment = require('moment');

// -- ROUTES --
app.use('/api/v1/fixture', limiter, fixtureRoutes);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/players', playersRouter);

//Handle any
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find that URL on this server`, 404));
});

//ERROR handling middleware
app.use(globalErrorHandler);

module.exports = app;
