import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Playlists from './Playlists';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Spotify Playlist App</h1>
          <nav>
            <Link to="/playlists">Playlists</Link>
          </nav>
        </header>
        <Routes>
          <Route path="/playlists" element={<Playlists />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
