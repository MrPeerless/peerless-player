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

            // Get folder.jpg file path
            var sourceFile = MUSIC_PATH + row.artistName + "/" + row.albumName + "/folder.jpg";
            // Find folder.jpg last modified date
            try {
                var modifiedDate = fs.statSync(sourceFile).mtime;
                var artworkSource = MUSIC_PATH + row.artistName + "/" + row.albumName + "/folder.jpg?modified=" + modifiedDate;
            }
            catch{
                var artworkSource = "./graphics/genres/Other.gif"
            }

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
                    li.find('span').html('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br>' + albumDate);
                    li.appendTo(ul);
                }
                // Large art icons
                else {
                    $(ul).attr('class', 'albumDisplayLarge');
                    var li = $('<li><a><img class="' + global_ArtIconShape + '"><br><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').html('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br>' + albumDate);
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
                    li.find('span').html('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br>' + albumDate);
                    li.appendTo(ul);
                }
                // Large art icons
                else {
                    $(ul).attr('class', 'albumDisplayLarge');
                    var li = $('<li class="addedHidden"><a><img class="' + global_ArtIconShape + '"><br><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').html('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br>' + albumDate);
                    li.appendTo(ul);
                }              
            }
            // Increment counter for list items
            counter += 1;
        });
    }

    displayRecentlyPlayed()

    async function displayRecentlyPlayed() {
        // Select all albums from the database by added date
        var sql = "SELECT album.albumID, artist.artistID, album.albumName, artist.artistName, album.releaseDate, album.albumLastPlay FROM album INNER JOIN artist ON album.artistID=artist.artistID ORDER BY album.albumLastPlay DESC";
        var rows = await dBase.all(sql);

        // Unordered list to attach list items to
        var ul = $('#ulRecentlyPlayed');
        // Set counter
        var counter = 1;
        // Adjust size of rows to number of columns
        rows.length = totalList;
        rows.forEach((row) => {
            // Get folder.jpg file path
            var sourceFile = MUSIC_PATH + row.artistName + "/" + row.albumName + "/folder.jpg";
            // Find folder.jpg last modified date
            try {
                var modifiedDate = fs.statSync(sourceFile).mtime;
                var artworkSource = MUSIC_PATH + row.artistName + "/" + row.albumName + "/folder.jpg?modified=" + modifiedDate;
            }
            catch{
                var artworkSource = "./graphics/genres/Other.gif"
            }

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
                    li.find('span').html('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br>' + albumDate);
                    li.appendTo(ul);
                }
                // Large art icons
                else {
                    $(ul).attr('class', 'albumDisplayLarge');
                    var li = $('<li><a><img class="' + global_ArtIconShape + '"><br><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').html('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br>' + albumDate);
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
                    li.find('span').html('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br>' + albumDate);
                    li.appendTo(ul);
                }
                // Large art icons
                else {
                    $(ul).attr('class', 'albumDisplayLarge');
                    var li = $('<li class="playedHidden"><a><img class="' + global_ArtIconShape + '"><br><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').html('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br>' + albumDate);
                    li.appendTo(ul);
                }
            }
            // Increment counter for list items
            counter += 1;
        });
    }

    displayMostPlayed()

    async function displayMostPlayed() {
        // Select all albums from the database by added date
        var sql = "SELECT album.albumID, artist.artistID, album.albumName, artist.artistName, album.albumCount FROM album INNER JOIN artist ON album.artistID=artist.artistID ORDER BY album.albumCount DESC";
        var rows = await dBase.all(sql);

        // Unordered list to attach list items to
        var ul = $('#ulMostPlayed');
        // Set counter
        var counter = 1;
        // Adjust size of rows to number of columns
        rows.length = totalList;
        rows.forEach((row) => {
            // Get folder.jpg file path
            var sourceFile = MUSIC_PATH + row.artistName + "/" + row.albumName + "/folder.jpg";
            // Find folder.jpg last modified date
            try {
                var modifiedDate = fs.statSync(sourceFile).mtime;
                var artworkSource = MUSIC_PATH + row.artistName + "/" + row.albumName + "/folder.jpg?modified=" + modifiedDate;
            }
            catch{
                var artworkSource = "./graphics/genres/Other.gif"
            }

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
                    li.find('span').html('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br> No. ' + counter);
                    li.appendTo(ul);
                }
                // Large art icons
                else {
                    $(ul).attr('class', 'albumDisplayLarge');
                    var li = $('<li><a><img class="' + global_ArtIconShape + '"><br><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').html('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br> No. ' + counter);
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
                    li.find('span').html('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br> No. ' + counter);
                    li.appendTo(ul);
                }
                // Large art icons
                else {
                    $(ul).attr('class', 'albumDisplayLarge');
                    var li = $('<li class="mostPlayedHidden"><a><img class="' + global_ArtIconShape + '"><br><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').html('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br> No. ' + counter);
                    li.appendTo(ul);
                }
            }
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