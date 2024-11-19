$(function () {
    // Get name of artist and album
    var artist = $("#selectedArtist").text();
    var album = $("#selectedAlbum").text();
    // Replace encoded &amp with &
    artist = artist.replace(/&amp;/g, '&');
    album = album.replace(/&amp;/g, '&');

    // Update headings
    $("#addToDatabaseDetails").text("Adding " + album + " by " + artist);
    $("#addToDatabaseInfo").append("&#x2022 Blank metadata fields can also be changed or completed later when editing the album.<br>&#x2022 The only required fields are Release Date and Genre.<br>&#x2022 Genre tags found are listed in the Metadata Results.<br>&#x2022 Once completed, click on the IMPORT button to add the album to " + global_AppName + " database.<br />")

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