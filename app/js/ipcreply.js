// SENT FROM btnSyncDirClick() index.js
//--------------------------------------
// Response from selecting sync directory browse dialog box
// sync_directory
ipcRenderer.on("sync_directory", (event, data) => {
    //var musicPath = data[0];
    try {
        // Get value from dialog box
        var musicDir = data[0];
        // Replace backward slashes with forward slashes
        musicDir = musicDir.replace(/\\/g, "/") + "/";
        // Load Sync Directory Page
        $("#divContent").css("width", "475px");
        // Hide A to Z menu
        $('#spnAtoZmenu').css('display', 'none');
        // Hide Artist and Album column of Song table
        $("#tblSongs td:nth-child(2)").css("display", "none");
        $("#tblSongs th:nth-child(2)").css("display", "none");
        $("#tblSongs td:nth-child(3)").css("display", "none");
        $("#tblSongs th:nth-child(3)").css("display", "none");
        // Show and load newmusic.html file
        $("#divTrackListing").css("display", "block");
        $('#divTrackListing').load("./html/syncdirectory.html");
        // Enable btnSync
        $("#btnSync").prop("disabled", false);
        $(document).ajaxComplete(function () {
            $(document).scrollTop(0);
            $("#selectedDir").text(musicDir);
        });
    }
    catch{
        return;
    }
});

// SENT FROM 'click', '#btnMusicDirectory' index.js
//--------------------------------------------------
// Response from selecting music directory browse dialog box
// music_directory
ipcRenderer.on("music_directory", (event, data) => {
    var musicPath = data[0];
    if (musicPath) {
        // Replace backward slashes with fporward slashes
        musicPath = musicPath.replace(/\\/g, "/") + "/";
        $("#ipnMusicDirectory").val(musicPath);
    }
});

// SENT FROM syncDirectory() index.js
//------------------------------------
// Data received for syncdirectory.js from main to display albums to sync
// from_sync_external
ipcRenderer.on("from_sync_external", (event, data) => {
    var directoryAlbums = data[0];
    var playlistsBirthtime = data[1];
    var externalBirthtime = data[2];
    var databaseAlbums = data[3];
    var compareBirthtime = [];
    var foundMusic = [];
    const musicDir = $("#selectedDir").text();

    // Compare directoryAlbums and databaseAlbums and populate foundMusic
    $.grep(databaseAlbums, function (album) {
        if ($.inArray(album, directoryAlbums) == -1) foundMusic.push(album);
    });

    // Compare playlistsBirthtime and externalBirthtime and populate compareBirthtime
    $.grep(playlistsBirthtime, function (birthtime) {
        if ($.inArray(birthtime, externalBirthtime) == -1) compareBirthtime.push(birthtime);
    });

    // If no new music found and no new playlists
    if (foundMusic.length == 0 && compareBirthtime.length == 0) {
        // Display modal information box
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br>The directory is up to date.<br>&nbsp</p >");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        // Load home page and return
        $("#divTrackListing").css("display", "none");
        $("#divContent").css("width", "auto");
        $("#divContent").load("./html/home.html");
        $('.background').css('filter', 'blur(5px)');
        return
    }

    // If new music and new playlists found
    else if (foundMusic.length != 0 && compareBirthtime.length != 0) {
        $('#syncDirectoryDetails').text(foundMusic.length + " new albums found in Database and new exported playlists to Sync with selected Directory: " + musicDir)
        $('#syncDirectoryInfo').text("Click on the checkboxes to select the albums you want to sync to the directory and then click on the Sync button.")
        var table = $("#tblSyncDirectory")
        var tableHeader = $("<tr><th><input type='checkbox' id='cbxSyncDirAll'/></th><th>Artist</th><th>Album</th></tr>");
        tableHeader.appendTo(table);

        // Create table row for Playlists
        var tableRow = $("<tr class='tracks'><td><input type='checkbox' class='cbxSyncDir'/></td><td>Exported Playlists</td><td></td></tr>");
        // Append row to table
        tableRow.appendTo(table);

        // Create table row for each album
        foundMusic.forEach((found) => {
            var splitAlbum = found.split("|");
            var artist = splitAlbum[0];
            var album = splitAlbum[1];

            // Create table row
            var tableRow = $("<tr class='tracks'><td><input type='checkbox' class='cbxSyncDir'/></td><td>" + artist + "</td><td>" + album + "</td></tr>");
            // Append row to table
            tableRow.appendTo(table);
        });
    }

    // If no new music and new playlists found
    else if (foundMusic.length == 0 && compareBirthtime.length != 0) {
        $('#syncDirectoryDetails').text(compareBirthtime.length + " new exported playlists found in Music Directory to Sync with selected Directory: " + musicDir)
        $('#syncDirectoryInfo').text("Click on the checkbox to select the exported playlists to sync to the directory and then click on the Sync button.")
        var table = $("#tblSyncDirectory")
        var tableHeader = $("<tr><th><input type='checkbox' id='cbxSyncDirAll'/></th><th>Artist</th><th>Album</th></tr>");
        tableHeader.appendTo(table);

        // Create table row for Playlists
        var tableRow = $("<tr class='tracks'><td><input type='checkbox' class='cbxSyncDir'/></td><td>Exported Playlists</td><td></td></tr>");
        // Append row to table
        tableRow.appendTo(table);
    }

    // If new music and no playlists found
    else if (foundMusic.length != 0 && compareBirthtime.length == 0) {
        $('#syncDirectoryDetails').text(foundMusic.length + " new albums found in Database to Sync with selected Directory: " + musicDir)
        $('#syncDirectoryInfo').text("Click on the checkboxes to select the albums you want to sync to the directory and then click on the Sync button.")
        var table = $("#tblSyncDirectory")
        var tableHeader = $("<tr><th><input type='checkbox' id='cbxSyncDirAll'/></th><th>Artist</th><th>Album</th></tr>");
        tableHeader.appendTo(table);

        foundMusic.forEach((found) => {
            var splitAlbum = found.split("|");
            var artist = splitAlbum[0];
            var album = splitAlbum[1];

            // Create table row
            var tableRow = $("<tr class='tracks'><td><input type='checkbox' class='cbxSyncDir'/></td><td>" + artist + "</td><td>" + album + "</td></tr>");
            // Append row to table
            tableRow.appendTo(table);
        });
    }
});

