$(document).ready(function () {
    // Get search term from input box
    var searchTerm = $('#ipnSearch').val();

    // Regex to only allow alphanumeric characters and punctuation in searchTerm input
    searchTerm = searchTerm.replace(/[^a-z0-9'!()=+&]+/gi, "");

    // And clear search term
    $('#ipnSearch').val("");

    // Set page title
    $("#searchTitle").text("Search Results for: " + searchTerm);

    displayArtistResults();

    async function displayArtistResults() {
        // Search artist table for search term
        var sql = "SELECT album.albumID, artist.artistID, album.albumName, artist.artistName FROM artist INNER JOIN album ON artist.artistID=album.artistID WHERE artist.artistName LIKE '%" + searchTerm + "%' GROUP BY artist.artistID";
        var rows = await dBase.all(sql);

        // Unordered list to attach list items to
        var ul = $('#ulArtistsSearch');

        $("#artistsSearchText").text(" " + rows.length + " results found.")

        rows.forEach((row) => {
            // Get folder.jpg file path
            var artworkSource = MUSIC_PATH + row.artistName + "/" + row.albumName + "/folder.jpg"

            var albumLink = "./html/displayalbum.html?album=" + row.albumID + "&artist=" + row.artistID;

            // Create <li> item for each album and append to <ul>
            // Small art icons
            if (global_ArtIconSize == "small") {
                $(ul).attr('class', 'albumDisplay');
                var li = $('<li><a><img><span></span></a></li>');
                li.find('img').attr('src', artworkSource);
                li.find('a').attr('href', albumLink);
                li.find('span').append('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br>');
                li.appendTo(ul);
            }
            // Large art icons
            else {
                $(ul).attr('class', 'albumDisplayLarge');
                var li = $('<li><a><img><br><div class="overlay"><div class="textAlbum"><span></span></div></div></a></li>');
                li.find('img').attr('src', artworkSource);
                li.find('a').attr('href', albumLink);
                li.find('span').append('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br>');
                li.appendTo(ul);
            }
        });
    }

    displayAlbumResults();

    async function displayAlbumResults() {
        // Search album table for search term
        var sql = "SELECT album.albumID, artist.artistID, album.albumName, artist.artistName FROM album INNER JOIN artist ON album.artistID=artist.artistID WHERE album.albumName LIKE '%" + searchTerm + "%'";
        var rows = await dBase.all(sql);

        // Unordered list to attach list items to
        var ul = $('#ulAlbumsSearch');

        $("#albumsSearchText").text(" " + rows.length + " results found.")

        rows.forEach((row) => {
            // Get folder.jpg file path
            var artworkSource = MUSIC_PATH + row.artistName + "/" + row.albumName + "/folder.jpg"

            var albumLink = "./html/displayalbum.html?album=" + row.albumID + "&artist=" + row.artistID;

            // Create <li> item for each album and append to <ul>
            // Small art icons
            if (global_ArtIconSize == "small") {
                $(ul).attr('class', 'albumDisplay');
                var li = $('<li><a><img><span></span></a></li>');
                li.find('img').attr('src', artworkSource);
                li.find('a').attr('href', albumLink);
                li.find('span').append('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br>');
                li.appendTo(ul);
            }
            // Large art icons
            else {
                $(ul).attr('class', 'albumDisplayLarge');
                var li = $('<li><a><img><br><div class="overlay"><div class="textAlbum"><span></span></div></div></a></li>');
                li.find('img').attr('src', artworkSource);
                li.find('a').attr('href', albumLink);
                li.find('span').append('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br>');
                li.appendTo(ul);
            }
        });
    }

    displayTrackResults();

    async function displayTrackResults() {
        // Search album table for search term
        var sql = "SELECT track.trackID, track.artistID, track.albumID, track.count, track.lastPlay, track.favourite, artist.artistName, album.albumName, track.trackName FROM track INNER JOIN artist ON artist.artistID=track.artistID INNER JOIN album ON album.albumID=track.albumID WHERE track.trackName LIKE '%" + searchTerm + "%'";
        var rows = await dBase.all(sql);

        // Table list to attach list items to
        var table = $("#tblSongs")

        $("#songsSearchText").text(" " + rows.length + " results found.")

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
            // Format lastPlay date
            if (row.lastPlay == null) {
                row.lastPlay = "";
            }
            else {
                row.lastPlay = formatDate(row.lastPlay);
            }
            // Create table row
            var tableRow = $("<tr class='tracks'><td>" + row.trackName + "</td><td>" + row.artistName + "</td><td>" + row.albumName + "</td><td class='count'>" + row.count + "</td><td class='lastPlay'>" + row.lastPlay + "</td><td class='favourite'><img class='favourite' src='" + favouriteImage + "' alt='" + alt + "' id='" + row.trackID + "'></td><td>" + row.trackID + "</td></tr>");

            // Append row to table
            tableRow.appendTo(table);
        });
    }
});