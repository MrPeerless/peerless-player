//###################
// Playlist Functions
//###################
// Create playlists
$(document).on('click', '#btnCreate', function (event) {
    event.preventDefault();
    btnCreateClicked()
});
// Menu click
ipcRenderer.on('New Playlist', (event) => {
    btnCreateClicked()
});
function btnCreateClicked() {
    // Set height of playlist DIV
    if (global_Playing == true) {
        var divHeight = 330;
    }
    else {
        var divHeight = 110;
    }
    $("#divPlaylist").css("top", divHeight);
    $('#divPlaylist').load("./html/playlistcreate.html");
    $("#divPlaylist").fadeIn();
}

// Edit playlists
$(document).on('click', '#btnEdit', function (event) {
    event.preventDefault();
    // Set height of playlist DIV
    if (global_Playing == true) {
        var divHeight = 330;
    }
    else {
        var divHeight = 110;
    }
    // Display edit playlist
    $("#divPlaylist").fadeIn();
    $("#divPlaylist").css("top", divHeight);
    $('#divPlaylist').load("./html/playlistedit.html");
});

// Close Create playlists
$(document).on('click', '#btnClosePlaylist', function () {
    if ($("#divPlaylist").is(":visible")) {
        $("#divPlaylist").fadeOut();
    }
});

// Menu click
ipcRenderer.on('Close Without Saving', (event) => {
    $("#divPlaylist").fadeOut();
});

// Add track to playlist
$(document).on('click', '#btnAddToPlaylist', function () {
    btnAddToPlaylistClicked()
});
// Menu click
ipcRenderer.on('Add Selected Track', (event) => {
    btnAddToPlaylistClicked()
});
function btnAddToPlaylistClicked() {
    // Append trackID and track name to select option box
    $('#sltPlaylist').append($('<option>', {
        value: global_TrackSelected,
        text: global_TrackName
    }));
}

// Delete track from playlist
$(document).on('click', '#btnDeleteFromPlaylist', function () {
    $('#sltPlaylist option:selected').remove();
});
// Menu click
ipcRenderer.on('Delete Selected Track', (event) => {
    $('#sltPlaylist option:selected').remove();
});

// Move track up in playlist
$(document).on('click', '#btnUpPlaylist', function () {
    btnUpPlaylistClicked()
});
// Menu click
ipcRenderer.on('Move Track Up', (event) => {
    btnUpPlaylistClicked()
});
function btnUpPlaylistClicked() {
    // Move selected option up in select option box
    var selected = $("#sltPlaylist option:selected");
    var prev = selected.prev();
    selected.after(prev);
}

// Move track down in playlist
$(document).on('click', '#btnDownPlaylist', function () {
    btnDownPlaylistClicked()
});
// Menu click
ipcRenderer.on('Move Track Down', (event) => {
    btnDownPlaylistClicked()
});
function btnDownPlaylistClicked() {
    // Move selected option down in select option box
    var selected = $("#sltPlaylist option:selected");
    var next = selected.next();
    selected.before(next);
}

// Save playlist button click
$(document).on('click', '#btnSavePlaylist', function (event) {
    event.preventDefault();
    playlistAdd();
});
// Menu click
ipcRenderer.on('Save Playlist', (event) => {
    playlistAdd();
});

async function playlistAdd() {
    // Get values from frmNewPlaylist form to insert into database
    var playlistName = $('#inpPlaylistName').val();
    if ($('#inpPlaylistName').val().length == 0) {
        // Show modal to display error
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/warning.png'></div><p>&nbsp<br><b>ERROR</b> - please enter a name for the playlist.<br>&nbsp<br>&nbsp</p >");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        $('.background').css('filter', 'blur(5px)');
        return
    }

    // Get trackIDs from the values of the select box
    var tracksArray = [];
    $('#sltPlaylist > option').each(function () {
        tracksArray.push(this.value);
    });
    var tracks = tracksArray.join(',');
    if (!tracks) {
        // Show modal to display error
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/warning.png'></div><p>&nbsp<br><b>ERROR</b> - please add some tracks to the playlist.<br>&nbsp<br>&nbsp</p >");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        $('.background').css('filter', 'blur(5px)');
        return
    }

    var todayDate = new Date();
    var dateCreated = convertDate(todayDate);
    // Create sql variable to insert
    var entry = `"${playlistName}","${tracks}","${dateCreated}"`
    var sql = "INSERT INTO playlists (playlistName, trackList, dateCreated) " + "VALUES (" + entry + ")";
    var insert = await dBase.run(sql);
    if (insert) {
        // Show modal box to confirm playlist added to database
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br>Playlist has been added to " + global_AppName + ".<br>&nbsp<br>&nbsp</p >");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        $("#divPlaylist").fadeOut();
        $('.background').css('filter', 'blur(5px)');
    }
    else {
        // Show modal to display
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/warning.png'></div><p>&nbsp<br><b>DATABASE ERROR</b> - playlist not added to " + global_AppName + ".<br>&nbsp<br>&nbsp</p >");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        $('.background').css('filter', 'blur(5px)');
    }
}

