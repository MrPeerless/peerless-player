$(document).ready(function () {

    // Get name of artist and album
    var artist = $("#selectedArtist").text();
    var album = $("#selectedAlbum").text();
    // Replace encoded &amp with &
    artist = artist.replace(/&amp;/g, '&');
    album = album.replace(/&amp;/g, '&');

    // Update headings
    $("#addToDatabaseDetails").html("Syncing " + album + " by " + artist);
    if (global_ImportMode == "auto") {
        $("#addToDatabaseInfo").html("The below metadata has been found in the Gracenote database.<br>Please check and make any manual adjustments if necessary and click on the IMPORT button to add the album to " + global_AppName + " database.<br>&nbsp;<br />")
    }
    else {
        $("#addToDatabaseInfo").html("You have selected to manually input the album metadata.<br>The only required fields are Release Date and Genre. Once completed, click on the IMPORT button to add the album to " + global_AppName + " database.<br>&nbsp;<br />")
    }

    // Add artist and album to form input
    $("#inpArtistName").val(artist);
    // Original artist name is used in case user changes the artist name so it can still be found in the directory
    $("#inpOriginalArtistName").val(artist);

    $("#inpAlbumName").val(album);
    // Original album name is used in case user changes the album name so it can still be found in the directory
    $("#inpOriginalAlbumName").val(album);
    // Remove any previous audio elements used to get tracks length
    $("#divAudioElements").empty();

    // Get all files in album directory
    ipcRenderer.send("read_album_directory", ["importtodatabase", MUSIC_PATH, artist, album]);
});