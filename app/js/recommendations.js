$(document).ready(function () {
    // Set variable for overlay class on album image
    var overlay = "overlay";
    if (global_ArtIconShape == "round") {
        overlay = "overlayRound";
    }

    // Get artist name from hidden field
    var artist = $("#hiddenArtistName").text();
    // Display heading with artist name
    $("#recommendsArtistName").append(global_AppName + " Recommendations");
    $("#recommendsDetails").append("Based on " + artist);

    // Variable for album list
    var ul = $('#ulRecommends');

    // Send IPC to search Spotify for album and artist
    var query = artist + '&type=artist';

    ipcRenderer.send("spotify_getArtistID", [query])


});