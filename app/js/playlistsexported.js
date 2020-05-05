$(document).ready(function () {
    // Constant variables for file system module
    const fs = require('fs');
    const path = require('path');
    var directoryPlaylists = [];

    // Read all playlist files from MUSIC_PATH playlist directory
    directoryPlaylists = fs.readdirSync(MUSIC_PATH + "Playlists")

    // Populate page text
    $('#exportedPlaylistsDetails').html(directoryPlaylists.length + " exported playlists found in your music directory.")
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