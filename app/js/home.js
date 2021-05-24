$(document).ready(function () {
    // Set variable for overlay class on album image
    var overlay = "overlay";
    if (global_ArtIconShape == "round") {
        overlay = "overlayRound";
    }

    // Set number of columns to display depending on screenwidth
    var totalList = 0;
    var totalFirstRow = 0;
    global_SrnWidth = $(window).width();

    // Calculate how many albums to display per row 
    totalFirstRow = parseInt((global_SrnWidth - 240) * global_Zoom / (219 * global_Zoom));
    totalList = totalFirstRow * 10;

    displayRecentlyAdded()

    // Display recently added albums
    async function displayRecentlyAdded() {
        // Select all albums from the database by added date
        var sql = "SELECT album.albumID, artist.artistID, album.albumName, artist.artistName, album.releaseDate, album.dateAdd FROM album INNER JOIN artist ON album.artistID=artist.artistID ORDER BY album.dateAdd DESC";
        var rows = await dBase.all(sql);

        // Unordered list to attach list items to
        var ul = $('#ulRecentlyAdded');
        // Set counter
        var counter = 1;
        // Adjust size of rows to number of columns
        rows.length = totalList;
        rows.forEach((row) => {
            //var artworkSource = MUSIC_PATH + row.artistName + "/" + row.albumName + "/folder.jpg"
            var modifiedDate = Date().toLocaleString();
            var artworkSource = MUSIC_PATH + row.artistName + "/" + row.albumName + "/folder.jpg?modified=" + modifiedDate;

            var albumLink = "./html/displayalbum.html?album=" + row.albumID + "&artist=" + row.artistID;
            // Format dateAdd string
            var albumDate = formatDate(row.dateAdd);

            // Create <li> item for each album and append to <ul>
            // First row of list
            if (counter <= totalFirstRow) {
                // Small art icons
                if (global_ArtIconSize == "small") {
                    $(ul).attr('class', 'albumDisplay');
                    var li = $('<li><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').append('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br>' + albumDate);
                    li.appendTo(ul);
                }
                // Large art icons
                else {
                    $(ul).attr('class', 'albumDisplayLarge');
                    var li = $('<li><a><img class="' + global_ArtIconShape + '"><br><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').append('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br>' + albumDate);
                    li.appendTo(ul);
                }
            }
            // Hidden rows of list
            else {
                // Small art icons
                if (global_ArtIconSize == "small") {
                    $(ul).attr('class', 'albumDisplay');
                    var li = $('<li class="addedHidden"><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').append('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br>' + albumDate);
                    li.appendTo(ul);
                }
                // Large art icons
                else {
                    $(ul).attr('class', 'albumDisplayLarge');
                    var li = $('<li class="addedHidden"><a><img class="' + global_ArtIconShape + '"><br><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').append('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br>' + albumDate);
                    li.appendTo(ul);
                }              
            }
            // Artwork 404 handling
            $("." + global_ArtIconShape).bind("error", function () {
                // Replace with default image
                $(this).attr("src", "./graphics/notFound.gif");
            });
            // Increment counter for list items
            counter += 1;
        });
    }

    displayRecentlyPlayed()

    async function displayRecentlyPlayed() {
        // Select all albums from the database by recently played
        var sql = "SELECT album.albumID, artist.artistID, album.albumName, artist.artistName, album.releaseDate, album.albumLastPlay FROM album INNER JOIN artist ON album.artistID=artist.artistID ORDER BY album.albumLastPlay DESC";
        var rows = await dBase.all(sql);

        // Unordered list to attach list items to
        var ul = $('#ulRecentlyPlayed');
        // Set counter
        var counter = 1;
        // Adjust size of rows to number of columns
        rows.length = totalList;
        rows.forEach((row) => {
            var artworkSource = MUSIC_PATH + row.artistName + "/" + row.albumName + "/folder.jpg";

            var albumLink = "./html/displayalbum.html?album=" + row.albumID + "&artist=" + row.artistID;

            // Format dateAdd string
            var albumDate = formatDate(row.albumLastPlay);

            // Create <li> item for each album and append to <ul>
            // First row of list
            if (counter <= totalFirstRow) {
                // Small art icons
                if (global_ArtIconSize == "small") {
                    $(ul).attr('class', 'albumDisplay');
                    var li = $('<li><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').append('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br>' + albumDate);
                    li.appendTo(ul);
                }
                // Large art icons
                else {
                    $(ul).attr('class', 'albumDisplayLarge');
                    var li = $('<li><a><img class="' + global_ArtIconShape + '"><br><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').append('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br>' + albumDate);
                    li.appendTo(ul);
                }
            }
            // Hidden rows of list
            else {
                // Small art icons
                if (global_ArtIconSize == "small") {
                    $(ul).attr('class', 'albumDisplay');
                    var li = $('<li class="playedHidden"><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').append('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br>' + albumDate);
                    li.appendTo(ul);
                }
                // Large art icons
                else {
                    $(ul).attr('class', 'albumDisplayLarge');
                    var li = $('<li class="playedHidden"><a><img class="' + global_ArtIconShape + '"><br><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').append('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br>' + albumDate);
                    li.appendTo(ul);
                }
            }
            // Artwork 404 handling
            $("." + global_ArtIconShape).bind("error", function () {
                // Replace with default image
                $(this).attr("src", "./graphics/notFound.gif");
            });
            // Increment counter for list items
            counter += 1;
        });
    }

    displayMostPlayed()

    async function displayMostPlayed() {
        // Select all albums from the database by most played
        //var sql = "SELECT album.albumID, artist.artistID, album.albumName, artist.artistName, album.albumCount FROM album INNER JOIN artist ON album.artistID=artist.artistID ORDER BY album.albumCount DESC";
        var sql = "SELECT ROUND(album.albumCount/(SELECT COUNT (track.albumID)+0.0), 5)*((CAST(SUBSTR(album.albumTime, 0, INSTR(album.albumTime, ':'))*60 + SUBSTR(album.albumTime, INSTR(album.albumTime,':')+1, length(album.albumTime))AS FLOAT)/2700)+1) AS ranking, track.artistID, track.albumID, album.albumName, album.albumCount, album.albumTime, artist.artistName FROM track INNER JOIN artist ON track.artistID=artist.artistID INNER JOIN album ON track.albumID=album.albumID GROUP BY track.albumID ORDER BY ranking DESC";
        var rows = await dBase.all(sql);

        // Unordered list to attach list items to
        var ul = $('#ulMostPlayed');
        // Set counter
        var counter = 1;
        // Adjust size of rows to number of columns
        rows.length = totalList;
        rows.forEach((row) => {
            var artworkSource = MUSIC_PATH + row.artistName + "/" + row.albumName + "/folder.jpg"

            var albumLink = "./html/displayalbum.html?album=" + row.albumID + "&artist=" + row.artistID;

            // Create <li> item for each album and append to <ul>
            // First row of list
            if (counter <= totalFirstRow) {
                // Small art icons
                if (global_ArtIconSize == "small") {
                    $(ul).attr('class', 'albumDisplay');
                    var li = $('<li><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').append('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br> No. ' + counter);
                    li.appendTo(ul);
                }
                // Large art icons
                else {
                    $(ul).attr('class', 'albumDisplayLarge');
                    var li = $('<li><a><img class="' + global_ArtIconShape + '"><br><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').append('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br> No. ' + counter);
                    li.appendTo(ul);
                }
            }
            // Hidden rows of list
            else {
                // Small art icons
                if (global_ArtIconSize == "small") {
                    $(ul).attr('class', 'albumDisplay');
                    var li = $('<li class="mostPlayedHidden"><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').append('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br> No. ' + counter);
                    li.appendTo(ul);
                }
                // Large art icons
                else {
                    $(ul).attr('class', 'albumDisplayLarge');
                    var li = $('<li class="mostPlayedHidden"><a><img class="' + global_ArtIconShape + '"><br><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').append('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br> No. ' + counter);
                    li.appendTo(ul);
                }
            }
            // Artwork 404 handling
            $("." + global_ArtIconShape).bind("error", function () {
                // Replace with default image
                $(this).attr("src", "./graphics/notFound.gif");
            });
            // Increment counter for list items
            counter += 1;
        });
        // Shuffle tracks
        // Select all trackIDs from track table
        var sql = "SELECT trackID FROM track";
        var tracks = await dBase.all(sql);
        shuffleArray(tracks)
    }

    backgroundChange();

});