// SENT FROM newmusic.js
//---------------------
// Recieve all directory artists/albums from main.js for newmusic.js
// from_dir_artists
ipcRenderer.on("from_dir_artists", (event, data) => {
    var directoryAlbums = data[0]
    var databaseAlbums = data[1];
    var foundMusic = [];

    // Compare directoryAlbums and databaseAlbums and populate foundMusic
    $.grep(directoryAlbums, function (album) {
        if ($.inArray(album, databaseAlbums) == -1) foundMusic.push(album);
    });

    // If no new music found
    if (foundMusic.length == 0) {
        // Hide trackListing and show content
        $("#divTrackListing").css("display", "none");
        var srnWidth = $(window).width();
        var width = (srnWidth - 240);
        $("#divContent").css("width", width);

        // Show A to Z menu
        $('#spnAtoZmenu').css('display', 'inline')
        // Show Artist and Album column of Songs table
        $("#tblSongs td:nth-child(2)").css("display", "table-cell");
        $("#tblSongs th:nth-child(2)").css("display", "table-cell");
        $("#tblSongs td:nth-child(3)").css("display", "table-cell");
        $("#tblSongs th:nth-child(3)").css("display", "table-cell");

        // Display modal information box
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br>No new music found in directory.<br>The database is up to date.<br>&nbsp</p >");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        $("#btnSync").prop("disabled", false);
        $('.background').css('filter', 'blur(5px)');
        return
    }
    else {
        $('#displayNewMusicDetails').append(foundMusic.length + " new albums found in Directory<br>The below list of new albums have been found.")
        $('#displayNewMusicInfo').append("First select either Album or Single from the radio buttons.<br>Then select an album to import from the table below.<br>Once the selected album is highlighted in the table, click on the IMPORT button.")

        var table = $("#tblImportMusic")
        var tableHeader = $("<tr><th class='rowGraceArtist'>Artist</th><th class='rowGraceAlbum'>Album</th></tr>");
        tableHeader.appendTo(table);

        foundMusic.forEach((found) => {
            var splitAlbum = found.split("|");
            var artist = splitAlbum[0];
            var album = splitAlbum[1];

            // Create table row
            var tableRow = $("<tr class='tracks'><td>" + artist + "</td><td>" + album + "</td></tr>");
            // Append row to table
            tableRow.appendTo(table);
        });
    }

    // Check heights, if tracklisting is less than screen height adjust
    var trackHeight = parseInt($("#divTrackListing").css("height"));
    var srnHeight = $(window).height()
    if (srnHeight > trackHeight) {
        $("#divTrackListing").css("height", srnHeight);
    }
});

