require('dotenv').config();
const express = require('express');
const passport = require('passport');
require('./auth');
const session = require('express-session');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 5000;

app.use(session({ secret: 'spotimix_secret', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.send('Spotimix Backend');
});

app.get('/auth/spotify', passport.authenticate('spotify', { scope: ['user-read-email', 'playlist-read-private', 'user-read-playback-state', 'user-modify-playback-state'] }));

app.get(
  '/auth/spotify/callback',
  passport.authenticate('spotify', { failureRedirect: '/' }),
  (req, res) => {
    console.log('Authenticated user:', req.user);
    res.redirect('/playlists');
  }
);

app.get('/playlists', (req, res) => {
  if (!req.user || !req.user.accessToken) {
    return res.status(401).send('Not authenticated');
  }

  console.log('Fetching playlists for user:', req.user.profile.displayName);

  axios.get('https://api.spotify.com/v1/me/playlists', {
    headers: {
      Authorization: `Bearer ${req.user.accessToken}`
    }
  })
  .then(response => {
    console.log('Playlists fetched:', response.data);
    res.json(response.data);
  })
  .catch(error => {
    console.error('Error fetching playlists:', error);
    res.status(500).send(error);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
