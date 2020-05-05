$(document).ready(function () {
    // Constant variables for file system module
    const fs = require('fs');
    //const path = require('path');
    const musicDir = $("#selectedDir").text();

    // Arrays to store results
    var databaseAlbums = [];
    var directoryArtists = [];
    var directoryAlbums = [];
    var foundMusic = [];
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

        // Read all artists from musicDir directory
        directoryArtists = fs.readdirSync(musicDir)

        // Read all albums for each artist
        directoryArtists.forEach((artist) => {
            var albums = [];
            // Check that artist is a directory
            if (fs.lstatSync(musicDir + artist).isDirectory()) {
                albums = fs.readdirSync(musicDir + artist)
                // If is directory add to directoryAlbums array
                albums.forEach((album) => {
                    if (fs.lstatSync(musicDir + artist + "/" + album).isDirectory()) {
                        directoryAlbums.push(artist + "|" + album)
                    }
                });
            }
        });

        // Compare directoryAlbums and databaseAlbums and populate foundMusic
        $.grep(databaseAlbums, function (album) {
            if ($.inArray(album, directoryAlbums) == -1) foundMusic.push(album);            
        });
        
        // Compare Playlists
        var directoryPlaylists = [];
        var playlistsBirthtime = [];
        var compareBirthtime = [];

        // Check if Playlists directory exists on PC, if not create directory
        var dir = MUSIC_PATH + "Playlists/";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        // Get all playlist files from MUSIC_PATH
        directoryPlaylists = fs.readdirSync(MUSIC_PATH + "Playlists")
        var dir = MUSIC_PATH + "Playlists/";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        // Loop through each playlist file
        directoryPlaylists.forEach((playlist) => {
            if (fs.statSync(MUSIC_PATH + "Playlists/" + playlist).isFile()) {
                // Get birthtime of playlist file
                var stats = fs.statSync(MUSIC_PATH + "Playlists/" + playlist);
                playlistsBirthtime.push(stats.mtimeMs.toString())
            }
        });

        // Get all playlist file birthtimes from birthdates.txt on SD Card
        var birthdateFile = musicDir + "Playlists/birthdates.txt";
        var fileBirthtime;
        var externalBirthtime;
        
        // Check if Playlists directory exists on SD Card, if not create directory
        var dir = musicDir + "Playlists/";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        // Read birthdates.txt and split into externalBirthtime array
        try {   
            fileBirthtime = fs.readFileSync(birthdateFile, 'utf-8')
                .split('\n')
                .filter(Boolean);
            fileBirthtime = fileBirthtime.toString();
            externalBirthtime = fileBirthtime.split(",")
        }
        catch{
            externalBirthtime = [];
        }

        // Compare playlistsBirthtime and externalBirthtime and populate compareBirthtime
        $.grep(playlistsBirthtime, function (birthtime) {
            if ($.inArray(birthtime, externalBirthtime) == -1) compareBirthtime.push(birthtime);
        });

        // If no new music found and no new playlists
        if (foundMusic.length == 0 && compareBirthtime.length == 0) {
            // Display modal information box
            $('#okModal').css('display', 'block');
            $(".modalFooter").empty();
            $('.modalHeader').html('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
            $('#okModalText').html("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br>The directory is up to date.<br>&nbsp</p >");
            var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
            $('.modalFooter').append(buttons);
            $("#btnOkModal").focus();
            // Load home page and return
            $("#divTrackListing").css("display", "none");
            $("#divContent").css("width", "auto");
            $("#divContent").load("./html/home.html");
            return
        }

        // If new music and new playlists found
        else if (foundMusic.length != 0 && compareBirthtime.length != 0) {
            $('#syncDirectoryDetails').html(foundMusic.length + " new albums found in Database and new exported playlists to Sync with selected Directory: " + musicDir)
            $('#syncDirectoryInfo').html("Click on the checkboxes to select the albums you want to sync to the directory and then click on the Sync button.")
            var table = $("#tblSyncDirectory")
            var tableHeader = $("<tr><th><input type='checkbox' id='cbxSyncDirAll'/></th><th>Artist</th><th>Album</th></tr>");
            tableHeader.appendTo(table);

            // Check if Playlists directory exists in MUSIC directory, if it does create table row to sync Exported Playlists
            var dir = MUSIC_PATH + "Playlists/";
            if (fs.existsSync(dir)) {
                // Check if Playlists directory exists on SD Card, if not create directory
                var dir = musicDir + "Playlists/";
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                // Create table row for Playlists
                var tableRow = $("<tr class='tracks'><td><input type='checkbox' class='cbxSyncDir'/></td><td>Exported Playlists</td><td></td></tr>");
                // Append row to table
                tableRow.appendTo(table);
            }

            foundMusic.forEach((found) => {
                var splitAlbum = found.split("|");
                var artist = splitAlbum[0];
                var album = splitAlbum[1];

                // Create table row
                var tableRow = $("<tr class='tracks'><td><input type='checkbox' class='cbxSyncDir'/></td><td>" + artist + "</td><td>" + album + "</td></tr>");
                // Append row to table
                tableRow.appendTo(table);
            });
        }

        // If no new music and new playlists found
        else if (foundMusic.length == 0 && compareBirthtime.length != 0) {
            $('#syncDirectoryDetails').html(compareBirthtime.length + " new exported playlists found in Music Directory to Sync with selected Directory: " + musicDir)
            $('#syncDirectoryInfo').html("Click on the checkbox to select the exported playlists to sync to the directory and then click on the Sync button.")
            var table = $("#tblSyncDirectory")
            var tableHeader = $("<tr><th><input type='checkbox' id='cbxSyncDirAll'/></th><th>Artist</th><th>Album</th></tr>");
            tableHeader.appendTo(table);

            // Check if Playlists directory exists in MUSIC directory, if it does create table row to sync Exported Playlists
            var dir = MUSIC_PATH + "Playlists/";
            if (fs.existsSync(dir)) {
                // Check if Playlists directory exists on SD Card, if not create directory
                var dir = musicDir + "Playlists/";
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                // Create table row for Playlists
                var tableRow = $("<tr class='tracks'><td><input type='checkbox' class='cbxSyncDir'/></td><td>Exported Playlists</td><td></td></tr>");
                // Append row to table
                tableRow.appendTo(table);
            }
        }

        // If new music and no playlists found
        else if (foundMusic.length != 0 && compareBirthtime.length == 0) {
            $('#syncDirectoryDetails').html(foundMusic.length + " new albums found in Database to Sync with selected Directory: " + musicDir)
            $('#syncDirectoryInfo').html("Click on the checkboxes to select the albums you want to sync to the directory and then click on the Sync button.")
            var table = $("#tblSyncDirectory")
            var tableHeader = $("<tr><th><input type='checkbox' id='cbxSyncDirAll'/></th><th>Artist</th><th>Album</th></tr>");
            tableHeader.appendTo(table);

            foundMusic.forEach((found) => {
                var splitAlbum = found.split("|");
                var artist = splitAlbum[0];
                var album = splitAlbum[1];

                // Create table row
                var tableRow = $("<tr class='tracks'><td><input type='checkbox' class='cbxSyncDir'/></td><td>" + artist + "</td><td>" + album + "</td></tr>");
                // Append row to table
                tableRow.appendTo(table);
            });
        }
    }
});