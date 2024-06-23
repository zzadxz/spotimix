const express = require('express');
const path = require('path');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const session = require('express-session');
const axios = require('axios');
const cron = require('node-cron');

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
    res.redirect('/');
  }
);

app.get('/api/playlists', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

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

app.get('/api/copy-playlists', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { accessToken } = req.user;

    await copyPlaylists(accessToken);

    res.send('Playlists copied successfully!');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Playlist copying functions

async function copyPlaylists(accessToken) {
  const dailyMixes = await getDailyMixes(accessToken);
  const weeklyDiscoveries = await getWeeklyDiscoveries(accessToken);

  await copyDailyMixes(dailyMixes, accessToken);
  await copyWeeklyDiscoveries(weeklyDiscoveries, accessToken);
}

async function getDailyMixes(accessToken) {
  const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return response.data.items.filter(playlist => playlist.name.includes('Daily Mix'));
}

async function getWeeklyDiscoveries(accessToken) {
  const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return response.data.items.filter(playlist => playlist.name.includes('Discover Weekly'));
}

async function copyDailyMixes(dailyMixes, accessToken) {
  for (const mix of dailyMixes) {
    const playlistName = `Daily Mix ${dailyMixes.indexOf(mix) + 1}`;
    await copyPlaylist(mix, playlistName, accessToken);
  }
}

async function copyWeeklyDiscoveries(weeklyDiscoveries, accessToken) {
  for (const discovery of weeklyDiscoveries) {
    const playlistName = `Weekly Discoveries`;
    await copyPlaylist(discovery, playlistName, accessToken);
  }
}

async function copyPlaylist(playlist, newName, accessToken) {
  const userId = playlist.owner.id;
  const createPlaylistResponse = await axios.post(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    name: newName,
    public: false
  }, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const newPlaylistId = createPlaylistResponse.data.id;

  const tracksResponse = await axios.get(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const trackUris = tracksResponse.data.items.map(item => item.track.uri);

  await axios.post(`https://api.spotify.com/v1/playlists/${newPlaylistId}/tracks`, {
    uris: trackUris
  }, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}

app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
