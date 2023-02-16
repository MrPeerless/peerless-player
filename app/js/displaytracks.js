$(document).ready(function () {

    displayArtistTracks()

    async function displayArtistTracks() {
        switch (global_ArtistTrackSort) {
            case "a2zTrack":
                var sql = "SELECT track.trackID, track.artistID, track.albumID, track.count, track.lastPlay, track.favourite, artist.artistName, album.albumName, track.trackName FROM track INNER JOIN artist ON artist.artistID=track.artistID INNER JOIN album ON album.albumID=track.albumID WHERE track.artistID=?";
                break;
            case "a2zAlbum":
                var sql = "SELECT track.trackID, track.artistID, track.albumID, track.count, track.lastPlay, track.favourite, artist.artistName, album.albumName, track.trackName FROM track INNER JOIN artist ON artist.artistID=track.artistID INNER JOIN album ON album.albumID=track.albumID WHERE track.artistID=? ORDER BY album.albumName COLLATE NOCASE ASC";
                break;
            case "added":
                var sql = "SELECT track.trackID, track.artistID, track.albumID, track.count, track.lastPlay, track.favourite, artist.artistName, album.albumName, album.dateAdd, track.trackName FROM track INNER JOIN artist ON artist.artistID=track.artistID INNER JOIN album ON album.albumID=track.albumID WHERE track.artistID=? ORDER BY album.dateAdd DESC";
                break;
            case "played":
                var sql = "SELECT track.trackID, track.artistID, track.albumID, track.count, track.lastPlay, track.favourite, artist.artistName, album.albumName, track.trackName FROM track INNER JOIN artist ON artist.artistID=track.artistID INNER JOIN album ON album.albumID=track.albumID WHERE track.artistID=? ORDER BY track.lastPlay DESC";
                break;
            case "most":
                var sql = "SELECT track.trackID, track.artistID, track.albumID, track.count, track.lastPlay, track.favourite, artist.artistName, album.albumName, track.trackName FROM track INNER JOIN artist ON artist.artistID=track.artistID INNER JOIN album ON album.albumID=track.albumID WHERE track.artistID=? ORDER BY track.count DESC";
                break;
            case "release":
                var sql = "SELECT track.trackID, track.artistID, track.albumID, track.count, track.lastPlay, track.favourite, artist.artistName, album.albumName, album.releaseDate, track.trackName FROM track INNER JOIN artist ON artist.artistID=track.artistID INNER JOIN album ON album.albumID=track.albumID WHERE track.artistID=? ORDER BY album.releaseDate DESC";
        }

        var rows = await dBase.all(sql, global_ArtistID);
        var tracks = [];

        // Get number of tracks in database
        var numberTracks = numberWithCommas(rows.length);
        $("#tracksTitle").text(numberTracks + " Songs by " + rows[0].artistName);

        // Create select dropdown box for track sort
        var sort = " <b>Sort </b><select class='sltSort' id='sltArtistTrackSort'><option value='a2zTrack'>Track A - Z</option><option value='a2zAlbum'>Album A - Z</option><option value='added'>Date Added</option><option value='played'>Last Played</option><option value='most'>Most Played</option><option value='release'>Release Date</option></select>"

        $('#spnSelectMenu').append('<input type="text" id="ArtistSongSearch" name="songSearch" placeholder="Filter the song table.." title="Type in a term to filter">' + sort);

        rows.forEach((row) => {
            if (row.lastPlay) {
                row.lastPlay = formatDate(row.lastPlay);
            }
            else {
                row.lastPlay = "";
            }
            // Split trackName on first space to get track name without track number
            var trackName = row.trackName.split(/\s(.+)/)[1]

            // Add trackID to end of string with divider |
            var track = trackName + "|" + row.albumName + "|" + row.count + "|" + row.lastPlay + "|" + row.favourite + "|" + row.trackID;
            // Add string to albums array
            tracks.push(track);   
        });

        // Sort tracks A- Z if selected
        if (global_ArtistTrackSort == "a2zTrack") {
            tracks.sort(function (a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            });
        }

        // Highlight sort selected in dropdown box
        $('#sltArtistTrackSort').val(global_ArtistTrackSort);

        var table = $("#tblTracks")

        tracks.forEach((track) => { 
            // Set variables by splitting tracks array
            var splitTrack = track.split("|");
            var trackName = splitTrack[0];
            var albumName = splitTrack[1];
            var count = splitTrack[2];
            var lastPlay = splitTrack[3];
            var favourite = splitTrack[4];
            var trackID = splitTrack[5];

            // Set anchor for A to Z menu
            //var anchor = trackName.charAt(0);

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
            var tableRow = $("<tr class='tracks'><td>" + trackName + "</td><td>" + albumName + "</td><td class='count'>" + count + "</td><td class='lastPlay'>" + lastPlay + "</td><td class='favourite'><img class='favourite' src='" + favouriteImage + "' alt='" + alt + "' id='" + trackID + "'></td><td>" + trackID + "</td></tr>");

            // Append row to table
            tableRow.appendTo(table);
        });
    }

    // Function for Song Table search box
    $(document).on('keyup', '#ArtistSongSearch', function () {
        var input = $('#ArtistSongSearch').val().toLowerCase();
        $("#tblSongsBody tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(input) > -1)
        });
    });
});