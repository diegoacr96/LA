const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose')

const bodyParser = require('body-parser');
var messageRouter = require('./routes/message');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');

const catFacts = require('./middelwares/catfacts')

var app = express();

mongoose.set('useCreateIndex', true)

mongoose.connect('mongodb://localhost:27017/LAusers', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});


app.use('/uploads', express.static('uploads', ))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(catFacts)
app.use('/users', usersRouter);
app.use('/authorization', loginRouter);
app.use('/messages', messageRouter);

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

module.exports = app;
