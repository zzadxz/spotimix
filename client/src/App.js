import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Playlists from './Playlists';
import CopyPlaylists from './CopyPlaylists';

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    console.log('Checking authentication');
    fetch('/check-auth')
      .then(response => response.json())
      .then(data => {
        console.log('Auth check response:', data);
        setAuthenticated(data.authenticated);
      });
  }, []);

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Spotify Playlist App</h1>
          <nav>
            <Link to="/playlists">Playlists</Link>
            <Link to="/copy-playlists">Copy Playlists</Link>
          </nav>
        </header>
        <Routes>
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/copy-playlists" element={<CopyPlaylists />} />
        </Routes>
        {!authenticated && (
          <div>
            <a href="/auth/spotify">Log in with Spotify</a>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
