const express = require("express");
const session = require("express-session");
const passport = require("passport");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const Auth0Strategy = require('passport-auth0');

const app = express();

app.use(
  session({
    secret: "secret",
    saveUninitialized: false,
    resave: false
  })
);

const strategy = new Auth0Strategy(
  {
    domain: "login.digituz.com.br",
    clientID: 'sdsYQI5cA6HkV4XJoUqITL6Hf4fzx5HD',
    clientSecret: 'UQxnfpvcxz8gBcTP-9fWPpjprG122_gO8sMwK67HgsUBCpo2KT8Vth5vKKABEBby',
    callbackURL: "https://digituz.com.br/callback"
  },
  function(accessToken, refreshToken, extraParams, profile, done) {
    /**
     * Access tokens are used to authorize users to an API
     * (resource server)
     * accessToken is the token to call the Auth0 API
     * or a secured third-party API
     * extraParams.id_token has the JSON Web Token
     * profile has all the information from the user
     */
    return done(null, profile);
  }
);

passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

const domainAssociation = fs.readFileSync(
  "./apple-developer-domain-association.txt",
  "utf8"
);

app.get("/.well-known/apple-developer-domain-association.txt", (req, res) => {
  res.send(domainAssociation);
});

app.get(
	'/login',
	passport.authenticate('auth0', {scope: 'openid email profile'}),
	function (req, res) {
		res.redirect('/');
	}
);

app.get(
  "/callback",
  passport.authenticate(strategy, {
    successRedirect: "/",
    failureRedirect: "/login"
  })
);

app.get("/profile", (req, res) => {
  res.send(
    jwt.decode(req.session.passport.user.payload.id_token, { complete: true })
  );
});

app.get("/", (req, res) => {
  res.send('<a href="/login">Login</a>');
});

app.listen(3000, () => {
  console.log(`Apple Login POC listening on port 3000!`);
});