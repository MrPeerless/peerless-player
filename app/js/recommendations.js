$(function () {
    // Get artist name from hidden field
    var artist = $("#hiddenArtistName").text();
    // Display heading with artist name
    $("#recommendsArtistName").append(global_AppName + " Recommendations");
    $("#recommendsDetails").append("Based on " + artist);

    // Send IPC to search Spotify for album and artist
    ipcRenderer.send("spotify_getArtistID", [artist, "recommendations"])

    // The code to populate the recommendations.js page is in the ipcreply.js file
});