import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Playlists from './Playlists';
import CopyPlaylists from './CopyPlaylists'; // Import the new component

function App() {
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
      </div>
    </Router>
  );
}

export default App;
