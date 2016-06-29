//app setup
var express = require('express');
var app = express();
var path = require('path');
var favicon = require('serve-favicon');

//middleware
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var request = require('request');
var expressSession = require('express-session');

//passport
var passport = require('passport')
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
require('dotenv').load();

//routes
var routes = require('./routes/index');
var users = require('./routes/users');
var auth = require('./routes/auth');
var jobs = require('./routes/jobs');
var login = require('./routes/login');
var signup = require('./routes/signup');




// view engine setup
app.set('views', path.join(__dirname, 'views'));
console.log(__dirname);
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, '/public/images/favicomatic/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: [
    process.env.SESSION_KEY1,
    process.env.SESSION_KEY2,
    process.env.SESSION_KEY3
  ]
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(expressSession({ secret: 'secret here',
resave: true,
saveUninitialized: true }));

passport.serializeUser(function(user, done) {
    //later this will be where you selectively send to the browser an identifier for your user, like their primary key from the database, or their ID from linkedin
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    //here is where you will go to the database and get the user each time from it's id, after you set up your db
    done(null, obj);
});

passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret:process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: process.env.HOST + "/auth/linkedin/callback",
  scope: ['r_emailaddress', 'r_basicprofile'],
  state:true
}, function(accessToken, refreshToken, profile, done) {
    return done(null, {id:profile.id, displayName: profile.displayName, token: accessToken});
}));




app.use(function (req, res, next) {
  if (req.session.passport) res.locals.user = req.session.passport.user || null;
  next()
});

app.use('/', routes);
app.use('/auth', auth);
app.use('/users', users);
app.use('/jobs', jobs);
app.use('/login', login);
app.use('/signup', signup);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
