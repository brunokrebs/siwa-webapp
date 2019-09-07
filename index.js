const express = require("express");
const session = require("express-session");
const passport = require("passport");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const Auth0Strategy = require('passport-auth0');

const port = process.env.PORT || 3000;

const app = express();

app.use(
  session({
    secret: "secret",
    saveUninitialized: false,
    resave: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

const strategy = new Auth0Strategy(
  {
    domain: "login.brunokrebs.com",
    clientID: 'sdsYQI5cA6HkV4XJoUqITL6Hf4fzx5HD',
    clientSecret: 'UQxnfpvcxz8gBcTP-9fWPpjprG122_gO8sMwK67HgsUBCpo2KT8Vth5vKKABEBby',
    callbackURL: "https://brunokrebs.com/callback"
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

app.use(strategy);

passport.use(
  "apple",
  new OAuth2Strategy(
    {
      authorizationURL: "https://appleid.apple.com/auth/authorize",
      tokenURL: "https://appleid.apple.com/auth/token",
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALLBACK,
      state: Date.now() // bleh
    },
    (accessToken, refreshToken, payload, profile, done) => {
      done(null, { profile, payload });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
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
  console.log("User", req.user);
  res.send(JSON.stringify({ Hello: "World" }));
});

app.listen(port, () => {
  console.log(`Apple Login POC listening on port ${port}!`);
});