// Update playlist button click
$(document).on('click', '#btnUpdatePlaylist', function (event) {
    event.preventDefault();
    playlistUpdate();
});

async function playlistUpdate() {
    // Get values from frmNewPlaylist form to insert into database
    var playlistName = $('#inpPlaylistName').val();
    var playlistID = $('#inpEditPlaylistID').val();
    // Get trackIDs from the values of the select box
    var tracksArray = [];
    $('#sltPlaylist > option').each(function () {
        tracksArray.push(this.value);
    });
    var tracks = tracksArray.join(',');
    var todayDate = new Date();
    var dateCreated = convertDate(todayDate);
    // Create sql variable to update
    var sql = "UPDATE playlists SET playlistName='" + playlistName + "', trackList='" + tracks + "' WHERE playlistID=" + playlistID;
    var update = await dBase.run(sql);
    if (update) {
        // Show modal box to confirm playlist added to database
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br>Playlist has been updated in " + global_AppName + ".<br>&nbsp<br>&nbsp</p >");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        $('.background').css('filter', 'blur(5px)');
        $("#divPlaylist").fadeOut();
    }
    else {
        // Show modal to display error
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/warning.png'></div><p>&nbsp<br><b>DATABASE ERROR</b> - playlist not updated in " + global_AppName + ".<br>&nbsp<br>&nbsp</p >");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        $('.background').css('filter', 'blur(5px)');
    }
}

// Export playlist
$(document).on('click', '#btnExport', async function () {
    event.preventDefault();
    exportPlaylist()
});

async function exportPlaylist() {
    // Get playlist/favourite name to use as file name
    var playlistName = $('#displayPlaylistName').text();
    fileName = playlistName + ".m3u";
    // Get array of tracks from track table
    var tracks = $('#tblTracks tr').find('td:last').map(function () {
        return $(this).text()
    }).get()
    // Open/Create file in Playlists folder for writing
    ipcRenderer.send("open_playlists", [MUSIC_PATH, fileName])

    // Set counter
    var i;
    // Loop through tracks array to populate tracks table
    for (i = 0; i < tracks.length; i++) {
        var sql = "SELECT artist.artistName, album.albumName, track.fileName FROM track INNER JOIN album ON album.albumID=track.albumID INNER JOIN artist ON artist.artistID= track.artistID WHERE trackID=?";
        var details = await dBase.get(sql, tracks[i]);
        // Date line to append to playlist file
        var dataPath = "/Music/" + details.artistName + "/" + details.albumName + "/" + details.fileName + "\n";
        // Send dataPath to append to file
        ipcRenderer.send("append_playlists", [MUSIC_PATH, fileName, dataPath])
    }
    // Show modal box to confirm playlist file saved 
    $('#okModal').css('display', 'block');
    $('.modalHeader').empty();
    $('#okModalText').empty();
    $(".modalFooter").empty();
    $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
    $('#okModalText').append("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br><b>" + fileName + "</b> has been saved in Playlists folder of " + global_AppName + ".<br>&nbsp</p>");
    var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
    $('.modalFooter').append(buttons);
    $("#btnOkModal").focus();
    $('.background').css('filter', 'blur(5px)');
}

// View Exported Playlists
// Click event for Player Functions View Exported Playlists
$(document).on('click', '#btnExportedPlaylists', function (event) {
    event.preventDefault();
    btnExportedPlaylistsClick()
});

