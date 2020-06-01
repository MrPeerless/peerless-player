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
        $(".modalFooter").empty();
        $('.modalHeader').html('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').html("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br>The directory is up to date.<br>&nbsp</p >");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        // Load home page and return
        $("#divTrackListing").css("display", "none");
        $("#divContent").css("width", "auto");
        $("#divContent").load("./html/home.html");
        return
    }

    // If new music and new playlists found
    else if (foundMusic.length != 0 && compareBirthtime.length != 0) {
        $('#syncDirectoryDetails').html(foundMusic.length + " new albums found in Database and new exported playlists to Sync with selected Directory: " + musicDir)
        $('#syncDirectoryInfo').html("Click on the checkboxes to select the albums you want to sync to the directory and then click on the Sync button.")
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
        $('#syncDirectoryDetails').html(compareBirthtime.length + " new exported playlists found in Music Directory to Sync with selected Directory: " + musicDir)
        $('#syncDirectoryInfo').html("Click on the checkbox to select the exported playlists to sync to the directory and then click on the Sync button.")
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
        $('#syncDirectoryDetails').html(foundMusic.length + " new albums found in Database to Sync with selected Directory: " + musicDir)
        $('#syncDirectoryInfo').html("Click on the checkboxes to select the albums you want to sync to the directory and then click on the Sync button.")
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
        $(".modalFooter").empty();
        $('.modalHeader').html('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').html("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br>No new music found in directory.<br>The database is up to date.<br>&nbsp</p >");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        $("#btnSync").prop("disabled", false);
        return
    }
    else {
        $('#displayNewMusicDetails').html(foundMusic.length + " new albums found in Directory<br>The below list of new albums have been found.")
        $('#displayNewMusicInfo').html("Select an album and click on the GET button to search for album metadata.<br>If no album metadata is found, select an album and click on the MANUAL button")

        var table = $("#tblGracenote")
        //var tableHeader = $("<tr><th class='rowGraceArtist'>Artist</th><th class='rowGraceAlbum'>Album</th><th class='rowGraceTracks'>No. Tracks</th></tr>");
        var tableHeader = $("<tr><th class='rowGraceArtist'>Artist</th><th class='rowGraceAlbum'>Album</th></tr>");
        tableHeader.appendTo(table);

        foundMusic.forEach((found) => {
            var splitAlbum = found.split("|");
            var artist = splitAlbum[0];
            var album = splitAlbum[1];
            //var trackCount = splitAlbum[2];

            // Create table row
            //var tableRow = $("<tr class='tracks'><td>" + artist + "</td><td>" + album + "</td><td>" + trackCount + "</td></tr>");
            var tableRow = $("<tr class='tracks'><td>" + artist + "</td><td>" + album + "</td></tr>");
            // Append row to table
            tableRow.appendTo(table);

            // Message to main to get number of music files in album directory
            //ipcRenderer.send("music_files", [MUSIC_PATH, artist, album])
        });
    }

    // Check heights, if tracklisting is less than screen height adjust
    var trackHeight = parseInt($("#divTrackListing").css("height"));
    var srnHeight = $(window).height()
    if (srnHeight > trackHeight) {
        $("#divTrackListing").css("height", srnHeight);
    }
});

