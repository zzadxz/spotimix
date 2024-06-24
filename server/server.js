const express = require('express');
const path = require('path');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const session = require('express-session');
const axios = require('axios');
const cron = require('node-cron');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001; // Change the port to 5001 or any available port

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
      callbackURL: 'http://localhost:5001/auth/spotify/callback' // Update callback URL port
    },
    (accessToken, refreshToken, expires_in, profile, done) => {
      profile.accessToken = accessToken;
      return done(null, profile);
    }
  )
);

app.get('/auth/spotify', passport.authenticate('spotify', { scope: ['user-read-email', 'user-read-private', 'playlist-read-private', 'playlist-modify-private', 'playlist-modify-public'] }));

app.get(
  '/auth/spotify/callback',
  passport.authenticate('spotify', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

app.get('/playlists', (req, res) => {
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

app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Playlist making process

// Route to copy Daily Mix and Weekly Discovery playlists
app.get('/copy-playlists', async (req, res) => {
  try {
    const { accessToken } = req.user;

    // Fetch and copy playlists
    console.log(`Copying playlists with accessToken: ${accessToken}`);
    await copyPlaylists(accessToken);

    res.send('Playlists copied successfully!');
  } catch (error) {
    console.error('Error copying playlists:', error);
    res.status(500).send(error.message);
  }
});

// Function to copy playlists
async function copyPlaylists(accessToken) {
  try {
    console.log('Getting Daily Mixes');
    const dailyMixes = await getDailyMixes(accessToken);
    console.log('Daily Mixes:', dailyMixes);

    console.log('Getting Weekly Discoveries');
    const weeklyDiscoveries = await getWeeklyDiscoveries(accessToken);
    console.log('Weekly Discoveries:', weeklyDiscoveries);

    console.log('Copying Daily Mixes');
    await copyDailyMixes(dailyMixes, accessToken);

    console.log('Copying Weekly Discoveries');
    await copyWeeklyDiscoveries(weeklyDiscoveries, accessToken);
  } catch (error) {
    console.error('Error in copyPlaylists:', error);
    throw error;
  }
}

// Schedule cron job to run every day at midnight to update playlists
cron.schedule('0 0 * * *', async () => {
  try {
    const users = await getAllUsers(); // Function to get all user tokens from the database

    for (const user of users) {
      console.log(`Updating playlists for user: ${user.id}`);
      await copyPlaylists(user.accessToken);
    }
  } catch (error) {
    console.error('Error in cron job:', error);
  }
});

// Function to get Daily Mix playlists
async function getDailyMixes(accessToken) {
  try {
    const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    return response.data.items.filter(playlist => playlist.name.includes('Daily Mix'));
  } catch (error) {
    console.error('Error getting Daily Mixes:', error);
    throw error;
  }
}

// Function to get Weekly Discovery playlists
async function getWeeklyDiscoveries(accessToken) {
  try {
    const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    return response.data.items.filter(playlist => playlist.name.includes('Discover Weekly'));
  } catch (error) {
    console.error('Error getting Weekly Discoveries:', error);
    throw error;
  }
}

// Function to copy Daily Mix playlists
async function copyDailyMixes(dailyMixes, accessToken) {
  for (const mix of dailyMixes) {
    try {
      const playlistName = `Daily Mix ${dailyMixes.indexOf(mix) + 1}`;
      console.log(`Copying Daily Mix: ${mix.name} to ${playlistName}`);
      await copyPlaylist(mix, playlistName, accessToken);
    } catch (error) {
      console.error(`Error copying Daily Mix ${mix.name}:`, error);
    }
  }
}

// Function to copy Weekly Discovery playlists
async function copyWeeklyDiscoveries(weeklyDiscoveries, accessToken) {
  for (const discovery of weeklyDiscoveries) {
    try {
      const playlistName = `Weekly Discoveries`;
      console.log(`Copying Weekly Discoveries: ${discovery.name} to ${playlistName}`);
      await copyPlaylist(discovery, playlistName, accessToken);
    } catch (error) {
      console.error(`Error copying Weekly Discoveries ${discovery.name}:`, error);
    }
  }
}

// Function to copy a playlist
async function copyPlaylist(playlist, newName, accessToken) {
  try {
    // Create a new playlist
    const userId = playlist.owner.id;
    console.log(`Creating new playlist: ${newName} for user: ${userId}`);
    const createPlaylistResponse = await axios.post(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      name: newName,
      public: false
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const newPlaylistId = createPlaylistResponse.data.id;
    console.log(`New playlist created with ID: ${newPlaylistId}`);

    // Get tracks from the original playlist
    const tracksResponse = await axios.get(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const trackUris = tracksResponse.data.items.map(item => item.track.uri);
    console.log(`Tracks to be added: ${trackUris}`);

    // Add tracks to the new playlist
    await axios.post(`https://api.spotify.com/v1/playlists/${newPlaylistId}/tracks`, {
      uris: trackUris
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    console.log(`Tracks added to new playlist: ${newPlaylistId}`);
  } catch (error) {
    console.error(`Error copying playlist ${playlist.name} to ${newName}:`, error);
    throw error;
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
