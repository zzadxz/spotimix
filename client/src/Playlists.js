import React, { useEffect, useState } from 'react';

function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/check-auth')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          fetchPlaylists();
        } else {
          window.location.href = '/auth/spotify';
        }
      })
      .catch(err => console.error(err));
  }, []);

  const fetchPlaylists = () => {
    fetch('/api/playlists')
      .then(res => res.json())
      .then(data => {
        setPlaylists(data.items);
      })
      .catch(err => console.error(err));
  };

  const copyPlaylists = () => {
    fetch('/api/copy-playlists')
      .then(res => res.text())
      .then(data => {
        setMessage(data);
      })
      .catch(err => console.error(err));
  };

  return (
    <div>
      <h2>Your Playlists</h2>
      <button onClick={copyPlaylists}>Copy Playlists</button>
      {message && <p>{message}</p>}
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
