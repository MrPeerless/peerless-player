$(document).ready(function () {
    // Send IPC to search Spotify for album and artist
    ipcRenderer.send("spotify_getNewReleases")

    // The code to populate the newreleases.js page is in the ipcreply.js file
});