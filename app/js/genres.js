$(document).ready(function () {
    // Set variable for overlay class on album image
    var overlay = "overlay";
    if (global_ArtIconShape == "round") {
        overlay = "overlayRound";
    }

    displayGenres()

    async function displayGenres() {
        // Select all genres from the database
        var sql = "SELECT n.genreID, COALESCE(t.genreCount, 0) AS genreCount, n.genreName FROM genre n LEFT JOIN(SELECT genreID, COUNT(*) AS genreCount FROM album GROUP BY genreID) t ON n.genreID = t.genreID ORDER BY n.genreName ASC";
        var rows = await dBase.all(sql);

        // Find total number of genres
        var count = 0;
        // Loop through genreCount
        for (i = 0; i < rows.length; i++) {
            // If genreCount is not 0 increase count by 1
            if (rows[i].genreCount != 0) {
                count += 1;
            }
        }

        // Call function in index.js to format number #,###
        var numberGenres = numberWithCommas(count);
        $("#genreTitle").text(numberGenres + " Genres");

        rows.forEach((row) => {
            // Set variable
            var ul = $('#ulAllGenres');
            var genreLink = "./html/genrealbums.html?genre=" + row.genreID;
            var genreText;

            // Check if any albums for genre
            if (row.genreCount != 0) {
                // Set text plural or singular
                if (row.genreCount == 1) {
                    genreText = row.genreCount + " album";
                }
                else {
                    genreText = row.genreCount + " albums";
                }
                var artworkSource = "./graphics/genres/" + row.genreName + ".gif";

                // Small art icons
                if (global_ArtIconSize == "small") {
                    $(ul).attr('class', 'albumDisplay');
                    var li = $('<li><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', genreLink);
                    li.find('span').append('<br><b>' + row.genreName + '</b><br>' + genreText);
                    li.appendTo(ul);
                }
                // Large art icons
                else {
                    $(ul).attr('class', 'albumDisplayLarge');
                    var li = $('<li><a><img class="' + global_ArtIconShape + '"><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', genreLink);
                    li.find('span').append('<br><b>' + row.genreName + '</b><br>' + genreText);
                    li.appendTo(ul);
                }
            }
        });
        // Shuffle tracks
        // Select all trackIDs from track table
        var sql = "SELECT trackID FROM track";
        var tracks = await dBase.all(sql);
        shuffleArray(tracks)
    }

    backgroundChange();

});