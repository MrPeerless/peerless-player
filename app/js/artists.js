$(document).ready(function () {
    // Set variable for overlay class on album image
    var overlay = "overlay";
    if (global_ArtIconShape == "round") {
        overlay = "overlayRound";
    }

    // Object to store artistID and albumName
    var albums = {};

    displayArtists()

    async function displayArtists() {
        // Select the most recent played album for each artistID
        var sql = "SELECT album1.albumName, album1.artistID, album1.genreID, album2.genreID FROM album as album1 LEFT OUTER JOIN album as album2 ON album2.artistID = album1.artistID AND album2.albumLastPlay > album1.albumLastPlay WHERE album2.genreID IS NULL ORDER by album1.artistID";
        var rows1 = await dBase.all(sql);
        rows1.forEach((row1) => {
            albums[row1.artistID] = row1.albumName;
        });

        // Select all albums from the database
        var sql = "SELECT n.artistID, COALESCE(t.albumCount, 0) AS albumCount, n.artistName FROM artist n LEFT JOIN(SELECT artistID, COUNT(*) AS albumCount FROM album GROUP BY artistID) t ON n.artistID = t.artistID ORDER BY n.artistName ASC";
        var rows = await dBase.all(sql);

        // Populate array with artist details and sort a-z and group by first letter.
        var artists = [];

        // Find total number of artists
        // Call function in index.js to format number #,###
        var numberArtists = numberWithCommas(rows.length);
        $("#artistsTitle").text(numberArtists + " Artists");

        rows.forEach((row) => {
            // Check that there are albums in the artist folder
            if (row.albumCount > 0) {
                var artistName = row.artistName;
                // Remove The from start of name for sort and add to end of string
                if (artistName.startsWith("The ")) {
                    artistName = artistName.substr(4);
                    artistName += " (The)";
                }
                // Add artistID to end of string with divider |
                artistName = artistName + "|" + row.artistID + "|" + row.albumCount;
                // Add string to artists array
                artists.push(artistName);
            }
        });
        // Sort albums array alphabetically using function in index.js
        artists = sorted(artists);

        // Call groupBy function to group artists by first letter
        var artistsGroups = artists.groupBy(artists)

        // Create A to Z menu
        var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var menu = "";

        // Create A to Z menu
        for (var i = 0; i < alphabet.length; i++) {
            if ((alphabet.charAt(i)) in artistsGroups) {
                menu = menu + '<span style="margin-right: 1em;"><b><a href="#' + alphabet.charAt(i) + '"> ' + alphabet.charAt(i) + ' </a></b></span>';
            }
            else {
                menu = menu + '<span style="margin-right: 1em;">' + alphabet.charAt(i) + '</b></span>';

            }
        }
        $('#spnAtoZmenu').html(menu);
        artists.forEach((artist) => {
            var ul = $('#ulArtists');
            var splitArtist = artist.split("|");
            var artistName = splitArtist[0];
            var artistID = splitArtist[1];
            var numberAlbums = splitArtist[2];
            var albumText;

            if (numberAlbums == 1) {
                albumText = numberAlbums + " album";
            }
            else {
                albumText = numberAlbums + " albums";
            }
            // Create anchor from first letter of artistname for A to Z menu
            var anchor = artistName.charAt(0);
            anchor = anchor.toUpperCase()

            // Replace The to start of artist name
            if (artistName.endsWith(" (The)")) {
                artistName = artistName.slice(0, -6);
                artistName = "The " + artistName;
            }
            // Get folder.jpg file path
            //var artworkSource = MUSIC_PATH + artistName + "/" + albums[artistID] + "/folder.jpg"
            var modifiedDate = Date().toLocaleString();
            var artworkSource = MUSIC_PATH + artistName + "/" + albums[artistID] + "/folder.jpg?modified=" + modifiedDate;

            var artistLink = "./html/artistalbums.html?artist=" + artistID;
                
            // Small art icons
            if (global_ArtIconSize == "small") {
                $(ul).attr('class', 'albumDisplay');
                var li = $('<li><span class="anchor" id="' + anchor + '"></span><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                li.find('img').attr('src', artworkSource);
                li.find('a').attr('href', artistLink);
                li.find('span').html('<br><b>' + artistName + '</b><br>' + albumText);
                li.appendTo(ul);
            }
            // Large art icons
            else {
                $(ul).attr('class', 'albumDisplayLarge');
                var li = $('<li><span class="anchor" id="' + anchor + '"></span><a><img class="' + global_ArtIconShape + '"><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                li.find('img').attr('src', artworkSource);
                li.find('a').attr('href', artistLink);
                li.find('span').html('<br><b>' + artistName + '</b><br>' + albumText);
                li.appendTo(ul);
            }
        });
        // Shuffle tracks
        // Select all trackIDs from track table
        var sql = "SELECT trackID FROM track";
        var tracks = await dBase.all(sql);
        shuffleArray(tracks)
    }    
});