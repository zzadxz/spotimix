import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Playlists() {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    axios.get('/playlists')
      .then(response => {
        setPlaylists(response.data.items);
      })
      .catch(error => {
        console.error('There was an error fetching the playlists!', error);
      });
  }, []);

  return (
    <div>
      <h2>Your Playlists</h2>
      <ul>
        {playlists.map(playlist => (
          <li key={playlist.id}>
            <a href={playlist.external_urls.spotify} target="_blank" rel="noopener noreferrer">
              {playlist.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Playlists;
