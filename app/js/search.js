$(function () {
    $('#ulMenu a').css("textDecoration", "none");
    // Get search term from input box
    var searchTerm = $('#ipnSearch').val();

    // Regex to only allow alphanumeric characters and punctuation in searchTerm input
    searchTerm = searchTerm.replace(/[^a-z0-9'!()=+&]+/gi, " ");
    // Remove any ' as they escape the SQL query
    safeSearchTerm = searchTerm.replace(/'/g, " ");

    // And clear search term
    $('#ipnSearch').val("");

    // Set page title
    $("#searchTitle").text("Search Results for: " + searchTerm);

    search()

    async function search() {
        // Using FTS5 create a virtual table:
        var virtualTable = "CREATE VIRTUAL TABLE IF NOT EXISTS search USING fts5(trackID, artistName, albumName, trackName, releaseDate, origin, mood1, mood2, tempo1, tempo2, genre2, genre3, genreName, favourite)";
        var create = await dBase.run(virtualTable);

        // Insert data into virtual table from track, genre, artist, album table:
        var insertSql = "INSERT INTO search SELECT trackID, artist.artistName, album.albumName, trackName, album.releaseDate, artist.origin, mood1, mood2, tempo1, tempo2, genre2, genre3, genre.genreName, favourite FROM track INNER JOIN genre ON genre.genreID = track.genreID INNER JOIN artist ON artist.artistID = track.artistID INNER JOIN album ON album.albumID = track.albumID";
        var insert = await dBase.run(insertSql);

        // Preform search:
        var selectSql = "SELECT highlight(search, 1, '<b>', '</b>') artistName, highlight(search, 2, '<b>', '</b>') albumName, highlight(search, 3, '<b>', '</b>') trackName, highlight(search, 4, '<b>', '</b>') releaseDate, highlight(search, 5, '<b>', '</b>') origin, favourite, trackID FROM search WHERE search MATCH '" + safeSearchTerm + "' ORDER BY rank";
        var rows = await dBase.all(selectSql);

        // Drop virtual table:
        var dropSql = "DROP TABLE IF EXISTS search"
        var drop = await dBase.run(dropSql);

        // Table list to attach list items to
        var table = $("#tblSearch")

        // Get number of search results found
        var numberResults = rows.length;

        // If nothing found
        if (numberResults == 0) {
            $("#searchNumber").text("No search results were found for the above search term.")
        }
        else {
            // Display search results in table
            var tableHead = $("<thead><tr><th>Song</th><th>Artist</th><th>Album</th><th>Date</th><th>Origin</th><th><img src='./graphics/favourite_white.png' alt='Favourite'/></th></tr></thead>")
            tableHead.appendTo(table);

            if (numberResults == 1) {
                $("#searchNumber").text(numberResults + " Search result found.")
            }
            else if (numberResults > 1) {
                $("#searchNumber").text(numberResults + " Search results found ranked by best match.")
            }
            // Create table results
            rows.forEach((row) => {
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
                var tableRow = $("<tr class='tracks'><td>" + row.trackName + "</td><td>" + row.artistName + "</td><td>" + row.albumName + "</td><td class='release'>" + row.releaseDate + "</td><td class='origin'>" + row.origin + "</td><td class='favourite'><img class='favourite' src='" + favouriteImage + "' alt='" + alt + "' id='" + row.trackID + "'></td><td>" + row.trackID + "</td></tr>");

                // Append row to table
                tableRow.appendTo(table);
            });
        }
    }
});