// SENT FROM recommendations.
//------------------------------------
// Data received for recommendations.js from main to display recommended albums from spotify
ipcRenderer.on("from_getArtistID", (event, data) => {
    var spotifyResponse = data[0];
    var artist = data[1];
    var artistFound = false;
    var numberArtists = spotifyResponse.artists.items.length;

    for (var i = 0; i < numberArtists; i++) {
        var name = spotifyResponse.artists.items[i].name;
        if (artist == name) {
            var spotifyID = spotifyResponse.artists.items[i].id;
            ipcRenderer.send("spotify_recommendations", [spotifyID]);
            artistFound = true;
            break;
        }
    }

    if (artistFound == false) {
        // Display modal information box
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br><b>No recommendations could be found.</b><br><br>&nbsp</p >");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        $("#btnSync").prop("disabled", false);
        $('.background').css('filter', 'blur(5px)');
        // Hide recommendations page and go back
        $("#divTrackListing").css("display", "none");
        $("#divContent").css("width", "auto");
        window.history.back();
        return false;
    }
});

ipcRenderer.on("from_recommendations", (event, data) => {
    var spotifyResponse = data;
    var numberRecommendations = spotifyResponse[0].tracks.length

    $("#recommendsCount").append(numberRecommendations + " Recommendations Found");

    if (numberRecommendations > 1) {
        // Get each spotify albumID
        $.each(spotifyResponse[0].tracks, function (i, tracks) {
            var spotifyalbumID = tracks.album.id
            ipcRenderer.send("spotify_album", [spotifyalbumID])
        });
    }
    else {
        // Display modal information box
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br><b>No recommendations could be found.</b><br><br>&nbsp</p >");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        $("#btnSync").prop("disabled", false);
        $('.background').css('filter', 'blur(5px)');
        // Hide recommendations page and go back
        $("#divTrackListing").css("display", "none");
        $("#divContent").css("width", "auto");
        window.history.back();
        return false;
    }
});

ipcRenderer.on("from_album", (event, data) => {
    var spotifyResponse = data[0];
    var artist = spotifyResponse.artists[0].name;
    var title = spotifyResponse.name;
    var imageLink = spotifyResponse.images[1].url;

    // Set variable for overlay class on album image
    var overlay = "overlay";
    if (global_ArtIconShape == "round") {
        overlay = "overlayRound";
    }

    // Variable for album list
    var ul = $('#ulRecommends');

    // Napster search link for album
    var albumLink = napsterUrl + artist + "+" + title;
    var encodedUrl = encodeURI(albumLink);

    if (global_ArtIconSize == "small") {
        $(ul).attr('class', 'albumDisplay');
        var li = $('<li><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
        li.find('img').attr('src', imageLink);
        li.find('a').attr('href', encodedUrl);
        li.find('a').attr('target', '_blank');
        li.find('span').append('<br><b>' + artist + '</b><br>' + title);
        li.appendTo(ul);
    }

    // Large art icons
    else {
        $(ul).attr('class', 'albumDisplayLarge');
        var li = $('<li><a><img class="' + global_ArtIconShape + '"><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
        li.find('img').attr('src', imageLink);
        li.find('a').attr('href', encodedUrl);
        li.find('a').attr('target', '_blank');
        li.find('span').append('<br><b>' + artist + '</b><br>' + title);
        li.appendTo(ul);
    }
});

// ---------------------------------------
// Display Modal Information box for uncaught error in main process.
ipcRenderer.on("from_main_error", (event, data) => {  
    var error = data;
    console.log("main.js uncaughtException error: " + error);
    // Display modal information box
    $('#okModal').css('display', 'block');
    $('.modalHeader').empty();
    $('#okModalText').empty();
    $(".modalFooter").empty();
    $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
    $('#okModalText').append("<div class='modalIcon'><img src='./graphics/warning.png'></div><p>&nbsp<br><b>Uncaught Error in Main Process.</b><br>" + error + "<br>&nbsp</p >");
    var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
    $('.modalFooter').append(buttons);
    $("#btnOkModal").focus();
    $("#btnSync").prop("disabled", false);
    $('.background').css('filter', 'blur(5px)');
    return
});
