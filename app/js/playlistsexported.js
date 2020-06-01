$(document).ready(function () {
    // Get list of exported playlists
    ipcRenderer.send("get_playlists", [MUSIC_PATH])
});