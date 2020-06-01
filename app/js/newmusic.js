$(document).ready(function () {
    // Arrays to store results
    var databaseAlbums = [];

    getAlbums()

    // Get all artists|albums from database
    async function getAlbums() {
        var sql = "SELECT artist.artistName, album.albumName FROM album INNER JOIN artist ON album.artistID=artist.artistID ORDER BY artist.artistName COLLATE NOCASE ASC";
        // Below SQL includes album tack count
        //var sql = "SELECT n.artistName, album.albumName, COALESCE(t.trackCount, 0) AS trackCount FROM artist n INNER JOIN album ON album.artistID=n.artistID LEFT JOIN(SELECT albumID, COUNT(*) AS trackCount FROM track GROUP BY albumID) t ON n.artistID = t.albumID ORDER BY n.artistName COLLATE NOCASE ASC"
        var rows = await dBase.all(sql);
        // Add each artist, album to array
        rows.forEach((row) => {
            //databaseAlbums.push(row.artistName + "|" + row.albumName + "|" + row.trackCount);
            databaseAlbums.push(row.artistName + "|" + row.albumName);
        });
        // Read all artists from MUSIC_PATH directory in main.js reply in index.js
        ipcRenderer.send("dir_artists", [MUSIC_PATH, databaseAlbums])
    }
});