// Cancel button on view exported playlists
$(document).on('click', '#btnExportedClose', function (event) {
    event.preventDefault();
    $("#tblExportedPlaylists").empty();
    $("#divTrackListing").css("display", "none");
    $('#spnAtoZmenu').css('display', 'inline');
    $("#divContent").css("width", "auto");
    
    window.history.back();
});

function btnExportedPlaylistsClick() {
    // Load playlists exported Page
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
    $('#divTrackListing').load("./html/playlistsexported.html");
    // Enable btnSync
    $("#btnSync").prop("disabled", false);
    $(document).ajaxComplete(function () {
        $(document).scrollTop(0);
        backgroundChange()
    });
}

// Change event when ExportedPLaylistsAll is checked
$(document).on('click', '#cbxExportedPLaylistsAll', function () {
    // If select all checkbox is selected
    if (this.checked == true) {
        // Check all checkboxes
        $('.cbxExportedPLaylists').each(function () {
            this.checked = true;
        });
    }
    // If select all checkbox is unselected
    else {
        // Uncheck all checkboxes
        $('.cbxExportedPLaylists').each(function () {
            this.checked = false;
        });
    }
});

// Click event for exported playlists delete button
$(document).on('click', '#btnExportedDelete', function () {
    event.preventDefault();
    // CHeck if any checkboxes have been clicked on
    var numberChecks = $("#tblExportedPlaylists input[type=checkbox]:checked").length;
    if (numberChecks > 0) {
        var dir = MUSIC_PATH + "Playlists/";
        // Get checked playlist names from exported playlists table
        $("#tblExportedPlaylists input[type=checkbox]:checked").each(function () {
            var row = $(this).closest("tr")[0];
            var playlist = row.cells[1].innerText;
            // Check if table header row is checked and ignore
            if (playlist != "Playlist Name") {
                // Add file extension to playlist name
                playlist = playlist + ".m3u";
                ipcRenderer.send("delete_playlists", [dir, playlist])
            }
        });

        // Display modal box updating directory
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br>Selected exported playlists have been deleted.<br>&nbsp<br>&nbsp</p >");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        $('.background').css('filter', 'blur(5px)');
        // Return to previous page
        $('#spnAtoZmenu').css('display', 'inline');
        $("#divTrackListing").css("display", "none");
        $("#divContent").css("width", "auto");
        window.history.back();
    }
});

// Delete playlist
// Display delete modal box when delete button clicked
$(document).on('click', '#btnDeletePlaylist', function () {
    $('#okModal').css('display', 'block');
    $('.modalHeader').empty();
    $('#okModalText').empty();
    $(".modalFooter").empty();
    $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
    $('#okModalText').append("<div class='modalIcon'><img src='./graphics/question.png'></div><p>&nbsp<br>Are you sure you want to delete this playlist from " + global_AppName + "?<br>&nbsp</p >");
    var buttons = $("<button class='btnContent' id='btnDeleteOkPlaylist'>Yes</button> <button class='btnContent' id='btnCancelModal'>No</button>");
    $('.modalFooter').append(buttons);
    $("#btnDeleteOkPlaylist").focus();
    $('.background').css('filter', 'blur(5px)');
});

// OK delete playlist button click
$(document).on('click', '#btnDeleteOkPlaylist', function (event) {
    event.preventDefault();
    deletePlaylist()
    async function deletePlaylist() {
        // Delete playlist from database
        var sql = "DELETE FROM playlists WHERE playlistID=" + global_PlaylistID;
        var update = await dBase.run(sql)
        // Close modal box and tracklisting and reload playlists file
        $('#okModal').css('display', 'none');
        $("#divTrackListing").css("display", "none");
        $("#divContent").css("width", "auto");
        $("#divContent").load("./html/playlists.html")
        $("#divPlaylist").css('display', 'none');
        $('.background').css('filter', 'blur(0px)');
    }
});

//#################################
// Queued music functions
//#################################
// Function for queued music
function btnQueueClicked() {
    if (global_Queued == false) {
        global_Tracks = [];
        global_Tracks[0] = global_TrackSelected;
        $('#nowPlayingTrackIndex').text("-1");
        global_Queued = true;
        queuePlaylist();
        // Display modal box confirmation
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br>Queued: " + global_TrackName + ".<br>&nbsp<br>&nbsp</p >");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        $('.background').css('filter', 'blur(5px)');
    }
    else {
        global_Tracks.push(global_TrackSelected);
        queuePlaylist();
        // Display modal box confirmation
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br>Queued: " + global_TrackName + ".<br>&nbsp<br>&nbsp</p >");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        $('.background').css('filter', 'blur(5px)');
    }
}

