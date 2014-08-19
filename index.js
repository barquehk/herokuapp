var express = require('express')
  , everyauth = require('everyauth')
  , conf = require('./conf')
  , everyauthRoot = './';

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


everyauth
  .facebook
    .appId(conf.fb.appId)
    .appSecret(conf.fb.appSecret)
    .findOrCreateUser( function (session, accessToken, accessTokenExtra, fbUserMetadata) {
      return usersByFbId[fbUserMetadata.id] ||
        (usersByFbId[fbUserMetadata.id] = addUser('facebook', fbUserMetadata));
    })
    .redirectPath('/');


var app = express();
app.use(express.static(__dirname + '/public'))
  .use(bodyParser.json())
  .use(cookieParser('htuayreve'))
  .use(session())
  .use(everyauth.middleware());

app.set('view engine', 'jade');
app.set('views', everyauthRoot + 'views');

app.get('/', function (req, res) {
  res.render('home');
});

app.listen((process.env.PORT || 5000));

console.log('Go to http://local.host:' + (process.env.PORT || 5000));

module.exports = app;
