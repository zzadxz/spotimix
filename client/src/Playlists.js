import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await axios.get('/playlists');
        setPlaylists(response.data.items);
      } catch (err) {
        setError('Failed to fetch playlists');
      }
    };

    fetchPlaylists();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Your Playlists</h2>
      <ul>
        {playlists.map(playlist => (
          <li key={playlist.id}>
            <img src={playlist.images[0]?.url} alt={playlist.name} width="50" height="50" />
            {playlist.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Playlists;