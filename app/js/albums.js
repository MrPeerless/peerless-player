$(document).ready(function () {
    // Set variable for overlay class on album image
    var overlay = "overlay";
    if (global_ArtIconShape == "round") {
        overlay = "overlayRound";
    }

    displayAlbums()

    // Select all albums from the database
    async function displayAlbums() {
        // Select all albums from the database based on global_AlbumSort
        switch (global_AlbumSort) {
            case "a2z":
                var sql = "SELECT album.albumID, album.artistID, album.releaseDate, album.albumName, artist.artistName FROM album INNER JOIN artist ON album.artistID=artist.artistID ORDER BY album.albumName COLLATE NOCASE ASC";
                break;
            case "artist":
                var sql = "SELECT album.albumID, album.artistID, album.releaseDate, album.albumName, artist.artistName FROM album INNER JOIN artist ON album.artistID=artist.artistID ORDER BY artist.artistName COLLATE NOCASE ASC";
                break;
            case "added":
                var sql = "SELECT album.albumID, artist.artistID, album.albumName, artist.artistName, album.releaseDate, album.dateAdd FROM album INNER JOIN artist ON album.artistID=artist.artistID ORDER BY album.dateAdd DESC";
                break;
            case "played":
                var sql = "SELECT album.albumID, artist.artistID, album.albumName, artist.artistName, album.releaseDate, album.albumLastPlay FROM album INNER JOIN artist ON album.artistID=artist.artistID ORDER BY album.albumLastPlay DESC";
                break;
            case "most":
                var sql = "SELECT album.albumID, artist.artistID, album.albumName, artist.artistName, album.albumCount FROM album INNER JOIN artist ON album.artistID=artist.artistID ORDER BY album.albumCount DESC";
        }

        // Select all albums from the database
        var rows = await dBase.all(sql);

        // Populate array with album details
        var albums = [];

        // Find total number of albums
        // Call function in index.js to format number #,###
        var numberAlbums = numberWithCommas(rows.length);
        $("#albumsTitle").text(numberAlbums + " Albums");

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

        // Create select dropdown box for album sort
        var sort = " <b>Sort </b><select class='sltSort' id='sltAlbumSort'><option value='a2z'>A - Z</option><option value='artist'>Artist</option><option value='added'>Date Added</option><option value='played'>Last Played</option><option value='most'>Most Played</option></select>"

        // If sort is set to A - Z
        // Sort a-z and group by first letter.
        $('#spnAtoZmenu').empty();
        if (global_AlbumSort == "a2z") {
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
            // Display A = Z index and sort select
            $('#spnAtoZmenu').append(menu + sort);
        }
        // If sort is not set to A - Z
        else {
            // Only display sort select
            $('#spnAtoZmenu').append(sort);
        }

        // Highlight sort selected in dropdown box
        $('#sltAlbumSort').val(global_AlbumSort);

        albums.forEach((album) => {
            // Set variables by splitting albums array
            var ul = $('#ulAllAlbums');
            var splitAlbum = album.split("|");
            var albumName = splitAlbum[0];
            var albumID = splitAlbum[1];
            var artistName = splitAlbum[2];
            var artistID = splitAlbum[3];

            // Set anchor for A to Z menu
            var anchor = albumName.charAt(0);
            anchor = anchor.toUpperCase()

            // Replace The to start of album name
            if (albumName.endsWith(" (The)")) {
                albumName = albumName.slice(0, -6);
                albumName = "The " + albumName;
            }

            // Get folder.jpg file path
            //var artworkSource = MUSIC_PATH + artistName + "/" + albumName + "/folder.jpg";
            var modifiedDate = Date().toLocaleString();
            var artworkSource = MUSIC_PATH + artistName + "/" + albumName + "/folder.jpg?modified=" + modifiedDate;
            var albumLink = "./html/displayalbum.html?album=" + albumID + "&artist=" + artistID;

            // Small art icons
            if (global_ArtIconSize == "small") {
                $(ul).attr('class', 'albumDisplay');
                var li = $('<li><span class="anchor" id="' + anchor + '"></span><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                li.find('img').attr('src', artworkSource);
                li.find('a').attr('href', albumLink);
                li.find('span').append('<br><b>' + albumName + '</b><br>' + artistName);
                li.appendTo(ul);
            }
            // Large art icons
            else {
                $(ul).attr('class', 'albumDisplayLarge');
                var li = $('<li><span class="anchor" id="' + anchor + '"></span><a><img class="' + global_ArtIconShape + '"><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                li.find('img').attr('src', artworkSource);
                li.find('a').attr('href', albumLink);
                li.find('span').append('<br><b>' + albumName + '</b><br>' + artistName);
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