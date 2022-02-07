$(document).ready(function () {
    // Set variable for overlay class on album image
    var overlay = "overlay";
    if (global_ArtIconShape == "round") {
        overlay = "overlayRound";
    }

    displayYears()

    async function displayYears() {
        // Select all years grouped by release date from database
        var sql = "SELECT COUNT (album.releaseDate) AS count, album.albumName, album.releaseDate, artist.artistName FROM album INNER JOIN artist ON album.artistID=artist.artistID GROUP BY releaseDate ORDER BY album.releaseDate DESC";
        var rows = await dBase.all(sql);

        // Find total number of years
        // Call function in index.js to format number #,###
        var numberYears = numberWithCommas(rows.length);
        $("#yearTitle").text(numberYears + " Years");

        /*
        // Sort a-z and group by first letter.
        $('#spnAtoZmenu').empty();
        // Call groupBy function to group albums by first letter
        //var albumsGroups = albums.groupBy(albums)

        // Create A to Z menu
        var yearRange = "20 19 18 17 16 15 14 13 12 11 10 09 08 07 06 05 04 03 02 01 00 99 98 97 96 ";
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
        //$('#spnAtoZmenu').append(menu);
        $('#spnAtoZmenu').append("<b>" + yearRange + "<b>");
        */



        rows.forEach((row) => {
            // Set variables
            var ul = $('#ulAllYears');
            var yearLink = "./html/yearalbums.html?year=" + row.releaseDate;
            var yearText;
            console.log("release date = " + row.releaseDate)
            // Get folder.jpg file path
            var artworkSource = MUSIC_PATH + row.artistName + "/" + row.albumName + "/folder.jpg";

            // Set text plural or singular
            if (row.count == 1) {
                yearText = row.count + " album";
            }
            else {
                yearText = row.count + " albums";
            }

            // Small art icons
            if (global_ArtIconSize == "small") {
                $(ul).attr('class', 'albumDisplay');
                var li = $('<li><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                li.find('img').attr('src', artworkSource);
                li.find('a').attr('href', yearLink);
                li.find('span').append('<br><b>' + row.releaseDate + '</b><br>' + yearText);
                li.appendTo(ul);
            }
            // Large art icons
            else {
                $(ul).attr('class', 'albumDisplayLarge');
                var li = $('<li><a><img class="' + global_ArtIconShape + '"><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                li.find('img').attr('src', artworkSource);
                li.find('a').attr('href', yearLink);
                li.find('span').append('<br><b>' + row.releaseDate + '</b><br>' + yearText);
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