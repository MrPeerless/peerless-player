$(document).ready(function () {
    // Set variable for overlay class on album image
    var overlay = "overlay";
    if (global_ArtIconShape == "round") {
        overlay = "overlayRound";
    }

    var sort = "";

    displayYearAlbums()

    async function displayYearAlbums() {
        // Count how many favourites from year release date
        var sql = "SELECT COUNT (favourite) AS count FROM track INNER JOIN album ON track.albumID=album.albumID WHERE album.releaseDate=? AND track.favourite=1";
        var count = await dBase.get(sql, global_YearID);

        // Select all albums from the database based on global_AlbumSort
        switch (global_AlbumSort) {
            case "a2z":
                var sql = "SELECT album.albumID, album.artistID, album.releaseDate, album.albumName, artist.artistName FROM album INNER JOIN artist ON album.artistID=artist.artistID WHERE album.releaseDate=? ORDER BY album.albumName COLLATE NOCASE ASC";
                break;
            case "artist":
                var sql = "SELECT album.albumID, album.artistID, album.releaseDate, album.albumName, genre.genreName, artist.artistName FROM album INNER JOIN genre ON album.genreID=genre.genreID INNER JOIN artist ON album.artistID=artist.artistID WHERE album.releaseDate=? ORDER BY artist.artistName COLLATE NOCASE ASC";
                sort = "Artist";
                break;
            case "added":
                var sql = "SELECT album.albumID, album.artistID, album.releaseDate, album.albumName, album.dateAdd, genre.genreName, artist.artistName FROM album INNER JOIN genre ON album.genreID=genre.genreID INNER JOIN artist ON album.artistID=artist.artistID WHERE album.releaseDate=? ORDER BY album.dateAdd DESC";
                sort = "Date Added";
                break;
            case "played":
                var sql = "SELECT album.albumID, album.artistID, album.releasedate, album.albumName, album.albumLastPlay, genre.genreName, artist.artistName FROM album INNER JOIN genre ON album.genreID=genre.genreID INNER JOIN artist ON album.artistID=artist.artistID WHERE album.releaseDate=? ORDER BY album.albumLastPlay DESC";
                sort = "Last Played";
                break;
            case "most":
                var sql = "SELECT ROUND(album.albumCount/(SELECT COUNT (track.albumID)+0.0), 5)*((CAST(SUBSTR(album.albumTime, 0, INSTR(album.albumTime, ':'))*60 + SUBSTR(album.albumTime, INSTR(album.albumTime,':')+1, length(album.albumTime))AS FLOAT)/2700)+1) AS ranking, track.artistID, track.albumID, album.albumName, album.albumCount, album.albumTime, album.genreID, album.releaseDate,  artist.artistName, genre.genreName FROM track INNER JOIN genre ON album.genreID=genre.genreID INNER JOIN artist ON track.artistID=artist.artistID INNER JOIN album ON track.albumID=album.albumID WHERE album.releaseDate=? GROUP BY track.albumID ORDER BY ranking DESC";
                sort = "Most Played";
                break;
            case "release":
                var sql = "SELECT album.albumID, album.artistID, album.genreID, album.albumName, album.releaseDate, genre.genreName, artist.artistName FROM album INNER JOIN genre ON album.genreID = genre.genreID INNER JOIN artist ON album.artistID = artist.artistID INNER JOIN track ON album.albumID = track.albumID WHERE album.releaseDate=? GROUP BY track.albumID ORDER BY album.releaseDate DESC, album.albumName ASC";
                sort = "Release Date";
        }

        var rows = await dBase.all(sql, global_YearID);

        // Populate array with album details and sort a-z and group by first letter.
        var albums = [];

        // Find total number of years
        // Call function in index.js to format number #,###
        var numberAlbums = numberWithCommas(rows.length);
        var year = rows[0].releaseDate;
        $("#yearTitle").text(numberAlbums + " Albums from " + year);

        rows.forEach((row) => {
            var albumName = row.albumName;
            // Remove The from start of name for sort and add to end of string
            if (albumName.startsWith("The ")) {
                albumName = albumName.substr(4);
                albumName += " (The)";
            }
            // Add artistID to end of string with divider |
            if (global_AlbumSort == "added") {
                albumName = albumName + "|" + row.albumID + "|" + row.artistName + "|" + row.artistID + "|" + row.dateAdd;
            }
            else if (global_AlbumSort == "played") {
                albumName = albumName + "|" + row.albumID + "|" + row.artistName + "|" + row.artistID + "|" + row.albumLastPlay;
            }
            else if (global_AlbumSort == "release") {
                albumName = albumName + "|" + row.albumID + "|" + row.artistName + "|" + row.artistID + "|" + row.releaseDate;
            }
            else {
                albumName = albumName + "|" + row.albumID + "|" + row.artistName + "|" + row.artistID;
            }
            // Add string to albums array
            albums.push(albumName);
        });

        // Create favourites link
        if (count.count > 0) {
            var favouriteLink = '<a id="favouriteSongs" href="./html/favouritesongs.html"><b>Favourites </b><img style="vertical-align: text-bottom;" src="./graphics/favourite_red.png" alt="Y"></a>'
        }
        else {
            var favouriteLink = '<b>Favourites </b><img style="vertical-align: text-bottom;" src="./graphics/favourite_white.png" alt="N">'
        }

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

            // Display A to Z menu and favourites link
            $('#spnAtoZmenu').append(menu + favouriteLink);
        }
        else {
            // Only display sort select
            $('#spnAtoZmenu').append('<b>Sort: </b>' + sort + '<span style="margin-left: 1.5em;">' + favouriteLink);
        }

        // Counter for most played album
        var i = 1;

        // Create list of albums
        var ul = $('#ulYearAlbums');
        albums.forEach((album) => {
            var splitAlbum = album.split("|");
            var albumName = splitAlbum[0];
            var albumID = splitAlbum[1];
            var artistName = splitAlbum[2];
            var artistID = splitAlbum[3];
            if (global_AlbumSort == "added") {
                var dateAdd = formatDate(splitAlbum[4]);
            }
            if (global_AlbumSort == "release") {
                var releaseDate = splitAlbum[4];
            }
            if (global_AlbumSort == "played") {
                if (splitAlbum[4] != "") {
                    var lastPlayed = formatDate(splitAlbum[4]);
                }
                else {
                    var lastPlayed = "";
                }
            }
            var anchor = albumName.charAt(0);
            anchor = anchor.toUpperCase()

            // Replace The to start of album name
            if (albumName.endsWith(" (The)")) {
                albumName = albumName.slice(0, -6);
                albumName = "The " + albumName;
            }

            // Get folder.jpg file path
            var artworkSource = MUSIC_PATH + artistName + "/" + albumName + "/folder.jpg";

            var albumLink = "./html/displayalbum.html?artist=" + artistID + "&album=" + albumID;
            // Small art icons
            if (global_ArtIconSize == "small") {
                $(ul).attr('class', 'albumDisplay');
                var li = $('<li><span class="anchor" id="' + anchor + '"></span><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                li.find('img').attr('src', artworkSource);
                li.find('a').attr('href', albumLink);
                if (global_AlbumSort == "most") {
                    li.find('span').append('<br><b>' + albumName + '</b><br>' + artistName + '<br>No. ' + i);
                }
                else if (global_AlbumSort == "added") {
                    li.find('span').append('<br><b>' + albumName + '</b><br>' + artistName + '<br>' + dateAdd);
                }
                else if (global_AlbumSort == "release") {
                    li.find('span').append('<br><b>' + albumName + '</b><br>' + artistName + '<br>' + releaseDate);
                }
                else if (global_AlbumSort == "played") {
                    li.find('span').append('<br><b>' + albumName + '</b><br>' + artistName + '<br>' + lastPlayed);
                }
                else {
                    li.find('span').append('<br><b>' + albumName + '</b><br>' + artistName);
                }
                li.appendTo(ul);
            }
            // Large art icons
            else {
                $(ul).attr('class', 'albumDisplayLarge');
                var li = $('<li><span class="anchor" id="' + anchor + '"></span><a><img class="' + global_ArtIconShape + '"><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                li.find('img').attr('src', artworkSource);
                li.find('a').attr('href', albumLink);
                if (global_AlbumSort == "most") {
                    li.find('span').append('<br><b>' + albumName + '</b><br>' + artistName + '<br>No. ' + i);
                }
                else if (global_AlbumSort == "added") {
                    li.find('span').append('<br><b>' + albumName + '</b><br>' + artistName + '<br>' + dateAdd);
                }
                else if (global_AlbumSort == "release") {
                    li.find('span').append('<br><b>' + albumName + '</b><br>' + artistName + '<br>' + releaseDate);
                }
                else if (global_AlbumSort == "played") {
                    li.find('span').append('<br><b>' + albumName + '</b><br>' + artistName + '<br>' + lastPlayed);
                }
                else {
                    li.find('span').append('<br><b>' + albumName + '</b><br>' + artistName);
                }
                li.appendTo(ul);
            }
            i++;
        });
        // Shuffle tracks
        // Select all trackIDs from track table for yearID
        var sql = "SELECT track.trackID, track.albumID, album.releaseDate FROM track INNER JOIN album ON track.albumID=album.albumID WHERE album.releaseDate=?";
        var tracks = await dBase.all(sql, global_YearID);
        shuffleArray(tracks)
    }

    backgroundChange();
});