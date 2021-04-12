$(document).ready(function () {
    // Artwork 404 handling
    $("#imgArtwork").bind("error", function () {
        // Replace with default image
        $(this).attr("src", "./graphics/notFound.gif");
    });

    displayAlbum()

    async function displayAlbum() {
        // Select the album details from database
        var sql = "SELECT track.trackID, track.artistID, track.albumID, track.trackName, track.fileName, track.playTime, track.count, track.lastPlay, track.genre2, track.genre3, track.favourite, artist.artistName, album.albumName, album.genreID, album.releaseDate, album.albumTime, album.dateAdd, album.albumLastPlay, genre.genreName FROM track INNER JOIN artist ON track.artistID=artist.artistID INNER JOIN album ON track.albumID=album.albumID INNER JOIN genre ON album.genreID=genre.genreID WHERE track.albumID=? ORDER by track.trackName ASC";
        var rows = await dBase.all(sql, global_AlbumID);

        // Get folder.jpg file path
        try {
            var modifiedDate = Date().toLocaleString();
            var artworkSource = MUSIC_PATH + rows[0].artistName + "/" + rows[0].albumName + "/folder.jpg?modified=" + modifiedDate;
        }
        catch{
            var artworkSource = "./graphics/notFound.gif"
        }
        $("#imgArtwork").attr('src', artworkSource);

        // Populate hidden artistID and albumID text used for edit function
        $("#artistID").text(rows[0].artistID);
        $("#albumID").text(rows[0].albumID);

        // Create text for full genre list for album
        var genreText = rows[0].genreName;
        if (rows[0].genreName != rows[0].genre2) {
            genreText = genreText + " - " + rows[0].genre2;
        }
        if (rows[0].genre2 != rows[0].genre3) {
            genreText = genreText + " - " + rows[0].genre3;
        }

        var albumLastPlay = formatDate(rows[0].albumLastPlay);
        // If album never played update variable with never else last play date
        var lastPlayed;
        if (albumLastPlay == null) {
            lastPlayed = "Never";
        }
        else {
            lastPlayed = albumLastPlay;
        }

        // Create text for album details
        var albumDetails = " Released " + rows[0].releaseDate + "<br>Play time " + rows[0].albumTime + "<br>Last Played " + lastPlayed + "<br>";
        $("#displayAlbumName").append(rows[0].albumName + " <br>by " + rows[0].artistName);
        $("#displayAlbumDetails").append(albumDetails + genreText);

        // Hidden album name in artistalbums.html to use for query to musicbrainz for album info
        $("#hiddenAlbumName").text(rows[0].albumName);

        // Add tracks to each row of table
        var table = $("#tblTracks")
        rows.forEach((row) => {
            // Format date for lastPlay
            var lastPlay;
            if (!row.lastPlay) {
                lastPlay = "";
            }
            else {
                lastPlay = formatDate(row.lastPlay);
            }
            // Link for favourite graphic
            var favouriteImage;
            var alt;
            if (row.favourite == true) {
                favouriteImage = "./graphics/favourite_red.png"
                alt = "Y"
            }
            else {
                favouriteImage = "./graphics/favourite_black.png"
                alt = "N"
            }

            // Create table row
            var tableRow = $("<tr class='tracks'><td>" + row.trackName + "</td><td>" + row.playTime + "</td><td>" + row.count + "</td><td>" + lastPlay + "</td><td><img class='favourite' src='" + favouriteImage + "' alt='" + alt + "' id='" + row.trackID + "'></td><td>" + row.artistName + "</td><td>" + row.albumName + "</td><td>" + row.trackID + "</td></tr>");

            // Append row to table
            tableRow.appendTo(table);

            //Get trackID of first track in album so that you can click PLAY button without selecting the first track
            if (!global_Playing) {
                global_TrackSelected = $('#tblTracks').find("tr:nth-child(2) td:last").text();
            }
        });
        // Highlight track in table if it is currently playing
        nowPlaying()

        // Enable btnSync
        $("#btnSync").prop("disabled", false);

        // Call function in index.js to alter background of div
        backgroundChange()
    }
});