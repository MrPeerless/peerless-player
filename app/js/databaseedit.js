//######################
// EDIT DATABASE
//######################

var importType = "";

$(document).on('click', '#btnEditAlbum', function (event) {
    event.preventDefault();
    $("body").css("background", global_Background);
    $("#divTrackListing").css("display", "none");
    $("#divContent").css("width", "auto");
    $('#divContent').load("./html/editalbum.html");
    $("#btnSync").prop("disabled", true);
});

//#################
//### ARTWORK   ###
//#################
// Button click for Artwork button in edit album
$(document).on('click', '#btnArtworkAlbum', function (event) {
    event.preventDefault();
    // Check if online
    var connection = navigator.onLine;

    // If connected to internet
    if (connection) {
        // Set variables
        var artist = $("#inpArtistName").val();
        var album = $("#inpAlbumName").val();       
        $("#frontArtwork").html('<img width="15" height="15" src="./graphics/cross.png"/>');
        $("#backArtwork").html('<img width="15" height="15" src="./graphics/cross.png"/>');

        // Replace encoded &amp with &
        artist = artist.replace(/&amp;/g, '&');
        album = album.replace(/&amp;/g, '&');

        // Send IPC to search Spotify for album and artist
        var query = "album:" + album + " artist:" + artist
        ipcRenderer.send("spotify_search", [query, album, artist, "artwork"])
    }
    else {
        // If not connected display modal box warning
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/warning.png'></div><p>&nbsp<br><b>WARNING. No internet connection.</b><br>Please connect to the internet and try again.<br>&nbsp</p >");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        $('.background').css('filter', 'blur(5px)');
        return
    }
});

