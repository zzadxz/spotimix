import React, { useEffect, useState } from 'react';

function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    console.log('Fetching playlists');
    fetch('/api/playlists')
      .then(res => res.json())
      .then(data => {
        console.log('Playlists fetched:', data);
        setPlaylists(data.items);
      })
      .catch(err => console.error(err));
  }, []);

  const copyPlaylists = () => {
    console.log('Copying playlists');
    fetch('/api/copy-playlists')
      .then(res => res.text())
      .then(data => {
        console.log('Copy playlists response:', data);
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
