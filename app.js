var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Setup mqtt stuff
const MQTTService = require('./services/MQTTService');

const m5goSetup = require('./mqtt/m5go');
m5goSetup(MQTTService);

const arduinoSetup = require('./mqtt/arduino');
arduinoSetup(MQTTService);

const keypadSetup = require('./mqtt/keypad');
keypadSetup(MQTTService);

const doorSetup = require('./mqtt/door');
doorSetup(MQTTService);

const camSetup = require('./mqtt/cam');
camSetup(MQTTService);

module.exports = app;
