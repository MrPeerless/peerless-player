$(document).ready(function () {
    // Constant variables for file system module
    const fs = require('fs');
    const path = require('path');

    // Arrays to store results
    var databaseAlbums = [];
    var directoryArtists = [];
    var directoryAlbums = [];
    var foundMusic = [];

    getAlbums()

    // Get all artists|albums from database
    async function getAlbums() {
        var sql = "SELECT artist.artistName, album.albumName FROM album INNER JOIN artist ON album.artistID=artist.artistID ORDER BY artist.artistName COLLATE NOCASE ASC";
        var rows = await dBase.all(sql);
        // Add each artist, album to array
        rows.forEach((row) => {
            databaseAlbums.push(row.artistName + "|" + row.albumName);
        });

        // Read all artists from MUSIC_PATH directory
        directoryArtists = fs.readdirSync(MUSIC_PATH)

        // Read all albums for each artist
        directoryArtists.forEach((artist) => {
            var albums = [];
            // Check that artist is a directory
            if (fs.lstatSync(MUSIC_PATH + artist).isDirectory()) {
                albums = fs.readdirSync(MUSIC_PATH + artist)
                // If is directory add to directoryAlbums array
                albums.forEach((album) => {
                    if (fs.lstatSync(MUSIC_PATH + artist + "/" + album).isDirectory()) {
                        directoryAlbums.push(artist + "|" + album)
                    }
                });
            }
        });

        // Compare directoryAlbums and databaseAlbums and populate foundMusic
        $.grep(directoryAlbums, function (album) {
            if ($.inArray(album, databaseAlbums) == -1) foundMusic.push(album);
        });

        // If no new music found
        if (foundMusic.length == 0) {
            // Hide trackListing and show content
            $("#divTrackListing").css("display", "none");
            var srnWidth = $(window).width();
            var width = (srnWidth - 240);
            $("#divContent").css("width", width);

            // Show A to Z menu
            $('#spnAtoZmenu').css('display', 'inline')
            // Show Artist and Album column of Songs table
            $("#tblSongs td:nth-child(2)").css("display", "table-cell");
            $("#tblSongs th:nth-child(2)").css("display", "table-cell");
            $("#tblSongs td:nth-child(3)").css("display", "table-cell");
            $("#tblSongs th:nth-child(3)").css("display", "table-cell");

            // Display modal information box
            $('#okModal').css('display', 'block');
            $(".modalFooter").empty();
            $('.modalHeader').html('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
            $('#okModalText').html("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br>No new music found in directory.<br>The database is up to date.<br>&nbsp</p >");
            var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
            $('.modalFooter').append(buttons);
            $("#btnOkModal").focus();
            $("#btnSync").prop("disabled", false);
            return
        }
        else {
            $('#displayNewMusicDetails').html(foundMusic.length + " new albums found in Directory<br>The below list of new albums have been found.")
            $('#displayNewMusicInfo').html("Select an album and click on the GET button to search for album metadata.<br>If no album metadata is found, select an album and click on the MANUAL button")

            var table = $("#tblGracenote")
            var tableHeader = $("<tr><th class='rowGraceArtist'>Artist</th><th class='rowGraceAlbum'>Album</th><th class='rowGraceTracks'>No. Tracks</th></tr>");
            tableHeader.appendTo(table);

            foundMusic.forEach((found) => {
                var splitAlbum = found.split("|");
                var artist = splitAlbum[0];
                var album = splitAlbum[1];

                // Get all files in album directory
                var tracks = fs.readdirSync(MUSIC_PATH + artist + "/" + album + "/");

                // Loop through files in album directory
                var trackCount = 0;
                var i;
                for (i = 0; i < tracks.length; i++) {
                    var ext = (path.extname(MUSIC_PATH + artist + "/" + album + "/" + tracks[i]));
                    // If file is a music file add to trackCount
                    if ((ext == '.mp3') || (ext == '.m4a') || (ext == '.wav')) {
                        trackCount += 1;
                    }
                } 

                // Create table row
                var tableRow = $("<tr class='tracks'><td>" + artist + "</td><td>" + album + "</td><td>" + trackCount + "</td></tr>");
                // Append row to table
                tableRow.appendTo(table);
            });
        }

        // Check heights, if tracklisting is less than screen height adjust
        var trackHeight = parseInt($("#divTrackListing").css("height"));
        var srnHeight = $(window).height()
        if (srnHeight > trackHeight) {
            $("#divTrackListing").css("height", srnHeight);
        }
    }
});