// Function to queue album
function btnQueueAlbumClicked() {
    // Get all tracksIDs for album from track listing table hidden last column
    var albumTracks = $('.tblTrackTable tr').find('td:last').map(function () {
        return $(this).text()
    }).get()

    // Add track IDs for album to global_Tracks
    albumTracks.forEach((track) => {
        global_Tracks.push(track);
    });

    // Update Queued Playlist
    queuePlaylist();

    // Display modal box confirmation
    $('#okModal').css('display', 'block');
    $('.modalHeader').empty();
    $('#okModalText').empty();
    $(".modalFooter").empty();
    $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
    $('#okModalText').append("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br>Queued Album: " + $('#displayAlbumName').text() + ".<br>&nbsp<br>&nbsp</p >");
    var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
    $('.modalFooter').append(buttons);
    $("#btnOkModal").focus();
    $('.background').css('filter', 'blur(5px)');
}

// Function to clear queued music
function btnClearQueuedClicked() {
    global_Tracks = [];
    global_TrackSelected = "";
    // Reset index
    $('#nowPlayingTrackIndex').text("-1");
    // Update Queued Playlist
    queuePlaylist();
    // Display modal box confirmation
    $('#okModal').css('display', 'block');
    $('.modalHeader').empty();
    $('#okModalText').empty();
    $(".modalFooter").empty();
    $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
    $('#okModalText').append("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br>Queued music has been cleared.<br>&nbsp<br>&nbsp</p >");
    var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
    $('.modalFooter').append(buttons);
    $("#btnOkModal").focus();
    $('.background').css('filter', 'blur(5px)');
}

// Queue playlist function
async function queuePlaylist() {
    // Get todays date
    var todayDate = new Date()
    todayDate = convertDate(todayDate)
    var queued = "";

    // Take trackIDs and place into queued string variable
    global_Tracks.forEach((track) => {
        queued = queued + track + ",";
    });
    // Remove last comma "," newPlaylist string variable
    queued = queued.substring(0, queued.length - 1);
    // Check if queued playlist already exists. If it does update else insert
    var sql = "SELECT COUNT(*) AS count FROM playlists WHERE playlistName='Queued'";
    var check = await dBase.get(sql);
    // If queued exists then update
    if (check.count != 0) {
        // Update queued Playlist
        var sql = "UPDATE playlists SET trackList='" + queued + "', dateCreated='" + todayDate + "' WHERE playlistName='Queued'";
        var update = await dBase.run(sql)
    }
    // If queued does not exist then insert
    else {
        // Insert queued Playlist
        var entry = `"${'Queued'}","${queued}","${todayDate}"`
        var sql = "INSERT INTO playlists (playlistName, trackList, dateCreated) " + "VALUES (" + entry + ")";
        var insert = await dBase.run(sql)
    }
}

// Receive files to display exported playlists
ipcRenderer.on("from_get_playlists", (event, data) => {
    var directoryPlaylists = data;
    if (directoryPlaylists == "") {
        // Display modal box no playlist files
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br>No exported playlist files.<br>&nbsp<br>&nbsp</p >");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        $('.background').css('filter', 'blur(5px)');
        $("#divTrackListing").css("display", "none");
        $("#divContent").css("width", "auto");
        return;
    }
    // Populate page text
    $('#exportedPlaylistsDetails').text(directoryPlaylists.length + " exported playlists found in your music directory.")
    var table = $("#tblExportedPlaylists")
    // Populate table header
    var tableHeader = $("<tr><th class='rowExportCheck'><input type='checkbox' id='cbxExportedPLaylistsAll'/></th><th class='rowExportName'>Playlist Name</th></tr>");
    tableHeader.appendTo(table);

    // Populate table rows with playlist names
    directoryPlaylists.forEach((playlist) => {
        //Remove file extension from playlist filename
        playlist = playlist.substring(0, playlist.length - 4)
        // Create table row for each Playlist
        var tableRow = $("<tr class='tracks'><td><input type='checkbox' class='cbxExportedPLaylists'/></td><td>" + playlist + "</td><td></td></tr>");
        // Append row to table
        tableRow.appendTo(table);
    });

    backgroundChange()
});