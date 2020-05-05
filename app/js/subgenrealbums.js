$(document).ready(function () {
    // Set variable for overlay class on album image
    var overlay = "overlay";
    if (global_ArtIconShape == "round") {
        overlay = "overlayRound";
    }

    displaySubGenreAlbums()

    async function displaySubGenreAlbums() {
        // Count how many favourites fro genre
        var sql = "SELECT COUNT (favourite) AS count FROM track WHERE favourite=1 AND genre2=?";
        var count = await dBase.get(sql, global_SubGenre);

        // Select all genre's albums from the database
        var sql = "SELECT album.albumID, album.artistID, album.genreID, track.genre2, album.albumName, artist.artistName FROM album INNER JOIN track ON album.albumID=track.albumID INNER JOIN artist ON album.artistID=artist.artistID WHERE track.genre2=? GROUP BY album.albumID ORDER BY album.albumName COLLATE NOCASE ASC";
        var rows = await dBase.all(sql, global_SubGenre);
        // Populate array with album details and sort a-z and group by first letter.
        var albums = [];

        // Find total number of genres
        // Call function in index.js to format number #,###
        var numberAlbums = numberWithCommas(rows.length);
        //var genre = rows[0].genreName;
        $("#genreTitle").text(numberAlbums + " " + global_SubGenre + " Albums");

        rows.forEach((row) => {
            var albumName = row.albumName;
            // Remove The from start of name for sort and add to end of string
            if (albumName.startsWith("The ")) {
                albumName = albumName.substr(4);
                albumName += " (The)";
            }
            // Add artistID to end of string with divider |
            albumName = albumName + "|" + row.albumID + "|" + row.artistName + "|" + row.artistID;
            // Add string to albums array
            albums.push(albumName);
        });
        // Sort albums array alphabetically using function in index.js
        albums = sorted(albums);

        // Call groupBy function to group albums by first letter
        var albumsGroups = albums.groupBy(albums)

        // Create A to Z menu
        var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var menu = "";
        // Create A to Z menu
        for (var i = 0; i < alphabet.length; i++) {
            if ((alphabet.charAt(i)) in albumsGroups) {
                menu = menu + '<span style="margin-right: 1em;"><b><a href="#' + alphabet.charAt(i) + '"> ' + alphabet.charAt(i) + ' </a></b></span>';
            }
            else {
                menu = menu + '<span style="margin-right: 1em;">' + alphabet.charAt(i) + '</b></span>';
            }
        }
        // Create favourites link
        if (count.count > 0) {
            var favouriteLink = '<a id="favouriteSongs" href="./html/favouritesongs.html"><img style="vertical-align: text-bottom;" src="./graphics/favourite_red.png" alt="Y">&nbsp<b>Favourites</b></a>'
        }
        else {
            var favouriteLink = '<img style="vertical-align: text-bottom;" src="./graphics/favourite_white.png" alt="N">&nbsp Favourites'
        }
        // Display A to Z menu and favourites link
        $('#spnAtoZmenu').html(menu + favouriteLink);

        // Create list of albums
        var ul = $('#ulGenreAlbums');
        albums.forEach((album) => {
            var splitAlbum = album.split("|");
            var albumName = splitAlbum[0];
            var albumID = splitAlbum[1];
            var artistName = splitAlbum[2];
            var artistID = splitAlbum[3];
            var anchor = albumName.charAt(0);
            anchor = anchor.toUpperCase()

            // Replace The to start of album name
            if (albumName.endsWith(" (The)")) {
                albumName = albumName.slice(0, -6);
                albumName = "The " + albumName;
            }

            // Get folder.jpg file path
            var sourceFile = MUSIC_PATH + artistName + "/" + albumName + "/folder.jpg";
            // Find folder.jpg last modified date
            try {
                var modifiedDate = fs.statSync(sourceFile).mtime;
                var artworkSource = MUSIC_PATH + artistName + "/" + albumName + "/folder.jpg?modified=" + modifiedDate;
            }
            catch{
                var artworkSource = "./graphics/notFound.gif"
            }

            var albumLink = "./html/displayalbum.html?artist=" + artistID + "&album=" + albumID;
            // Small art icons
            if (global_ArtIconSize == "small") {
                $(ul).attr('class', 'albumDisplay');
                var li = $('<li><span class="anchor" id="' + anchor + '"></span><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                li.find('img').attr('src', artworkSource);
                li.find('a').attr('href', albumLink);
                li.find('span').html('<br><b>' + albumName + '</b><br>' + artistName);
                li.appendTo(ul);
            }
            // Large art icons
            else {
                $(ul).attr('class', 'albumDisplayLarge');
                var li = $('<li><span class="anchor" id="' + anchor + '"></span><a><img class="' + global_ArtIconShape + '"><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                li.find('img').attr('src', artworkSource);
                li.find('a').attr('href', albumLink);
                li.find('span').html('<br><b>' + albumName + '</b><br>' + artistName);
                li.appendTo(ul);
            }
        });
        // Shuffle tracks
        // Select all trackIDs from track table for genre2
        var sql = "SELECT trackID FROM track WHERE genre2=?";
        var tracks = await dBase.all(sql, global_SubGenre);
        shuffleArray(tracks)
    }
});