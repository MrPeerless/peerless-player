$(function () {
    // Const for music directory to sync with
    const musicDir = $("#selectedDir").text();

    // Arrays to store results
    var databaseAlbums = [];
    //var foundMusic = [];
    var rows = [];

    syncAlbums()

    // Get all artists|albums from database
    async function syncAlbums() {
        var sql = "SELECT artist.artistName, album.albumName FROM album INNER JOIN artist ON album.artistID=artist.artistID ORDER BY artist.artistName COLLATE NOCASE ASC";
        rows = await dBase.all(sql);

        // Add each artist, album to array
        rows.forEach((row) => {
            databaseAlbums.push(row.artistName + "|" + row.albumName);
        });

        // Read all artists from musicDir directory in main.js
        ipcRenderer.send("sync_external", [MUSIC_PATH, musicDir, databaseAlbums])
    }
});