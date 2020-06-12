$(document).ready(function () {
    // Set variable for overlay class on album image
    var overlay = "overlay";
    if (global_ArtIconShape == "round") {
        overlay = "overlayRound";
    }

    displayPlaylists()

    async function displayPlaylists() {
        // Get todays date
        var todayDate = new Date()
        todayDate = convertDate(todayDate)

        //#### Create Top 30 playlist #####
        //#################################
        var top30 = "";
        var sql = "SELECT trackID FROM track ORDER BY count DESC, lastPlay DESC LIMIT 30";
        var rows = await dBase.all(sql);

        // Take trackIDs and place into top30 string variable
        if (rows.length != 0) {
            rows.forEach((row) => {
                top30 = top30 + row.trackID + ",";
            });

            // Remove last comma "," top30 string variable
            top30 = top30.substring(0, top30.length - 1);

            // Check if Top 30 playlist already exists. If it does update else insert
            var sql = "SELECT COUNT(*) AS count FROM playlists WHERE playlistName='Top 30'";
            var check = await dBase.get(sql);
            // If Top 30 exists then update
            if (check.count != 0) {
                // Update Top 30 Playlist
                var sql = "UPDATE playlists SET trackList='" + top30 + "', dateCreated='" + todayDate + "' WHERE playlistName='Top 30'";
                var update = await dBase.run(sql)
            }
            // If Top 30 does not exist then insert
            else {
                // Insert Top 30 Playlist
                var entry = `'${'Top 30'}','${top30}','${todayDate}'`
                var sql = "INSERT INTO playlists (playlistName, trackList, dateCreated) " + "VALUES (" + entry + ")";
                var insert = await dBase.run(sql)
            }
        }

        //#### Create All Favourites playlist #####
        //#################################
        var allFavourites = "";
        var sql = "SELECT trackID FROM track WHERE favourite='1'";
        var rows = await dBase.all(sql);

        // Take trackIDs and place into top30 string variable
        if (rows.length != 0) {
            rows.forEach((row) => {
                allFavourites = allFavourites + row.trackID + ",";
            });

            // Remove last comma "," allFavourites string variable
            allFavourites = allFavourites.substring(0, allFavourites.length - 1);

            // Check if Favourites - All playlist already exists. If it does update else insert
            var sql = "SELECT COUNT(*) AS count FROM playlists WHERE playlistName='Favourites'";
            var check = await dBase.get(sql);
            // If Favourites - All exists then update
            if (check.count != 0) {
                // Update Favourites - All Playlist
                var sql = "UPDATE playlists SET trackList='" + allFavourites + "', dateCreated='" + todayDate + "' WHERE playlistName='Favourites'";
                var update = await dBase.run(sql)
            }
            // If Favourites - All does not exist then insert
            else {
                // Insert Favourites - All Playlist
                var entry = `'${'Favourites'}','${allFavourites}','${todayDate}'`
                var sql = "INSERT INTO playlists (playlistName, trackList, dateCreated) " + "VALUES (" + entry + ")";
                var insert = await dBase.run(sql)
            }
        }

        //#### Create New playlist #####
        //##############################
        var newPlaylist = "";
        var sql = "SELECT track.trackID FROM track INNER JOIN album ON track.albumID=album.albumID ORDER BY album.dateAdd DESC LIMIT 50";
        var rows = await dBase.all(sql);

        // Take trackIDs and place into newPlaylist string variable
        if (rows.length != 0) {
            rows.forEach((row) => {
                newPlaylist = newPlaylist + row.trackID + ",";
            });

            // Remove last comma "," newPlaylist string variable
            newPlaylist = newPlaylist.substring(0, newPlaylist.length - 1);

            // Check if newPlaylist playlist already exists. If it does update else insert
            var sql = "SELECT COUNT(*) AS count FROM playlists WHERE playlistName='New!'";
            var check = await dBase.get(sql);
            // If newPlaylist exists then update
            if (check.count != 0) {
                // Update newPlaylist Playlist
                var sql = "UPDATE playlists SET trackList='" + newPlaylist + "', dateCreated='" + todayDate + "' WHERE playlistName='New!'";
                var update = await dBase.run(sql)
            }
            // If newPlaylist does not exist then insert
            else {
                // Insert newPlaylist Playlist
                var entry = `'${'New!'}','${newPlaylist}','${todayDate}'`
                var sql = "INSERT INTO playlists (playlistName, trackList, dateCreated) " + "VALUES (" + entry + ")";
                var insert = await dBase.run(sql)
            }
        }

        // Select all playlists from the database
        var sql = "SELECT * FROM playlists ORDER BY playlistName ASC";
        var rows = await dBase.all(sql);

        // Find total number of playlists
        // Call function in index.js to format number #,###
        var numberPlaylists = numberWithCommas(rows.length);
        $("#playlistTitle").text(numberPlaylists + " Playlists");

        rows.forEach((row) => {
            // Set variable
            var artworkSource;
            var ul = $('#ulPlaylists');
            var playlistLink = "./html/displayplaylist.html?playlist=" + row.playlistID;
            // Format date
            var created = formatDate(row.dateCreated);
            // Find number of tracks in trackList
            var tracks = row.trackList.split(",");
            var numberTracks = tracks.length;

            // If no tracks in playlist do not display
            if (tracks == "") {
                return false;
            }

            // Select artowrk for playlist
            var name = row.playlistName;
            if (name.includes("Favourites")) {
                artworkSource = "./graphics/favourite_large.png";
                if (global_ArtIconSize == "large") {
                    row.playlistName = "";
                }
            }
            else if (name == "Top 30") {
                artworkSource = "./graphics/top_30.png";
                if (global_ArtIconSize == "large") {
                    row.playlistName = "";
                }
            }
            else if (name == "Queued") {
                artworkSource = "./graphics/queued.png";
                if (global_ArtIconSize == "large") {
                    row.playlistName = "";
                }
            }
            else if (name == "Smart Playlist") {
                artworkSource = "./graphics/smart.png";
                if (global_ArtIconSize == "large") {
                    row.playlistName = "";
                }
            }
            else if (name == "New!") {
                artworkSource = "./graphics/new.png";
                if (global_ArtIconSize == "large") {
                    row.playlistName = "";
                }
            }
            else {
                artworkSource = "./graphics/playlist_background.png";
            }

            // Small art icons
            if (global_ArtIconSize == "small") {
                $(ul).attr('class', 'albumDisplay');
                var li = $('<li><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                li.find('img').attr('src', artworkSource);
                li.find('a').attr('href', playlistLink);
                li.find('span').append('<br><b>' + row.playlistName + '</b><br>' + numberTracks + ' Tracks<br>Created<br> ' + created);
                li.appendTo(ul);
            }

            // Large art icons
            else {
                $(ul).attr('class', 'albumDisplayLarge');
                var li = $('<li><a><img class="' + global_ArtIconShape + '"><span class="textAlbum" id="title"></span><div class="' + overlay + '"><div class="textAlbum" id="details"></div></div></a></li>');
                li.find('img').attr('src', artworkSource);
                li.find('a').attr('href', playlistLink);
                li.find('#title').append('<br><b>' + row.playlistName + '</b>');
                li.find('#details').append('<br>' + numberTracks + ' Tracks<br>Created<br> ' + created);
                li.appendTo(ul);
            }
        });
        // Shuffle tracks
        // Select all trackIDs from track table
        var sql = "SELECT trackID FROM track";
        var tracks = await dBase.all(sql);
        shuffleArray(tracks)
    }

    backgroundChange();
});