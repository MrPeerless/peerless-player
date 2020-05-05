$(document).ready(function () {

    displayTracks()

    async function displayTracks() {
        // Select all tracks from the database based on global_TrackSort
        switch (global_TrackSort) {
            case "a2z":
                var sql = "SELECT track.trackID, track.artistID, track.albumID, track.count, track.lastPlay, track.favourite, artist.artistName, album.albumName, track.trackName FROM track INNER JOIN artist ON artist.artistID=track.artistID INNER JOIN album ON album.albumID=track.albumID";
                break;
            case "artist":
                var sql = "SELECT track.trackID, track.artistID, track.albumID, track.count, track.lastPlay, track.favourite, artist.artistName, album.albumName, track.trackName FROM track INNER JOIN artist ON artist.artistID=track.artistID INNER JOIN album ON album.albumID=track.albumID ORDER BY artist.artistName COLLATE NOCASE ASC";
                break;
            case "added":
                var sql = "SELECT track.trackID, track.artistID, track.albumID, track.count, track.lastPlay, track.favourite, artist.artistName, album.albumName, album.dateAdd, track.trackName FROM track INNER JOIN artist ON artist.artistID=track.artistID INNER JOIN album ON album.albumID=track.albumID ORDER BY album.dateAdd DESC";
                break;
            case "played":
                var sql = "SELECT track.trackID, track.artistID, track.albumID, track.count, track.lastPlay, track.favourite, artist.artistName, album.albumName, track.trackName FROM track INNER JOIN artist ON artist.artistID=track.artistID INNER JOIN album ON album.albumID=track.albumID ORDER BY track.lastPlay DESC";
                break;
            case "most":
                var sql = "SELECT track.trackID, track.artistID, track.albumID, track.count, track.lastPlay, track.favourite, artist.artistName, album.albumName, track.trackName FROM track INNER JOIN artist ON artist.artistID=track.artistID INNER JOIN album ON album.albumID=track.albumID ORDER BY track.count DESC";
        }

        // Select all tracks from the database
        var rows = await dBase.all(sql);

        var tracks = [];
        // Get number of tracks in database
        var numberTracks = numberWithCommas(rows.length);
        $("#songTitle").text(numberTracks + " Songs");

        rows.forEach((row) => {
            if (row.lastPlay == null) {
                row.lastPlay = "";
            }
            else {
                row.lastPlay = formatDate(row.lastPlay);
            }
            // Split trackName on first space to get track name without track number
            var trackName = row.trackName.split(/\s(.+)/)[1]
            
            // Add trackID to end of string with divider |
            var track = trackName + "|" + row.artistName + "|" + row.albumName + "|" + row.count +  "|" + row.lastPlay + "|" + row.favourite + "|" + row.trackID;
            // Add string to albums array
            tracks.push(track);           
        });

        // Create select dropdown box for track sort
        var sort = " <b>Sort </b><select class='sltSort' id='sltTrackSort'><option value='a2z'>A - Z</option><option value='artist'>Artist</option><option value='added'>Date Added</option><option value='played'>Last Played</option><option value='most'>Most Played</option></select>"

        // If sort is set to A - Z
        if (global_TrackSort == "a2z") {
            // Sort albums array alphabetically using function in index.js
            tracks = sorted(tracks);

            // Call groupBy function to group albums by first letter
            var tracksGroups = tracks.groupBy(tracks)

            // Create A to Z menu
            var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var menu = "";

            // Create A to Z menu
            for (var i = 0; i < alphabet.length; i++) {
                if ((alphabet.charAt(i)) in tracksGroups) {
                    menu = menu + '<span style="margin-right: 1em;"><b><a href="#' + alphabet.charAt(i) + '"> ' + alphabet.charAt(i) + ' </a></b></span>';
                }
                else {
                    menu = menu + '<span style="margin-right: 1em;">' + alphabet.charAt(i) + '</b></span>';
                }
            }
            $('#spnAtoZmenu').html(menu + '<input type="text" id="songSearch" name="songSearch" placeholder="FIlter the song table.." title="Type in a term to filter">' + sort);
        }
        // If sort is not set to A - Z
        else {
            // Only display filter box and sort select
            $('#spnAtoZmenu').html('<input type="text" id="songSearch" name="songSearch" placeholder="FIlter the song table.." title="Type in a term to filter">' + sort);
        }

        // Highlight sort selected in dropdown box
        $('#sltTrackSort').val(global_TrackSort);

        var table = $("#tblSongs")

        tracks.forEach((track) => {
            // Set variables by splitting tracks array
            var splitTrack = track.split("|");
            var trackName = splitTrack[0];
            var artistName = splitTrack[1];
            var albumName = splitTrack[2];
            var count = splitTrack[3];
            var lastPlay = splitTrack[4];
            var favourite = splitTrack[5];
            var trackID = splitTrack[6];

            // Set anchor for A to Z menu
            var anchor = trackName.charAt(0);

            // Link for favourite graphic
            var favouriteImage;
            var alt;
            if (favourite == true) {
                favouriteImage = "./graphics/favourite_red.png"
                alt = "Y"
            }
            else {
                favouriteImage = "./graphics/favourite_black.png"
                alt = "N"
            }

            // Create table row
            var tableRow = $("<tr class='tracks' id='" + anchor + "'><td>" + trackName + "</td><td>" + artistName + "</td><td>" + albumName + "</td><td class='count'>" + count + "</td><td class='lastPlay'>" + lastPlay + "</td><td class='favourite'><img class='favourite' src='" + favouriteImage + "' alt='" + alt + "' id='" + trackID + "'></td><td>" + trackID + "</td></tr>");

            // Append row to table
            tableRow.appendTo(table);
        });
        // Shuffle tracks
        // Select all trackIDs from track table
        var sql = "SELECT trackID FROM track";
        var tracks = await dBase.all(sql);
        shuffleArray(tracks)
    }

    // Function for Song Table search box
    $(document).on('keyup', '#songSearch', function () {
        var input = $('#songSearch').val().toLowerCase();
        $("#tblSongsBody tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(input) > -1)
        });
    });
});