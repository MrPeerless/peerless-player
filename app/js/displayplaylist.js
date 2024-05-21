$(document).ready(function () {

    displayPlaylist()

    async function displayPlaylist() {
        // Select the playlist details from the database
        var sql = "SELECT * FROM playlists WHERE playlistID=?";
        var row = await dBase.get(sql, global_PlaylistID);

        // Clear shuffle tracks array
        global_ShuffleTracks = [];

        // Format date
        var created = formatDate(row.dateCreated);
        // Find number of tracks in trackList
        var tracks = row.trackList.split(",");
        var numberTracks = tracks.length;
        // Select artowrk for playlist
        var name = row.playlistName;
        if (name.includes("Favourites -")) {
            artworkSource = "./graphics/favourite_large.png";
        }
        else if (name == "Top 30") {
            artworkSource = "./graphics/top_30.png";
            row.playlistName = "";
        }
        else if (name == "Queued") {
            artworkSource = "./graphics/queued.png";
            row.playlistName = "";
        }
        else if (name == "Smart Playlist") {
            artworkSource = "./graphics/smart.png";
            row.playlistName = "";
        }
        else if (name == "New!") {
            artworkSource = "./graphics/new.png";
            row.playlistName = "";
        }
        else if (name == "Recommended") {
            artworkSource = "./graphics/recommended.png";
            row.playlistName = "";
        }
        else {
            artworkSource = "./graphics/playlist_background.png";
        }

        // Add tracks to each row of table
        var table = $("#tblTracks")

        // Split tracks into array
        var tracks = row.trackList.split(",");

        // Set counter
        var i;
        // Set total track time variables
        var totalMins = 0;
        var totalSecs = 0;

        // Create text for playlist details
        $("#displayPlaylistName").append("Playlist <br>" + name);
        $("#imgPlaylistArtwork").attr('src', artworkSource);

        // Loop through tracks array to populate tracks table
        for (i = 0; i < tracks.length; i++) {
            // Select GET query to database
            var sql = "SELECT track.trackID, track.artistID, track.albumID, track.trackName, track.fileName, track.playTime, track.lastPlay, track.count, track.favourite, artist.artistName, album.albumName FROM track INNER JOIN artist ON track.artistID=artist.artistID INNER JOIN album ON track.albumID=album.albumID WHERE track.trackID=?";
            var row = await dBase.get(sql, tracks[i]);

            // Get track playtime
            var time = row.playTime.split(":");
            var tick = parseInt(time[0]);
            totalMins += tick;
            var tock = parseInt(time[1]);
            totalSecs += tock;

            // Format date for lastPlay
            var lastPlay;
            if (row.lastPlay) {
                lastPlay = formatDate(row.lastPlay);
            }
            else {
                lastPlay = "";
            }

            // Link for favourite graphic
            var favouriteImage;
            var alt;
            if (row.favourite == true) {
                favouriteImage = "./graphics/favourite_red.png"
                alt = "Y"
            }
            else {
                favouriteImage = "./graphics/favourite_black.png"
                alt = "N"
            }

            // Create table row
            var tableRow = $("<tr class='tracks'><td>" + row.trackName + "</td><td>" + row.artistName + "</td><td>" + row.count + "</td><td>" + lastPlay + "</td><td><img class='favourite' src='" + favouriteImage + "' alt='" + alt + "' id='" + row.trackID + "'></td><td>" + row.artistName + "</td><td>" + row.albumName + "</td><td>" + tracks[i] + "</td></tr>");
            // Append row to table  
            tableRow.appendTo(table);
        }

        // Calculate total playlist time
        // Calculate seconds
        var seconds = totalSecs % 60;
        seconds = (seconds >= 10) ? seconds : "0" + seconds;
        var secMins = totalSecs / 60;
        // Calculate minutes
        var mins = secMins + totalMins;
        var minutes = parseInt(mins % 60);
        minutes = (minutes >= 10) ? minutes : "0" + minutes;
        // Calculate hours
        var hours = parseInt(mins / 60);

        var playlistTime;

        if (hours == 0) {
            playlistTime = minutes + ":" + seconds;
        }
        else {
            playlistTime = hours + ":" + minutes + ":" + seconds;
        }

        $("#displayPlaylistDetails").append("Created on " + created + "<br>Number of songs: " + numberTracks + "<br>Total play time: " + playlistTime + "<br>&nbsp<br>");

        //Get trackID of first track in album so that you can click PLAY button without selecting the first track
        if (!global_Playing) {
            global_TrackSelected = $('#tblTracks').find("tr:nth-child(2) td:last").text();
        }
        // Highlight track in table if it is currently playing
        nowPlaying()
    }

    backgroundChange();
});

