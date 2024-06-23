import React, { useEffect } from 'react';

function CopyPlaylists() {
  useEffect(() => {
    fetch('/copy-playlists')
      .then(response => response.text())
      .then(data => console.log(data))
      .catch(error => console.error('Error copying playlists:', error));
  }, []);

  return (
    <div>
      <h2>Copying Playlists...</h2>
    </div>
  );
}

export default CopyPlaylists;
