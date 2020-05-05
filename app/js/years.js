$(document).ready(function () {
    // Set variable for overlay class on album image
    var overlay = "overlay";
    if (global_ArtIconShape == "round") {
        overlay = "overlayRound";
    }

    displayYears()

    async function displayYears() {
        // Open database
        //await dBase.open(DB_PATH);
        // Select all years grouped by release date from database
        var sql = "SELECT COUNT (album.releaseDate) AS count, album.albumName, album.releaseDate, artist.artistName FROM album INNER JOIN artist ON album.artistID=artist.artistID GROUP BY releaseDate ORDER BY album.releaseDate DESC";
        var rows = await dBase.all(sql);

        // Find total number of genres
        // Call function in index.js to format number #,###
        var numberYears = numberWithCommas(rows.length);
        $("#yearTitle").text(numberYears + " Years");

        rows.forEach((row) => {
            // Set variables
            var ul = $('#ulAllYears');
            var yearLink = "./html/yearalbums.html?year=" + row.releaseDate;
            var yearText;

            // Get folder.jpg file path
            var sourceFile = MUSIC_PATH + row.artistName + "/" + row.albumName + "/folder.jpg";
            // Find folder.jpg last modified date

            try {
                var modifiedDate = fs.statSync(sourceFile).mtime;
                var artworkSource = MUSIC_PATH + row.artistName + "/" + row.albumName + "/folder.jpg?modified=" + modifiedDate;
            }
            catch{
                var artworkSource = "./graphics/notFound.gif"
            }

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
                li.find('span').html('<br><b>' + row.releaseDate + '</b><br>' + yearText);
                li.appendTo(ul);
            }
            // Large art icons
            else {
                $(ul).attr('class', 'albumDisplayLarge');
                var li = $('<li><a><img class="' + global_ArtIconShape + '"><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                li.find('img').attr('src', artworkSource);
                li.find('a').attr('href', yearLink);
                li.find('span').html('<br><b>' + row.releaseDate + '</b><br>' + yearText);
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