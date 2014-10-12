// This is the entry of herokuapp

var express = require('express')
  , everyauth = require('everyauth')
  , conf = require('./conf')
  , everyauthRoot = './'
  , serveIndex = require('serve-index');



// this is for testing the support of jsdom in heroku
var jsdom = require('jsdom');
jsdom.env (
    'http://nodejs.org/dist/',
    ['http://code.jquery.com/jquery.js'],
    function(errors, window){
      console.log('there have been', window.$('a').length, 'nodejs releases!');
    }    
    );
// this is for testing
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

everyauth.debug = true;

var usersById = {};
var nextUserId = 0;

function addUser (source, sourceUser) {
  var user;
  if (arguments.length === 1) { // password-based
    user = sourceUser = source;
    user.id = ++nextUserId;
    return usersById[nextUserId] = user;
  } else { // non-password-based
    user = usersById[++nextUserId] = {id: nextUserId};
    user[source] = sourceUser;
  }
  return user;
}

var usersByFbId = {};

everyauth.everymodule
  .findUserById( function (id, callback) {
    callback(null, usersById[id]);
  });


everyauth.use(require("everyauth-facebook"));

everyauth
  .facebook
    .appId(conf.fb.appId)
    .appSecret(conf.fb.appSecret)
    .callbackPath('/auth/facebook/callback')
    .findOrCreateUser( function (session, accessToken, accessTokenExtra, fbUserMetadata) {
      return usersByFbId[fbUserMetadata.id] ||
        (usersByFbId[fbUserMetadata.id] = addUser('facebook', fbUserMetadata));
    });


var app = express();
app.use(express.static( './public'))
  .use(bodyParser.urlencoded({extended: true}))
  .use(bodyParser.json())
  .use(cookieParser('htuayreve'))
  .use(session({
          secret: 'htuayreve',
          resave: true,
          saveUninitialized: true}))
  .use(everyauth.loadUser())
  .use(everyauth.addRequestLocals('user'))
  .use('/jqplot', serveIndex('public/jqplot',{'icons':true}))
  .use('/userscript', serveIndex('public/userscript',{'icons':true}));

app.set('view engine', 'jade');
app.set('views', everyauthRoot + 'views');

app.get('/', function (req, res) {
  res.render('home');
});

app.get('/auth/facebook',
                everyauth.facebook.middleware('entryPath'),
                function(err, req, res, next) {
                  res.render('auth-fail.jade', {
                    error: err.toString()
                  });
                });
app.get('/auth/facebook/callback',
                everyauth.facebook.middleware('callbackPath'),
                function(req, res, next){
                  res.redirect('/');
                },
                function(err, req, res, next){
                  console.log(err.stack);
                  res.render('auth-fail.jade', {
                    error: err.toString()
                  });
                });

app.listen((process.env.PORT || 5000));

console.log('Go to http://local.host:' + (process.env.PORT || 5000));

module.exports = app;
