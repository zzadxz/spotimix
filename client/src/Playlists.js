import React, { useEffect, useState } from 'react';

function Playlists() {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    fetch('/playlists')
      .then(response => response.json())
      .then(data => setPlaylists(data.items))
      .catch(error => console.error('Error fetching playlists:', error));
  }, []);

  return (
    <div>
      <h2>Your Playlists</h2>
      <ul>
        {playlists.map(playlist => (
          <li key={playlist.id}>
            <a href={playlist.external_urls.spotify}>{playlist.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Playlists;