ipcRenderer.on("from_spotify_search_artwork", (event, data) => {
    var frontFound = false;
    var backFound = false;
    var spotifyResponse = data[0];
    var album = data[1];
    var artist = data[2];
    var albumType = "";
    var albumCheck = album.replace(/[.,;:?()'\-\[\]\/]/g, ' ')

    // Remove any multiple spaces
    albumCheck = albumCheck.replace(/  +/g, ' ')
    // Remove any spaces at start and end
    albumCheck = albumCheck.trim();
    albumCheck = albumCheck.trimEnd();
    albumCheck = albumCheck.toLowerCase();

    // Get value of import radio buttons
    importType = $("input[name='albumType']:checked").val();
    if (importType == "single") {
        albumType = "single"
    }
    else {
        albumType = "album"
    }
    
    $.each(spotifyResponse.albums.items, function (i, items) {
        var spotifyName = items.name.toLowerCase();

        // Remove punctuation from spotifyName and check for a match
        var spotifyNameCheck = spotifyName.replace(/[.,;:()'\-?\[\]\/]/g, ' ')
        // Remove any spaces at end
        spotifyNameCheck = spotifyNameCheck.trimEnd();

        if (spotifyNameCheck.startsWith(albumCheck)) {
            if (items.album_type == albumType || items.album_type == "compilation") {
                $("#inpEditCoverArtURL").val(items.images[0].url);
                $("#imgCoverArt").attr('src', items.images[0].url);
                var artist = $("#inpArtistName").val();
                var artFilePath = MUSIC_PATH + artist + "/" + album + "/tempArt.jpg"
                var coverArtUrl = $("#inpEditCoverArtURL").val();

                if (items.images[0].url) {
                    $("#frontArtwork").html('<img width="15" height="15" src="./graphics/tick.png"/>');
                    frontFound = true;
                    // Send message to main.js to save and tempArt image
                    ipcRenderer.send("save_temp_artwork", [artFilePath, coverArtUrl]);
                }
                return false;
            }
        }
    });

    var artistMBID = $("#inpArtistMBID").val();
    var artist = $("#inpArtistName").val();

    if (artistMBID != "") {
        // Call ajax function artistIDQuery
        releaseQueryArtist(artistMBID).done(dataReleaseProcess);

        // Function to send ajax xml query to Musicbrainz server
        function releaseQueryArtist(query) {
            var queryArtistID = query;
            var url;
            // Artist search url
            if (importType == "single") {
                url = musicbrainzUrl + "release-group?artist=" + queryArtistID + "&limit=100&type=single"
            }
            else {
                url = musicbrainzUrl + "release-group?artist=" + queryArtistID + "&limit=100&type=album|ep"
            }
            return $.ajax({
                url: url
            });
        }

        // Function to process data from received xml file searching for releaseQueryArtist
        function dataReleaseProcess(xml) {
            // Get number of releases from xml file
            var $releaseCount = $(xml).find('release-group-list');
            var count = $releaseCount.attr('count')
            var checkCount = parseInt(count)
            if (checkCount > 100) {
                count = "100";
            }

            // Check if any albums found
            if (count != "0") {
                var releaseFound = false;
                // Loop through each release-group and get data
                $(xml).find('release-group').each(function () {
                    var $release = $(this);
                    var title = $release.find('title').text().toLowerCase();
                    // Remove any punctuation to aid matching
                    title = title.replace(/[.,;:?()'\-\[\]\/]/g, ' ')
                    // Remove  non standard unicode charcters from MB xml result
                    // Remove unicode char u-2019 single comma quotation mark
                    title = title.replace(/\u2019/g, ' ')
                    // Remove unicode char u-2013 en dash
                    title = title.replace(/\u2013/g, ' ')
                    // Remove unicode char u-2010 hyphen
                    title = title.replace(/\u2010/g, ' ')
                    // Remove any multiple spaces
                    title = title.replace(/  +/g, ' ')
                    // Remove any spaces at start and end
                    title = title.trim();
                    title = title.trimEnd();

                    if (albumCheck.startsWith(title)) {
                        releaseFound = true;
                        releaseGroupID = $release.attr('id')

                        // Get cover artwork
                        // Call ajax function releaseIDQuery
                        releaseIDQuery(releaseGroupID).done(dataReleaseIDProcess);

                        // Function to send ajax xml query to Musicbrainz server
                        function releaseIDQuery(query) {
                            var queryreleaseGroupID = query;
                            // Artist search url
                            var url = musicbrainzUrl + "release?release-group=" + queryreleaseGroupID
                            return $.ajax({
                                url: url
                            });
                        }

                        // Function to process data from received xml file searching for releaseIDQuery
                        function dataReleaseIDProcess(xml) {
                            // Check if art url already found from spotify
                            var coverArtUrl = $("#inpEditCoverArtURL").val();
                            if (coverArtUrl) {
                                frontFound = true;
                            }

                            $(xml).find('release').each(function () {
                                var $release = $(this);
                                var releaseID = $release.attr('id');
                                var title = $release.find('title').text().toLowerCase();
                                // Remove any punctuation to aid matching
                                title = title.replace(/[.,;:?()'\-\[\]\/]/g, ' ')
                                // Remove  non standard unicode charcters from MB xml result
                                // Remove unicode char u-2019 single comma quotation mark
                                title = title.replace(/\u2019/g, ' ')
                                // Remove unicode char u-2013 en dash
                                title = title.replace(/\u2013/g, ' ')
                                // Remove unicode char u-2010 hyphen
                                title = title.replace(/\u2010/g, ' ')
                                // Remove any multiple spaces
                                title = title.replace(/  +/g, ' ')
                                // Remove any spaces at start and end
                                title = title.trim();
                                title = title.trimEnd();

                                var front = $release.find('front').text();
                                var back = $release.find('back').text();
                                if (albumCheck.startsWith(title)) {
                                    // Back cover art
                                    if (back == "true" && backFound == false) {
                                        backFound = true;
                                        var backArt = "https://coverartarchive.org/release/" + releaseID + "/back-500"
                                        $("#inpEditBackArtURL").val(backArt);
                                        $("#backArtwork").html('<img width="15" height="15" src="./graphics/tick.png"/>');
                                    }

                                    if (front == "true" && frontFound == false) {
                                        // Front cover art
                                        frontFound = true;
                                        var coverArt = "https://coverartarchive.org/release/" + releaseID + "/front-500"

                                        $("#imgCoverArt").attr('src', coverArt);
                                        $("#inpEditCoverArtURL").val(coverArt);
                                        coverArtUrl = $("#inpEditCoverArtURL").val();

                                        var artFilePath = MUSIC_PATH + artist + "/" + album + "/tempArt.jpg"
                                        $("#frontArtwork").html('<img width="15" height="15" src="./graphics/tick.png"/>');
                                        // Send message to main.js to save and tempArt image
                                        ipcRenderer.send("save_temp_artwork", [artFilePath, coverArtUrl]);
                                    }
                                }
                            });
                        }
                        return false;
                    }
                });
            }
        }
    }
});

//##################
//### METADATA   ###
//##################
// Button click for Get button in edit album to get metadata
$(document).on('click', '#btnGetMetadata', function (event) {
    event.preventDefault();
    // Check if online
    var connection = navigator.onLine;
    if (connection) {
        getMetadata();
    }
    else {
        // If not connected display modal box warning
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/warning.png'></div><p>&nbsp<br><b>WARNING. No internet connection.</b><br>Please connect to the internet and try again.<br>&nbsp</p >");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        $('.background').css('filter', 'blur(5px)');
        return
    }   
});

// Function to update metatdata from edit album
function getMetadata() {
    // Set variables
    var artist = $("#inpArtistName").val();
    var album = $("#inpAlbumName").val();
    // Remove any punctuation to aid matching
    var albumCheck = album.replace(/[.,;:?()'\-\[\]\/]/g, ' ')

    // Remove any multiple spaces
    albumCheck = albumCheck.replace(/  +/g, ' ')
    // Remove any spaces at start and end
    albumCheck = albumCheck.trim();
    albumCheck = albumCheck.trimEnd();
    albumCheck = albumCheck.toLowerCase();

    $("#albumData").html('<img width="15" height="15" src="./graphics/cross.png"/>');
    $("#mainGenre").html('<img width="15" height="15" src="./graphics/cross.png"/>');
    $("#genreTags").html('<img width="15" height="15" src="./graphics/cross.png"/>');
    $("#trackData").html('<img width="15" height="15" src="./graphics/cross.png"/>');

    // Get value of import radio buttons
    importType = $("input[name='albumType']:checked").val();
    artistMBID = $("#inpArtistMBID").val();

    // Check if at musicbrainz ID has been found
    if (artistMBID != "") {
        // Call ajax function artistIDQuery
        releaseQueryArtist(artistMBID).done(dataReleaseProcess);

        // Function to send ajax xml query to Musicbrainz server
        function releaseQueryArtist(query) {
            var queryArtistID = query;
            var url;
            // Artist search url
            if (importType == "single") {
                url = musicbrainzUrl + "release-group?artist=" + queryArtistID + "&limit=100&type=single"
            }
            else {
                url = musicbrainzUrl + "release-group?artist=" + queryArtistID + "&limit=100&type=album|ep"
            }
            return $.ajax({
                url: url
            });
        }

        // Function to process data from received xml file searching for releaseQueryArtist
        function dataReleaseProcess(xml) {
            // Get number of releases from xml file
            var $releaseCount = $(xml).find('release-group-list');
            var count = $releaseCount.attr('count')
            var checkCount = parseInt(count)
            if (checkCount > 100) {
                count = "100";
            }

            // Check if any albums found
            if (count != "0") {
                // Loop through each release-group and get data
                $(xml).find('release-group').each(function () {
                    var $release = $(this);
                    var title = $release.find('title').text().toLowerCase();
                    // Remove any punctuation etc to aid matching
                    title = title.replace(/[.,;:?()'\-\[\]\/]/g, ' ')
                    // Remove  non standard unicode charcters from MB xml result
                    // Remove unicode char u-2019 single comma quotation mark
                    title = title.replace(/\u2019/g, ' ')
                    // Remove unicode char u-2013 en dash
                    title = title.replace(/\u2013/g, ' ')
                    // Remove unicode char u-2010 hyphen
                    title = title.replace(/\u2010/g, ' ')
                    // Remove any multiple spaces
                    title = title.replace(/  +/g, ' ')
                    // Remove any spaces at start and end
                    title = title.trim();
                    title = title.trimEnd();
                    var date = $release.find('first-release-date').text();
                    
                    if (albumCheck.startsWith(title)) {
                        releaseGroupID = $release.attr('id')
                        var albumDate = date.substring(0, 4);
                        $("#inpReleaseDate").val(albumDate);
                        
                        // Call ajax function originQueryArtist
                        originQueryArtist(artistMBID).done(dataOriginProcess);

                        // Function to send ajax xml query to Musicbrainz server
                        function originQueryArtist(query) {
                            var queryArtistID = query;
                            // Artist search url
                            var url = musicbrainzUrl + "artist/" + queryArtistID
                            return $.ajax({
                                url: url
                            });
                        }

                        // Function to process data from received xml file searching for originQueryArtist
                        function dataOriginProcess(xml) {
                            var $area = $(xml).find('area');
                            var origin = $area.find('name').text();

                            // Check if artist is Various Artists and if it is don't add artist origin
                            if (artist == "Various Artists") {
                                $("#inpArtistOrigin").val("");
                            }
                            else {
                                $("#inpArtistOrigin").val(origin);
                            }
                            $("#albumData").html('<img width="15" height="15" src="./graphics/tick.png"/>');
                        }

                        // Call ajax function releaseQueryGenre
                        releaseQueryGenre(releaseGroupID).done(dataGenreProcess);

                        // Function to send ajax xml query to Musicbrainz server
                        function releaseQueryGenre(query) {
                            var queryreleaseGroupID = query;
                            // Artist serach url
                            var url = musicbrainzUrl + "release-group/" + queryreleaseGroupID + "?inc=genres"
                            return $.ajax({
                                url: url
                            });
                        }

                        // Function to process data from received xml file searching for releaseQueryGenre 
                        function dataGenreProcess(xml) {
                            var tags = "";
                            // Get name of each genre in genre-list
                            $(xml).find('genre').each(function () {
                                var $genreList = $(this);
                                var genreName = $genreList.find('name').text();
                                tags += ", " + genreName
                            });
                            // Remove leading comma from string
                            var genreTags = tags.substring(1);
                            // Display list of genres found
                            if (genreTags) {
                                $("#genreTags").html('<img width="15" height="15" src="./graphics/tick.png"/>');
                                $("#genreTags").append(genreTags)
                            }
                        }
                        return false;
                    }
                });
            }
        }
    }

    // Send file path of track 1 to read ID3 tags
    var track1 = $("#1fileName").val();
    var audioSource = MUSIC_PATH + artist + "/" + album + "/" + track1;
    ipcRenderer.send("read_ID3tags", [audioSource])

    // Send IPC to search Spotify for album and artist
    var query = 'album:' + album + ' artist:' + artist + '&type=album';
    ipcRenderer.send("spotify_search", [query, album, artist, "edit"])
}

// Receive IPC search response Spotify for album and artist
ipcRenderer.on("from_spotify_search_edit", (event, data) => {
    var spotifyResponse = data[0];
    var album = data[1];
    var artist = data[2];
    var albumType = "";
    var albumSpotID = "";

    // Get value of import radio buttons
    importType = $("input[name='albumType']:checked").val();
    if (importType == "single") {
        albumType = "single"
    }
    else {
        albumType = "album"
    }

    //console.log(JSON.stringify(data, null, 4));

    // Find Spotify album ID to use to search for tracks
    $.each(spotifyResponse.albums.items, function (i, items) {
        var spotifyName = items.name.toLowerCase();
        // Remove following punctuation from spotifyName and album to check for a match
        var spotifyNameCheck = spotifyName.replace(/[.,;:?()'\-\[\]\/]/g, ' ')
        // Remove any multiple spaces
        spotifyNameCheck = spotifyNameCheck.replace(/  +/g, ' ')
        // Remove any spaces at start and end
        spotifyNameCheck = spotifyNameCheck.trim();
        spotifyNameCheck = spotifyNameCheck.trimEnd();

        var albumCheck = album.replace(/[.,;:?()'\-\[\]\/]/g, ' ')
        // Remove any multiple spaces
        albumCheck = albumCheck.replace(/  +/g, ' ')
        // Remove any spaces at start and end
        albumCheck = albumCheck.trim();
        albumCheck = albumCheck.trimEnd();
        albumCheck = albumCheck.toLowerCase();

        if (spotifyNameCheck.startsWith(albumCheck)) {
            if (items.album_type == albumType || items.album_type == "compilation") {
                albumSpotID = items.id;
                return false;
            }
        }
    });

    // Send IPC to get albums tracks from Spotify
    if (albumSpotID != "") {
        var query = albumSpotID + '/tracks';
        ipcRenderer.send("spotify_getTracks", [query])
    }
    // The rest of the metadata received from Spotify is updated in the databaseadd.js file reusing the import code.
});


//############################
//## Save Album to Database ##
//############################
// Update button on edit album in database
$(document).on('click', '#btnSaveAlbum', function (event) {
    event.preventDefault();
    // Add form validations. This validates the required attr in the html form
    $("#frmEdit").validate({});
    if ($("#frmEdit").valid()) {
        updateTables();

        async function updateTables() {
            var artist = $("#inpArtistName").val();
            var album = $("#inpAlbumName").val();
            // Replace encoded &amp with &
            album = album.replace(/&amp;/g, '&');
            artist = artist.replace(/&amp;/g, '&');
            // Remove any spaces at end of name as not valid windows directory name
            album = album.trimEnd();
            artist = artist.trimEnd();

            var artistOrigin = $("#inpArtistOrigin").val();
            var originalAlbumName = $("#inpOriginalAlbumName").val();
            var originalArtistName = $("#inpOriginalArtistName").val();
            // Replace encoded &amp with &
            originalAlbumName = originalAlbumName.replace(/&amp;/g, '&');
            originalArtistName = originalArtistName.replace(/&amp;/g, '&');

            var releaseDate = $("#inpReleaseDate").val();
            var genre = $('[name=sltGenre1]').val();
            var noTracks = $("#inpCount").val();
            var coverArtUrl = $("#inpEditCoverArtURL").val();

            // Rename directories if changed on input
            ipcRenderer.send("rename_directory", [MUSIC_PATH, originalArtistName, originalAlbumName, artist, album, "edit"]);

            try {
                // ARTIST TABLE
                // Check if artist name has changed
                if (artist != originalArtistName) {
                    // If artist name changed check if new name is in artist table
                    var sql = "SELECT artistID FROM artist WHERE artistName=?";
                    var response = await dBase.get(sql, artist);
                    // If artist name is not in database add to artist table
                    if (response == null) {
                        var entry = `"${artist}","${artistOrigin}"`;
                        var sql = "INSERT INTO artist (artistName, origin) " + "VALUES (" + entry + ")";
                        var insert = await dBase.run(sql);
                    }
                }
                else {
                    // Artist name has not changed
                    // Update artist orgin
                    var sql = 'UPDATE artist SET origin="' + artistOrigin + '" WHERE artistID=' + global_ArtistID;
                    var update = await dBase.run(sql);
                }
                // Get artistID from artist table
                var sql = "SELECT artistID FROM artist WHERE artistName=?";
                var response = await dBase.get(sql, artist);
                var artistID = response.artistID;
                // Update global_ArtistID
                global_ArtistID = artistID;

                // GENRE TABLE
                // Get genreID from genre table and add genre if not present
                var sql = "SELECT genreID FROM genre WHERE genreName=?";
                var response = await dBase.get(sql, genre);
                // If genre is not in database add to genre table
                if (response == null && genre != "") {
                    var entry = `"${genre}"`;
                    var sql = "INSERT INTO genre (genreName) " + "VALUES (" + entry + ")";
                    var insert = await dBase.run(sql);
                }
                // Get genreID from genre table
                var sql = "SELECT genreID FROM genre WHERE genreName=?";
                var response = await dBase.get(sql, genre);
                var genreID = response.genreID;

                // ALBUM TABLE
                var sql = 'UPDATE album SET genreID=' + genreID + ', artistID=' + artistID + ', albumName="' + album + '", releaseDate=' + releaseDate + ' WHERE albumID=' + global_AlbumID;
                var update = await dBase.run(sql);

                // TRACK TABLE
                // Set counters
                var counter1 = 1;
                noTracks = parseInt(noTracks);
                // Loop through each track and add to track table
                for (var i = 0; i < (noTracks); i++) {
                    var trackID = $("#" + counter1 + "trackID").val();
                    var trackName = $("#" + counter1 + "trackName").val();
                    var fileName = $("#" + counter1 + "fileName").val();
                    var mood1 = $("#" + counter1 + "mood1").val();
                    var mood2 = $("#" + counter1 + "mood2").val();
                    var tempo1 = $("#" + counter1 + "tempo1").val();
                    var tempo2 = $("#" + counter1 + "tempo2").val();
                    var genre2 = $("#" + counter1 + "genre2").val();
                    var genre3 = $("#" + counter1 + "genre3").val();

                    var sql = 'UPDATE track SET artistID=' + artistID + ', genreID=' + genreID + ', trackName="' + trackName + '", fileName="' + fileName + '", mood1="' + mood1 + '", mood2="' + mood2 + '", tempo1="' + tempo1 + '", tempo2="' + tempo2 + '", genre2="' + genre2 + '", genre3="' + genre3 + '" WHERE trackID=' + trackID;
                    var update = await dBase.run(sql);
                   counter1 += 1;
                }

                // COVER ART
                // Check first 4 chars of coverArtUrl to see if it is a URL or filepath
                var check = coverArtUrl.substring(0, 4);
                // CoverArtUrl is a URL
                if (coverArtUrl != "" && check == "http") {
                    var tempArtPath = MUSIC_PATH + artist + "/" + album + "/tempArt.jpg";
                    var artFilePath = MUSIC_PATH + artist + "/" + album + "/AlbumArtXLarge.jpg";
                    var resizedFilePath = MUSIC_PATH + artist + "/" + album + "/folder.jpg";
                    // Send message to main.js to save AlbumArtXLarge image
                    ipcRenderer.send("save_artXlarge_file", [tempArtPath, artFilePath]);
                    // Send message to main.js to resize folder image
                    ipcRenderer.send("save_folder_file", [tempArtPath, resizedFilePath]);
                }

                // CoverArtUrl is a filepath
                if (coverArtUrl != "" && check != "http") {
                    var artFilePath = MUSIC_PATH + artist + "/" + album + "/AlbumArtXLarge.jpg";
                    var resizedFilePath = MUSIC_PATH + artist + "/" + album + "/folder.jpg";
                    // Send message to main.js to save AlbumArtXLarge image
                    ipcRenderer.send("save_artXlarge_file", [coverArtUrl, artFilePath]);
                    // Send message to main.js to resize folder image
                    ipcRenderer.send("save_folder_file", [coverArtUrl, resizedFilePath]);
                }

                // Back cover art
                var backCoverArt = $('#inpEditBackArtURL').val();
                if (backCoverArt) {
                    var artFilePath = MUSIC_PATH + artist + "/" + album + "/backCover.jpg";
                    // Send message to main.js to save back Cover image
                    ipcRenderer.send("save_backCover_art", [artFilePath, backCoverArt]);
                }

                // Show OK modal box to confirm album updated in database
                $('#okModal').css('display', 'block');
                $('.modalHeader').empty();
                $('#okModalText').empty();
                $(".modalFooter").empty();
                $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
                $('#okModalText').append("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br>Album has been successfully updated in " + global_AppName + ".<br>&nbsp<br>&nbsp</p >");
                var buttons = $("<button class='btnContent' id='btnOkEdit'>OK</button>");
                $('.modalFooter').append(buttons);
                $("#btnOkEdit").focus();
                $('.background').css('filter', 'blur(5px)');
                // Enable btnSync
                $("#btnSync").prop("disabled", false);
            }
            catch (err) {
                console.log(err)
                // Show ERROR modal to display
                $('#okModal').css('display', 'block');
                $('.modalHeader').empty();
                $('#okModalText').empty();
                $(".modalFooter").empty();
                $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
                $('#okModalText').append("<div class='modalIcon'><img src='./graphics/warning.png'></div><p>&nbsp<br><b>DATABASE ERROR</b> - album could not be updated in " + global_AppName + ".<br>&nbsp<br>&nbsp</p >");
                var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
                $('.modalFooter').append(buttons);
                $("#btnOkModal").focus();
                $('.background').css('filter', 'blur(5px)');
                // Enable btnSync
                $("#btnSync").prop("disabled", false);
            }
        }
    }
    else {
        console.log("Form not validated")
    }
});

// Message received once function in main.js completed
ipcRenderer.on("renamed_artist_directory", (event, data) => {
    deleteDirectory(data[0]);
    async function deleteDirectory(data) {
        var originalArtistName = data;
        // Check to see if original artist directory is now empty and if so delete directory
        var sql = "SELECT n.artistID, COALESCE(t.albumCount, 0) AS albumCount, n.artistName FROM artist n LEFT JOIN(SELECT artistID, COUNT(*) AS albumCount FROM album GROUP BY artistID) t ON n.artistID = t.artistID WHERE n.artistName=?";
        var row = await dBase.get(sql, originalArtistName);
        // If there was only 1 album for artist delete artist from database
        if (!row.albumCount) {
            var sql = "DELETE FROM artist WHERE artistID=" + row.artistID;
            var del = await dBase.run(sql);
        }
    }
});

// Manual add artwork
// Click event from clicking on artwork in edit album
$(document).on('click', '#editAlbum', function (event) {
    event.preventDefault();
    // Send message to main.js to open dialog box
    ipcRenderer.send("open_file_dialog", ["edit_artwork", "Select Album Artwork Image File", "C:\\", "Select File", [{ name: 'Images', extensions: ['jpg'] }], "openFile"]);
});

// Response from selecting manual artwork browse dialog box
ipcRenderer.on("edit_artwork", (event, data) => {
    var coverArt = data[0];
    $("#imgCoverArt").attr('src', coverArt);
    $("#inpEditCoverArtURL").val(coverArt);
});


//###########################
// DELETE ALBUM FROM DATABASE
//###########################
// Button click event from edit database page to delete album from database
$(document).on('click', '#btnDeleteAlbum', function (event) {
    event.preventDefault();
    // Show question modal box to confirm deletion
    $('#okModal').css('display', 'block');
    $('.modalHeader').empty();
    $('#okModalText').empty();
    $(".modalFooter").empty();
    $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
    $('#okModalText').append("<div class='modalIcon'><img src='./graphics/question.png'></div><p>&nbsp<br>Are you sure you want to delete this album from " + global_AppName + "?<br>&nbsp</p >");
    var buttons = $("<button class='btnContent' id='btnDeleteOkAlbum'>Yes</button> <button class='btnContent' id='btnCancelModal'>No</button>");
    $('.modalFooter').append(buttons);
});

$(document).on('click', '#btnDeleteOkAlbum', async function (event) {
    event.preventDefault();
    $('#okModal').css('display', 'none');
    try {
        // Check number of albums for artist
        var sql = "SELECT COUNT(*) AS COUNT FROM album WHERE artistID=?";
        var row = await dBase.get(sql, global_ArtistID);
        var numberAlbums = row.COUNT;

        // Delete tracks from track table for album
        var sql = "DELETE FROM track WHERE albumID=" + global_AlbumID;
        var del = await dBase.run(sql);

        // Delete album from album table
        var sql = "DELETE FROM album WHERE albumID=" + global_AlbumID;
        var del = await dBase.run(sql, global_AlbumID);

        // If only 1 album for artist delete artist from database
        if (numberAlbums == 1) {
            var sql = "DELETE FROM artist WHERE artistID=" + global_ArtistID;
            var del = await dBase.run(sql);
        }
        // Show OK modal box to confirm album deleted from database
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br>Album has been successfully deleted from " + global_AppName + ".<br>&nbsp<br>&nbsp</p >");
        var buttons = $("<button class='btnContent' id='btnOkImport'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkImport").focus();
        $('.background').css('filter', 'blur(5px)');
        // Enable btnSync
        $("#btnSync").prop("disabled", false);
        // Update library stats in playing div
        libraryStats()
    }
    catch (err) {
        console.log(err)
        // Show ERROR modal to display
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/warning.png'></div><p>&nbsp<br><b>DATABASE ERROR</b> - album could not be deleted from " + global_AppName + ".<br>&nbsp<br>&nbsp</p >");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        $('.background').css('filter', 'blur(5px)');
    }
});

//#########################
//### GENRE 2 SELECTION ###
//#########################
// Change Genre2 selection box when Genre changed
$(document).on('change', '#sltGenre1', function () {
    // Get value selected
    var noTracks = $("#inpCount").val();
    var genreName = $(this).val();

    if (genreName != "") {
        $('#inpGenre2Edit').val("");
        $('#listGenre2Edit').empty();
        $('#inpGenre3Edit').val("");
        $('#listGenre3Edit').empty();

        populateGenre2(genreName)
    }
    else {
        $('#inpGenre2Edit').val("");
        $('#listGenre2Edit').empty();
        $('#inpGenre3Edit').val("");
        $('#listGenre3Edit').empty();
        // Clear each track genre2 and genre3
        var counter = 1;
        for (var i = 0; i < noTracks; i++) {
            // Genre2
            $("#" + counter + "genre2").val('');
            // Genre3
            $("#" + counter + "genre3").val('');
            counter += 1;
        }
    }
});

//#########################
//### GENRE 3 SELECTION ###
//#########################
// Change Genre3 selection box when Genre2 changed
$(document).on('change', '#inpGenre2Edit', function () {
    var noTracks = $("#inpCount").val();
    // Change each track genre2 when changed
    var counter = 1;
    var genre2 = $('#inpGenre2Edit').val();
    for (var i = 0; i < noTracks; i++) {
        // Genre2
        $("#" + counter + "genre2").val(genre2);
        counter += 1;
    }

    if (genre2 != "") {
        $('#inpGenre3Edit').val("");
        $('#listGenre3Edit').empty();
        populateGenre3(genre2)
    }
    else {
        $('#inpGenre3Edit').val("");
        $('#listGenre3Edit').empty();
        $('#listGenre2Edit').empty();
        // Clear each track genre3
        var counter = 1;
        for (var i = 0; i < noTracks; i++) {
            // Genre3
            $("#" + counter + "genre3").val('');
            counter += 1;
        }
        var genreName = $("#sltGenre1").val();
        populateGenre2(genreName)
    }
});


$(document).on('change', '#inpGenre3Edit', function () {
    var noTracks = $("#inpCount").val();
    // Change each track genre3 when changed
    var counter = 1;
    var genre3 = $('#inpGenre3Edit').val();
    if (genre3 != "") {
        for (var i = 0; i < noTracks; i++) {
            // Genre3
            $("#" + counter + "genre3").val(genre3);
            counter += 1;
        }
    }
    else {
        var genre2 = $('#inpGenre2Edit').val();
        $('#inpGenre3Edit').val("");
        // Clear each track genre2 and genre3
        var counter = 1;
        for (var i = 0; i < noTracks; i++) {
            // Genre3
            $("#" + counter + "genre3").val('');
            counter += 1;
        }
        populateGenre3(genre2)
    }
});

// Populate list values of genre2 based on main genre
async function populateGenre2(genreName) {
    // Array of database values for genre2
    var dbGenre2 = [];
    // Get genreID for main genre selected
    var sql = "SELECT genreID FROM genre WHERE genreName=?";
    var row = await dBase.get(sql, genreName);

    // Select all current genre2 from database
    try {
        var sql = "SELECT DISTINCT genre2 FROM track WHERE genreID=? ORDER BY genre2 ASC";
        var rows = await dBase.all(sql, row.genreID);
        // And put into array 
        rows.forEach((row) => {
            dbGenre2.push(row.genre2);
        });
    }
    catch{
        dbGenre2 = [];
    }

    // Empty contents of genre2 selection element
    // Populate genre2 selection element based on value in genre selection element
    switch (genreName) {
        case "Alternative & Punk":
            var fixedGenre2 = ['Alternative', 'Alternative Folk', 'Brit Rock', 'Garage Rock Revival', 'New Wave Pop', 'Punk'];
            // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
            var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
            // Populate inpubox list
            for (const item of genre2) {
                $('#listGenre2Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Blues":
            var fixedGenre2 = ['Acoustic Blues', 'Blues Rock', 'Electric Blues', 'General Blues'];
            // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
            var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
            // Populate inpubox list
            for (const item of genre2) {
                $('#listGenre2Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Classical":
            var fixedGenre2 = ['Baroque', 'Chamber Music', 'Classical Guitar', 'Contemporary', 'General Classical', 'Opera'];
            // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
            var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
            // Populate inpubox list
            for (const item of genre2) {
                $('#listGenre2Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Comedy":
            var fixedGenre2 = ['Comedy'];
            // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
            var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
            // Populate inpubox list
            for (const item of genre2) {
                $('#listGenre2Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Country":
            var fixedGenre2 = ['Classic Country', 'General Country', 'Traditional Country'];
            // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
            var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
            // Populate inpubox list
            for (const item of genre2) {
                $('#listGenre2Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Dance":
            var fixedGenre2 = ['Dance & Club', 'General Dance'];
            // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
            var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
            // Populate inpubox list
            for (const item of genre2) {
                $('#listGenre2Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Electronica":
            var fixedGenre2 = ['Disco', 'Downtempo, Lounge & Ambient', 'Electronic', 'Electronica Fusion', 'Electronica Mainstream', 'House', 'Techno', 'Trance'];
            // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
            var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
            // Populate inpubox list
            for (const item of genre2) {
                $('#listGenre2Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Folk":
            var fixedGenre2 = ['Alternative Folk', 'Celtic', 'Contemporary Folk', 'Folk Rock'];
            // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
            var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
            // Populate inpubox list
            for (const item of genre2) {
                $('#listGenre2Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Hip-Hop/Rap":
            var fixedGenre2 = ['General Hip Hop', 'General Rap', 'Old School Hip Hop'];
            // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
            var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
            // Populate inpubox list
            for (const item of genre2) {
                $('#listGenre2Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Holiday":
            var fixedGenre2 = ['Christmas'];
            // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
            var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
            // Populate inpubox list
            for (const item of genre2) {
                $('#listGenre2Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Indie":
            var fixedGenre2 = ['Indie Rock', 'Indie Pop'];
            // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
            var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
            // Populate inpubox list
            for (const item of genre2) {
                $('#listGenre2Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Jazz":
            var fixedGenre2 = ['Bebop & Modern Jazz', 'Big Band & Swing', 'Contemporary Jazz & Fusion', 'Early Jazz'];
            // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
            var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
            // Populate inpubox list
            for (const item of genre2) {
                $('#listGenre2Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Metal":
            var fixedGenre2 = ['General Metal', 'Hardcore Metal'];
            // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
            var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
            // Populate inpubox list
            for (const item of genre2) {
                $('#listGenre2Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Pop":
            var fixedGenre2 = ['Classic Pop Vocals', 'European Pop', 'Latin Pop', 'Western Pop'];
            // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
            var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
            // Populate inpubox list
            for (const item of genre2) {
                $('#listGenre2Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Reggae":
            var fixedGenre2 = ['General Reggae', 'Ska/Rock Steady'];
            // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
            var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
            // Populate inpubox list
            for (const item of genre2) {
                $('#listGenre2Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Rock":
            var fixedGenre2 = ["Alternative", "Alternative Roots", "Classic Rock", "Hard Rock", "Mainstream Rock", "Psychedelic Rock", "Rock & Roll", "Soft Rock"];
            // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
            var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
            // Populate inpubox list
            for (const item of genre2) {
                $('#listGenre2Edit').append($("<option>").attr('value', item));
            }
        case "Soul":
            var fixedGenre2 = ['Classic R&B/Soul', 'General R&B/Soul'];
            // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
            var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
            // Populate inpubox list
            for (const item of genre2) {
                $('#listGenre2Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Soundtrack":
            var fixedGenre2 = ['Original Film/TV Music'];
            // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
            var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
            // Populate inpubox list
            for (const item of genre2) {
                $('#listGenre2Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Traditional":
            var fixedGenre2 = ['Easy Listening', 'European Traditional', 'Religious'];
            // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
            var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
            // Populate inpubox list
            for (const item of genre2) {
                $('#listGenre2Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Urban":
            var fixedGenre2 = ['Contemporary Jazz & Fusion', 'Contemporary R&B/Soul', 'Western Hip-Hop/Rap'];
            // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
            var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
            // Populate inpubox list
            for (const item of genre2) {
                $('#listGenre2Edit').append($("<option>").attr('value', item));
            }
            break;
        case "World":
            var fixedGenre2 = ['African Traditional', 'European Traditional', 'Latin Traditional', 'New Age', 'Other Traditions'];
            // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
            var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
            // Populate inpubox list
            for (const item of genre2) {
                $('#listGenre2Edit').append($("<option>").attr('value', item));
            }
            break;
    }
}

// Populate list values of genre3 based on main genre
async function populateGenre3(genre2) {
    // Array of database values for genre2
    var dbGenre3 = [];
    // Select all current genre3 from database
    try {
        var sql = "SELECT DISTINCT genre3 FROM track WHERE genre2=? ORDER BY genre3 ASC";
        var rows = await dBase.all(sql, genre2);
        // And put into array 
        rows.forEach((row) => {
            dbGenre3.push(row.genre3);
        });
    }
    catch{
        dbGenre3 = [];
    }

    // Populate genre3 selection element based on value in genre2 selection element
    switch (genre2) {
        case "Alternative":
            var fixedGenre3 = ['Adult Alternative Rock', 'Alternative Dance', 'Alternative Pop', 'Alternative Rock', 'Alternative Singer-Songwriter', 'Grunge', 'Rockabilly Revival'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Alternative Folk":
            var fixedGenre3 = ['Contemporary U.S. Folk'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Brit Rock":
            var fixedGenre3 = ['Brit Pop'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Garage Rock Revival":
            var fixedGenre3 = ['Lo-Fi/Garage'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "New Wave Pop":
            var fixedGenre3 = ['Synth Pop'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Punk":
            var fixedGenre3 = ['General Punk', 'Hardcore Punk', 'Old School Punk', 'Pop Punk', 'Post - Punk', 'Straight Edge Punk'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Acoustic Blues":
            var fixedGenre3 = ['General Acoustic Blues', 'Harmonica Blues'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Blues Rock":
            var fixedGenre3 = ['British Blues Rock', 'Chicago Blues', 'Texas Blues'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Electric Blues":
            var fixedGenre3 = ['Chicago Blues', 'General Electric Blues', 'Texas Blues'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "General Blues":
            var fixedGenre3 = ['Contemporary Blues', 'Country Blues'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Christmas":
            var fixedGenre3 = [];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Baroque":
            var fixedGenre3 = [];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Chamber Music":
            var fixedGenre3 = [];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Classical Guitar":
            var fixedGenre3 = [];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Contemporary":
            var fixedGenre3 = ['Piano', 'Strings'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "General Classical":
            var fixedGenre3 = ['Piano', 'Strings'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Opera":
            var fixedGenre3 = ['Romantic Era', 'Reniassance Era'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Comedy":
            var fixedGenre3 = [];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Classic Country":
            var fixedGenre3 = ['Bluegrass', 'Outlaw Country', 'Rockabiliy'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "General Country":
            var fixedGenre3 = ['Alternative Country', 'Americana', 'Contemporary Country', 'Country Pop', 'Country Rock'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Traditional Country":
            var fixedGenre3 = ['Americana', 'Bluegrass', 'Country Blues'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Dance & Club":
            var fixedGenre3 = ['Acid House', 'Big Beat', 'Club Dance', 'Hi-NRG', "Jungle/Drum 'n' Bass"];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "General Dance":
            var fixedGenre3 = ['Disco', 'Rave Music'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Disco":
            var fixedGenre3 = [];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Downtempo, Lounge & Ambient":
            var fixedGenre3 = ['Ambient Electronica', 'General Downtempo', 'Neo-Lounge', 'Trip Hop'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Electronic":
            var fixedGenre3 = ['General Electronic', 'Minimalist Experimental'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Electronica Fusion":
            var fixedGenre3 = ['Ethno-Lounge Electronica'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Electronica Mainstream":
            var fixedGenre3 = ['Ambient Electronica', 'Big Beat', 'Pop Electronica'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "House":
            var fixedGenre3 = ['Deep House', 'Euro House', 'General House', 'Happy House', 'Progressive House', 'Tech House', 'U.K. Garage'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Techno":
            var fixedGenre3 = ['Classic Techno', 'Dark Techno/Darkwave', 'General Techno', 'Hardcore Techno', 'Minimalist Techno'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Trance":
            var fixedGenre3 = ['Ambient Trance', 'General Trance', 'Hard Trance/Acid', 'Progressive/Dream', 'Tech Trance'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Alternative Folk":
            var fixedGenre3 = ['Contemporary U.S. Folk'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Celtic":
            var fixedGenre3 = [];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Contemporary Folk":
            var fixedGenre3 = ['Folk Pop'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Folk Rock":
            var fixedGenre3 = ['English Folk Rock', 'Classic Folk Rock'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "General Hip Hop":
            var fixedGenre3 = [];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "General Rap":
            var fixedGenre3 = ['Freestyle Rap', 'Hardcore Rap', 'Underground Rap'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Old School Hip Hop":
            var fixedGenre3 = [];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Indie Rock":
            var fixedGenre3 = ['Art Rock', 'Experimental Rock', 'General Indie Rock', 'Madchester', 'Neo-Glam', 'Original Post-Punk', 'Post-Modern Art Music', 'Post-Punk Revival'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Indie Pop":
            var fixedGenre3 = ['Dream Pop', 'Post-Modern Electronic Pop', 'Twee Pop'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Bebop & Modern Jazz":
            var fixedGenre3 = ['Avant Garde', 'Bebop', 'Modern Jazz', 'Post-Bop'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Big Band & Swing":
            var fixedGenre3 = ['Big Band', 'Jump Blues', 'Swing Revival'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Contemporary Jazz & Fusion":
            var fixedGenre3 = ['Cool/West Coast Jazz', 'Fusion', 'Jazz Funk', 'Soul Jazz'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Early Jazz":
            var fixedGenre3 = ['New Orleans Jazz', 'Ragtime'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "General Metal":
            var fixedGenre3 = ['Alternative Metal', 'Gothic Metal', 'Heavy Metal', 'Pop/Hair Metal', 'Progressive Metal'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Hardcore Metal":
            var fixedGenre3 = ['Black/Death Metal', 'Rap Metal', 'Thrash/Speed Metal'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Classic Pop Vocals":
            var fixedGenre3 = ['Classic Female Vocal Pop', 'Classic Male Vocal Pop'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "European Pop":
            var fixedGenre3 = ['Euro Disco', 'Euro Pop', 'Eurobeat', 'French Pop'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Latin Pop":
            var fixedGenre3 = ['General Latin Pop'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Western Pop":
            var fixedGenre3 = ['Acoustic Pop', 'Adult Alternative Pop', 'Adult Contemporary', 'Dance Pop', 'Dream Pop', 'Folk Pop', 'Pop Punk', 'Pop Vocal', 'Power Pop', 'R&B', 'Singer-Songwriter', 'Teen Girl Group', 'Teen Pop', 'Twee Pop'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "General Reggae":
            var fixedGenre3 = [];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Ska/Rock Steady":
            var fixedGenre3 = ['Dancehall', 'Dub', 'Ragga'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Alternative":
            var fixedGenre3 = ['Adult Alternative Rock', 'Alternative Rock', 'Alternative Singer-Songwriter', 'Grunge', 'Rockabilly Revival'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Alternative Roots":
            var fixedGenre3 = ['Alt Country', 'Roots Rock', 'Southern Rock'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Classic Rock":
            var fixedGenre3 = ['Blues Rock', 'Boogie Rock', 'Classic Hard Rock', 'Classic Prog', 'Classic Rock'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Hard Rock":
            var fixedGenre3 = ['General Hard Rock', 'Glam'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Mainstream Rock":
            var fixedGenre3 = ['General Mainstream Rock'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Psychedelic Rock":
            var fixedGenre3 = ['Acid Rock'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Rock & Roll":
            var fixedGenre3 = ['Rockabilly'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Soft Rock":
            var fixedGenre3 = ['Instrumental Rock'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Classic R&B/Soul":
            var fixedGenre3 = ['Motown'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "General R&B/Soul":
            var fixedGenre3 = ['Funk', 'Urban Crossover'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Original Film/TV Music":
            var fixedGenre3 = [];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Easy Listening":
            var fixedGenre3 = [];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "European Traditional":
            var fixedGenre3 = [];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Religious":
            var fixedGenre3 = ['Choral', 'Christian', 'Gospel'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Contemporary R&B/Soul":
            var fixedGenre3 = ['Contemporary R&B', 'Neo-Soul', 'Urban AC', 'Urban Crossover'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Western Hip-Hop/Rap":
            var fixedGenre3 = ['European Hip-Hop/Rap', 'European Hip-Hop/Rap'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "African Traditional":
            var fixedGenre3 = ['African', 'West African'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "European Traditional":
            var fixedGenre3 = ['British Isles', 'General Celtic', 'Klezmer & European Jewish'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Latin Traditional":
            var fixedGenre3 = ['Cuban'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "New Age":
            var fixedGenre3 = ['New Age World Music', 'World Fusion'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
        case "Other Traditions":
            var fixedGenre3 = ['Central Asian', 'Eastern European', 'General World', ' Middle East/Arabic', 'Native American', 'Zydeco/Cajun'];
            // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
            var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
            // Populate inputbox list
            for (const item of genre3) {
                $('#listGenre3Edit').append($("<option>").attr('value', item));
            }
            break;
    }
}


