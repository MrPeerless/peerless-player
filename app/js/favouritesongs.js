$(function () {
    displayGenre()
    // Hide A to Z menu
    $('#spnAtoZmenu').css('display', 'none')

    async function displayGenre() {
        if (global_SubGenre == "" && global_GenreID != "") {
            // Select the favourite details from the database if main genre selected
            var sql = "SELECT track.trackID, track.artistID, track.albumID, track.trackName, track.fileName, track.playTime, track.count, track.lastPlay, track.favourite, artist.artistName, album.albumName, genre.genreName FROM track INNER JOIN artist ON track.artistID=artist.artistID INNER JOIN album ON track.albumID=album.albumID INNER JOIN genre ON track.genreID=genre.genreID WHERE track.genreID=? AND track.favourite=true ORDER by track.trackName ASC";
            var rows = await dBase.all(sql, global_GenreID);
            // Get genre name
            var genre = rows[0].genreName;
            $("#displayPlaylistName").append(genre + "<br> Favourites");
            // Set artworkSource link
            var artworkSource = "./graphics/genres/" + genre + ".gif";
        }
        else if (global_SubGenre == "" && global_GenreID == "") {
            // Select the favourite details from the database if year release selected
            var sql = "SELECT track.trackID, track.artistID, track.albumID, track.trackName, track.fileName, track.playTime, track.count, track.lastPlay, track.favourite, artist.artistName, album.albumName, genre.genreName FROM track INNER JOIN artist ON track.artistID=artist.artistID INNER JOIN album ON track.albumID=album.albumID INNER JOIN genre ON track.genreID=genre.genreID WHERE album.releaseDate=? AND track.favourite=true ORDER by track.trackName ASC";
            var rows = await dBase.all(sql, global_YearID);
            $("#displayPlaylistName").append(global_YearID + "<br> Favourites");
            var artworkSource = MUSIC_PATH + rows[0].artistName + "/" + rows[0].albumName + "/folder.jpg";
            //var artworkSource = "./graphics/calendar.png";
        }
        else {
            // Select the favourite details from the database if sub genre2 selected
            var sql = "SELECT track.trackID, track.artistID, track.albumID, track.trackName, track.fileName, track.playTime, track.count, track.lastPlay, track.favourite, artist.artistName, album.albumName, genre.genreName FROM track INNER JOIN artist ON track.artistID=artist.artistID INNER JOIN album ON track.albumID=album.albumID INNER JOIN genre ON track.genreID=genre.genreID WHERE track.genre2=? AND track.favourite=true ORDER by track.trackName ASC";
            var rows = await dBase.all(sql, global_SubGenre);
            // Get genre name
            var genre = rows[0].genreName;
            $("#displayPlaylistName").append(global_SubGenre + "<br> Favourites");
            // Set artworkSource link
            var artworkSource = "./graphics/genres/" + genre + ".gif";
        }

        // Clear shuffle tracks array
        global_ShuffleTracks = [];

        // Find number of tracks in trackList
        var numberTracks = rows.length;

        // Create text for favourite details      
        $("#displayFavouriteDetails").append("&#x2022 Number of songs: " + numberTracks + "<br>&nbsp<br>&nbsp<br>&nbsp<br>");
        $("#imgFavArtwork").attr('src', artworkSource);
        // Add tracks to each row of table
        var table = $("#tblTracks")

        rows.forEach((row) => {
            // Format date for lastPlay
            var lastPlay = formatDate(row.lastPlay);
            if (lastPlay == null) {
                lastPlay = "";
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
            var tableRow = $("<tr class='tracks'><td>" + row.trackName + "</td><td>" + row.artistName + "</td><td>" + row.count + "</td><td>" + lastPlay + "</td><td><img class='favourite' src='" + favouriteImage + "' alt='" + alt + "' id='" + row.trackID + "'></td><td>" + row.artistName + "</td><td>" + row.albumName + "</td><td>" + row.trackID + "</td></tr>");

            // Append row to table  
            tableRow.appendTo(table);

            //Get trackID of first track in album so that you can click PLAY button without selecting the first track
            if (!global_Playing) {
                global_TrackSelected = $('#tblTracks').find("tr:nth-child(2) td:last").text();
            }
        });
        // Highlight track in table if it is currently playing
        nowPlaying()
    }

    backgroundChange();
});