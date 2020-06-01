$(document).ready(function () {
    // Set variable for overlay class on album image
    var overlay = "overlay";
    if (global_ArtIconShape == "round") {
        overlay = "overlayRound";
    }

    displayArtistAlbums()

    async function displayArtistAlbums() {
        // Select all artist's albums from the database
        var sql = "SELECT album.albumID, album.albumName, album.releaseDate, album.albumTime, COALESCE(t.trackCount, 0) AS trackCount, n.artistName, n.origin FROM artist n INNER JOIN album ON album.artistID=n.artistID LEFT JOIN(SELECT artistID, COUNT(*) AS trackCount FROM track GROUP BY artistID) t ON n.artistID = t.artistID WHERE album.artistID=? ORDER BY album.releaseDate DESC";
        var rows = await dBase.all(sql, global_ArtistID);

        var albumText;
        
        // Get artist's name
        var artistName = rows[0].artistName;
        // Get artist's origin
        var originText = rows[0].origin;
        // Get number of tracks
        var numberTracks = rows[0].trackCount;

        //Set text to nothing if origin is Not Known
        if (originText == "" || originText == null){
            originText = "";
        }
        else {
            originText = "From " + originText;
        }
        // Call function in index.js to format number #,###
        var numberAlbums = numberWithCommas(rows.length);
        // Set text for single or plural album/albums
        if (numberAlbums == 1) {
            albumText = numberAlbums + " album";
        }
        else {
            albumText = numberAlbums + " albums";
        }

        rows.forEach((row) => {
            var totalMins = 0;
            var totalSecs = 0;
            rows.forEach((row) => {
                var time = row.albumTime.split(":");
                var tick = parseInt(time[0]);
                totalMins += tick;
                var tock = parseInt(time[1]);
                totalSecs += tock;
            });
            // Calculate seconds
            var seconds = totalSecs % 60;
            var secMins = totalSecs / 60;
            // Calculate minuntes
            var mins = secMins + totalMins;
            var minutes = parseInt(mins % 60);
            // Calcualte hours
            var hrs = mins / 60;
            var hours = parseInt(hrs % 24);
            // Calculate days
            $("#artistNumberSongs").text(numberTracks + " Songs. Total Playing Time " + hours + " hrs " + minutes + " mins " + seconds + " secs");
        });

        $("#artistAlbumsName").text(albumText + " by " + artistName);
        $("#artistAlbumsOrigin  ").text(originText);
        // HIdden artist name to use for query to musicbrainz
        $("#hiddenArtistName").text(artistName);

        var ul = $('#ulArtistAlbums');

        rows.forEach((row) => {
            var albumName = row.albumName;

            // Force browser to update cache for album images if they have been changed with the database edit function
            var modifiedDate = Date().toLocaleString();
            var artworkSource = MUSIC_PATH + artistName + "/" + albumName + "/folder.jpg?modified=" + modifiedDate;

            var albumLink = "./html/displayalbum.html?artist=" + global_ArtistID + "&album=" + row.albumID;

            // Small art icons
            if (global_ArtIconSize == "small") {
                $(ul).attr('class', 'albumDisplay');
                var li = $('<li><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                li.find('img').attr('src', artworkSource);
                li.find('a').attr('href', albumLink);
                li.find('span').html('<br><b>' + row.albumName + '</b><br>' + row.releaseDate);
                li.appendTo(ul);
            }

            // Large art icons
            else {
                $(ul).attr('class', 'albumDisplayLarge');
                var li = $('<li><a><img class="' + global_ArtIconShape + '"><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                li.find('img').attr('src', artworkSource);
                li.find('a').attr('href', albumLink);
                li.find('span').html('<br><b>' + row.albumName + '</b><br>' + row.releaseDate);
                li.appendTo(ul);
            }
        });
        // Shuffle tracks
        // Select all trackIDs from track table
        var sql = "SELECT trackID FROM track WHERE artistID=?";
        var tracks = await dBase.all(sql, global_ArtistID);
        shuffleArray(tracks)
    }

    backgroundChange();
});
