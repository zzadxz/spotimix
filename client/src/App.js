import React from 'react';
import './App.css';
import Playlists from './Playlists';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify Playlist Manager</h1>
        <a className="App-link" href="/auth/spotify">
          Log in with Spotify
        </a>
      </header>
      <Playlists />
    </div>
  );
}

export default App;