const express = require('express');
const path = require('path');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const session = require('express-session');
const axios = require('axios');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(session({ secret: 'secret', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(
  new SpotifyStrategy(
    {
      clientID: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      callbackURL: 'http://localhost:5000/auth/spotify/callback'
    },
    (accessToken, refreshToken, expires_in, profile, done) => {
      profile.accessToken = accessToken;
      return done(null, profile);
    }
  )
);

app.get('/auth/spotify', passport.authenticate('spotify', { scope: ['user-read-email', 'user-read-private', 'playlist-read-private'] }));

app.get(
  '/auth/spotify/callback',
  passport.authenticate('spotify', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/playlists');
  }
);

app.get('/playlists', (req, res) => {
  const { accessToken } = req.user;
  axios
    .get('https://api.spotify.com/v1/me/playlists', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    .then(response => res.json(response.data))
    .catch(error => res.status(500).send(error));
});

app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
