//######################
// EDIT DATABASE
//######################

$(document).on('click', '#btnEditAlbum', function (event) {
    event.preventDefault();
    $("body").css("background", global_Background);
    $("#divTrackListing").css("display", "none");
    $("#divContent").css("width", "auto");
    $('#divContent').load("./html/editalbum.html");
    $("#btnSync").prop("disabled", true);
});

// Function to popualte the gracenote matches table in edit album
function editAlbumMatches(artist, album) {

    // Check if online
    var connection = navigator.onLine;

    if (!connection) {
        // If not connected display modal nox warning
        $('#okModal').css('display', 'block');
        $(".modalFooter").empty();
        $('.modalHeader').html('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').html("<div class='modalIcon'><img src='./graphics/warning.png'></div><p>&nbsp<br><b>WARNING. No internet connection.</b><br>Cannot access data from Gracenote server.<br>&nbsp</p >");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        $('.background').css('filter', 'blur(5px)');
    }
    else {
        // Check there is a global_userID, if not run function newUser() to get gracenote userID
        if (global_UserID == null) {
            newUser()
        }

        // Replace ampersand in album and artist name for XML query to Gracenote
        album = album.replace('&', 'and');
        artist = artist.replace('&', 'and');

        // Send xml query to Gracenote to find number of matches
        var queryData = "<?xml version='1.0' encoding='UTF-8'?><QUERIES><AUTH><CLIENT>12398848-977A13ABAD0F2E143D38E61AF28B78DB</CLIENT>" +
            "<USER>" + global_UserID + "</USER></AUTH><LANG>eng</LANG><COUNTRY>uk</COUNTRY>" +
            "<QUERY CMD='ALBUM_SEARCH'>" +
            "<TEXT TYPE='ARTIST'>" + artist + "</TEXT>" +
            "<TEXT TYPE='ALBUM_TITLE'>" + album + "</TEXT>" +
            "<RANGE><START>1</START><END>10</END></RANGE>" +
            "</QUERY></QUERIES>";

        // Call ajax function albumQuery
        editAlbumQuery(queryData).done(editCheckData);

        // Function to send ajax xml query to Gracenote server
        function editAlbumQuery(query) {
            var queryAlbum = query;
            return $.ajax({
                url: gracenoteUrl,
                data: queryAlbum,
                type: "POST",
                datatype: "xml"
            });
        }
    }

    // Function to process response of ajax xml query for album matches
    function editCheckData(response) {
        var albumsFound = $(response).find("END").text();
        // Convert albumsFound to an integer
        var c = parseInt(albumsFound);

        var table = $("#tblGracenote")
        var tableCaption = $("<caption>Matches found in Gracenote database</caption>");
        tableCaption.appendTo(table);
        var tableHeader = $("<tr><th>Title</th><th>Date</th><th>No. Tracks</th></tr>");
        tableHeader.appendTo(table);
        var count = 1;
        for (var i = 0; i < c; i++) {
            var title = $(response).find('ALBUM[ORD="' + count + '"] TITLE').eq(0).text();
            var date = $(response).find('ALBUM[ORD="' + count + '"] DATE').eq(0).text();
            var number = $(response).find('ALBUM[ORD="' + count + '"] TRACK_COUNT').eq(0).text();
            var gnID = $(response).find('ALBUM[ORD="' + count + '"] GN_ID').eq(0).text();
            // Create table row
            var tableRow = $("<tr class='tracks'><td>" + title + "</td><td>" + date + "</td><td>" + number + "</td><td>" + gnID + "</td></tr>");
            // Append row to table
            tableRow.appendTo(table);
            count += 1;
        }
        // Hide modal box
        $('#okModal').css('display', 'none');
    }
}

// Button click for Artwork button in edit album
$(document).on('click', '#btnArtworkAlbum', function (event) {
    event.preventDefault();
    getArtwork();
});

// Function to get artowrk from edit album
function getArtwork() {
    // Display modal box checking Gracenote
    $('#okModal').css('display', 'block');
    $(".modalFooter").empty();
    $('.modalHeader').html('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
    $('#okModalText').html("<div class='modalIcon'><img src='./graphics/record.gif'></div><p>&nbsp<br>Searching the Gracenote database. Please wait.<br>&nbsp<br>&nbsp</p >");
    var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
    $('.modalFooter').append(buttons);
    $("#btnOkModal").focus();
    $('.background').css('filter', 'blur(5px)');

    var gnID = $("#tblGracenote tr.highlight").find('td:last').html();
    // Create XMl string query to query album tracks
    var queryTracks = "<?xml version='1.0' encoding='UTF-8'?><QUERIES><AUTH><CLIENT>12398848-977A13ABAD0F2E143D38E61AF28B78DB</CLIENT><USER>" + global_UserID + "</USER></AUTH><LANG>eng</LANG><COUNTRY>uk</COUNTRY><QUERY CMD='ALBUM_FETCH'><GN_ID>" + gnID + "</GN_ID><OPTION><PARAMETER>SELECT_EXTENDED</PARAMETER><VALUE>ARTIST_OET,MOOD,TEMPO</VALUE></OPTION><OPTION><PARAMETER>SELECT_DETAIL</PARAMETER>  <VALUE>GENRE:3LEVEL,MOOD:2LEVEL,TEMPO:3LEVEL,ARTIST_ORIGIN:4LEVEL,ARTIST_ERA:2LEVEL,ARTIST_TYPE:2LEVEL</VALUE></OPTION><OPTION><PARAMETER>SELECT_EXTENDED</PARAMETER><VALUE>COVER</VALUE></OPTION></QUERY></QUERIES>"
    artQuery(queryTracks).done(showArtwork);

    // Make ajax request for track details
    function artQuery(query) {
        var queryTracks = query;
        return $.ajax({
            url: gracenoteUrl,
            data: queryTracks,
            type: "POST",
            datatype: "xml"
        });
    }

    // Callback function referenced from artQuery.
    function showArtwork(response) {
        // Get URL of cover art and display image and URl in text input box
        var coverArt = $(response).find('URL').eq(0).text();
        if (coverArt) {
            $("#imgCoverArt").attr('src', coverArt);
            $("#inpEditCoverArtURL").val(coverArt);
            // Hide modal box
            $('#okModal').css('display', 'none');
            $('.background').css('filter', 'blur(0px)');
        }
        else {
            $("#inpEditCoverArtURL").val("");
            // Hide modal box
            $('#okModal').css('display', 'none');
            // Show ERROR modal to display
            $('#okModal').css('display', 'block');
            $(".modalFooter").empty();
            $('.modalHeader').html('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
            $('#okModalText').html("<div class='modalIcon'><img src='./graphics/warning.png'></div><p>&nbsp<br><b>NO ARTWORK FOUND</b> for the selection in the Gracenote table.<br>&nbsp<br>&nbsp</p >");
            var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
            $('.modalFooter').append(buttons);
            $("#btnOkModal").focus();
            $('.background').css('filter', 'blur(5px)');
        }
    }
}

// Button click for Get button in edit album to get Gracenote metadata
$(document).on('click', '#btnGetGracenote', function (event) {
    event.preventDefault();
    // Display modal box checking Gracenote
    $('#okModal').css('display', 'block');
    $(".modalFooter").empty();
    $('.modalHeader').html('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
    $('#okModalText').html("<div class='modalIcon'><img src='./graphics/record.gif'></div><p>&nbsp<br>Searching the Gracenote database. Please wait.<br>&nbsp<br>&nbsp</p >");
    var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
    $('.modalFooter').append(buttons);
    $("#btnOkModal").focus();
    $('.background').css('filter', 'blur(5px)');
    getMetadata();
});

// Function to update metatdata from edit album
function getMetadata() {
    var gnID = $("#tblGracenote tr.highlight").find('td:last').html();
    // Create XMl string query to query album tracks
    var queryTracks = "<?xml version='1.0' encoding='UTF-8'?><QUERIES><AUTH><CLIENT>12398848-977A13ABAD0F2E143D38E61AF28B78DB</CLIENT><USER>" + global_UserID + "</USER></AUTH><LANG>eng</LANG><COUNTRY>uk</COUNTRY><QUERY CMD='ALBUM_FETCH'><GN_ID>" + gnID + "</GN_ID><OPTION><PARAMETER>SELECT_EXTENDED</PARAMETER><VALUE>ARTIST_OET,MOOD,TEMPO</VALUE></OPTION><OPTION><PARAMETER>SELECT_DETAIL</PARAMETER>  <VALUE>GENRE:3LEVEL,MOOD:2LEVEL,TEMPO:3LEVEL,ARTIST_ORIGIN:4LEVEL,ARTIST_ERA:2LEVEL,ARTIST_TYPE:2LEVEL</VALUE></OPTION><OPTION><PARAMETER>SELECT_EXTENDED</PARAMETER><VALUE>COVER</VALUE></OPTION></QUERY></QUERIES>"
    metaQuery(queryTracks).done(updateMetadata);

    // Make ajax request for track details
    function metaQuery(query) {
        var queryTracks = query;
        return $.ajax({
            url: gracenoteUrl,
            data: queryTracks,
            type: "POST",
            datatype: "xml"
        });
    }

    // Callback function referenced from artQuery.
    function updateMetadata(response) {
        // Variable to check if meta data is updated in page
        var chkMeta = "";

        // Get album release date
        var albumDate = $(response).find('DATE').eq(0).text();
        if (albumDate == "") {
            albumDate = "";
        }
        //Check for changes and highlight
        chkMeta = $("#inpReleaseDate").val();
        if (chkMeta != albumDate) {
            $("#inpReleaseDate").val(albumDate);
            $("#inpReleaseDate").css("background-color", "yellow");
        }

        // Get artist origin
        var origin = "";
        for (i = 4; i > 0; i--) {
            var tempOrigin = $(response).find('ARTIST_ORIGIN[ORD="' + i + '"]').eq(0).text();
            if (tempOrigin != "" && i != 1) {
                origin = origin + tempOrigin + ", ";
            }
            else {
                origin = origin + tempOrigin;
            }
        }
        $("#inpArtistOrigin").val(origin);

        // Get main genre for album
        var genre1 = $(response).find('GENRE[ORD="1"]').eq(0).text();
        //Check for changes and highlight
        chkMeta = $("#genre").val();
        if (chkMeta != genre1) {
            $("#genre").val(genre1);
            $("#genre").css("background-color", "yellow");
        }
        // Genre 2
        var genre2 = $(response).find('GENRE[ORD="2"]').eq(0).text();
        // Genre 3
        var genre3 = $(response).find('GENRE[ORD="3"]').eq(0).text();

        // moodCount is a separte counter for when mood1 = other and there is no mood2, increase the moodcount by 1 
        //otherwise the following tracks read the previous tracks mood
        var moodCount = 0;
        // formTrackCount = number of tracks on add to database form
        var formTrackCount = $("#inpCount").val();
        var count = 1;
        // Get meta data for tracks in a loop
        // count = counter to count up to number of tracks on add to database form
        for (let i = 0; i < (formTrackCount); i++) {
            // trackNumber = from hidden field in add to database form
            var trackNumber = $("#" + (count) + "trackNumber").val();
            trackNumber = parseInt(trackNumber);
            // number = for accessing the xml data which is zero indexed
            var number = trackNumber - 1;

            // Get name track name from XML file and Update page to compare
            var metaTrackName = $(response).find('TITLE').eq(number + 1).text().toLowerCase();
            var trackName = $("#" + (count) + "trackName").val().toLowerCase();
            // Remove track number from start of track name
            trackName = trackName.substring(trackName.indexOf(" ") + 1);
            // If track name from database and gracenote match the update
            if (metaTrackName == trackName) {
                // Mood 1;
                var mood1 = $(response).find('TRACK MOOD[ORD="1"]').eq(number).text();
                var m1 = "#" + (count) + "mood1";
                //Check for changes and highlight
                chkMeta = $(m1).val();
                if (chkMeta != mood1) {
                    $(m1).val(mood1);
                    $(m1).css("background-color", "yellow");
                }
                // Mood 2
                if (mood1 == "Other") {
                    var mood2 = "Other";
                    var m2 = "#" + (count) + "mood2";
                    moodCount += 1;
                }
                else {
                    var mood2 = $(response).find('TRACK MOOD[ORD="2"]').eq(number - moodCount).text();
                    var m2 = "#" + (count) + "mood2";
                }
                //Check for changes and highlight
                chkMeta = $(m2).val();
                if (chkMeta != mood2) {
                    $(m2).val(mood2);
                    $(m2).css("background-color", "yellow");
                }

                // Tempo 1
                var tempo1 = $(response).find('TRACK TEMPO[ORD="1"]').eq(number).text();
                var t1 = "#" + (count) + "tempo1";
                //Check for changes and highlight
                chkMeta = $(t1).val();
                if (chkMeta != tempo1) {
                    $(t1).val(tempo1);
                    $(t1).css("background-color", "yellow");
                }

                // Tempo 2
                var tempo2 = $(response).find('TRACK TEMPO[ORD="2"]').eq(number).text();
                var t2 = "#" + (count) + "tempo2";
                //Check for changes and highlight
                chkMeta = $(t2).val();
                if (chkMeta != tempo2) {
                    $(t2).val(tempo2);
                    $(t2).css("background-color", "yellow");
                }
                // Genre 2
                var g2 = "#" + (count) + "genre2";
                //Check for changes and highlight
                chkMeta = $(g2).val();
                if (chkMeta != genre2) {
                    $(g2).val(genre2);
                    $(g2).css("background-color", "yellow");
                }
                // Genre 3
                var g3 = "#" + (count) + "genre3";
                //Check for changes and highlight
                chkMeta = $(g3).val();
                if (chkMeta != genre3) {
                    $(g3).val(genre3);
                    $(g3).css("background-color", "yellow");
                }
            }
            count += 1;
        }
        // Hide modal box
        $('#okModal').css('display', 'none');
        $('.background').css('filter', 'blur(0px)');
    }
}

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

            var artistOrigin = $("#inpArtistOrigin").val();
            var originalAlbumName = $("#inpOriginalAlbumName").val();
            var originalArtistName = $("#inpOriginalArtistName").val();
            // Replace encoded &amp with &
            originalAlbumName = originalAlbumName.replace(/&amp;/g, '&');
            originalArtistName = originalArtistName.replace(/&amp;/g, '&');

            var releaseDate = $("#inpReleaseDate").val();
            var genre = $('[name=sltGenre]').val();
            var noTracks = $("#inpCount").val();
            var coverArtUrl = $("#inpEditCoverArtURL").val();
            // Get todays date and convert
            var todayDate = new Date();
            var dateAdd = convertDate(todayDate);

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
                // Zero variable for initial playCount
                var count = 0;
                // Set counters
                var counter1 = 1;
                noTracks = parseInt(noTracks);
                // Loop through each track and add to track table
                for (var i = 0; i < (noTracks); i++) {
                    var trackID = $("#" + counter1 + "trackID").val();
                    var trackName = $("#" + counter1 + "trackName").val();
                    var mood1 = $("#" + counter1 + "mood1").val();
                    var mood2 = $("#" + counter1 + "mood2").val();
                    var tempo1 = $("#" + counter1 + "tempo1").val();
                    var tempo2 = $("#" + counter1 + "tempo2").val();
                    var genre2 = $("#" + counter1 + "genre2").val();
                    var genre3 = $("#" + counter1 + "genre3").val();

                    var sql = 'UPDATE track SET artistID=' + artistID + ', genreID=' + genreID + ', trackName="' + trackName + '", mood1="' + mood1 + '", mood2="' + mood2 + '", tempo1="' + tempo1 + '", tempo2="' + tempo2 + '", genre2="' + genre2 + '", genre3="' + genre3 + '" WHERE trackID=' + trackID;

                    var update = await dBase.run(sql);

                    counter1 += 1;
                }

                // COVER ART
                // Check first 4 chars of coverArtUrl to see if it is a URL or filepath
                var check = coverArtUrl.substring(0, 4);

                // coverArtUrl is a URL
                if (coverArtUrl != "" && check == "http") {
                    // Save cover art to album folder in music directory
                    var artFilePath = MUSIC_PATH + artist + "/" + album + "/AlbumArtXLarge.jpg";
                    var resizedFilePath = MUSIC_PATH + artist + "/" + album + "/folder.jpg";
                    // Send message to main.js to save and resize art image
                    ipcRenderer.send("save_artXlarge_URL", [coverArtUrl, artFilePath, resizedFilePath]);
                }

                // coverArtUrl is a filepath
                if (coverArtUrl != "" && check != "http") {
                    var artFilePath = MUSIC_PATH + artist + "/" + album + "/AlbumArtXLarge.jpg";
                    var resizedFilePath = MUSIC_PATH + artist + "/" + album + "/folder.jpg";
                    // Send message to main.js to save AlbumArtXLarge image
                    ipcRenderer.send("save_artXlarge_file", [coverArtUrl, artFilePath]);
                    // Send message to main.js to resize folder image
                    ipcRenderer.send("save_folder_file", [coverArtUrl, resizedFilePath]);
                }

                // Show OK modal box to confirm album updated in database
                $('#okModal').css('display', 'block');
                $(".modalFooter").empty();
                $('.modalHeader').html('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
                $('#okModalText').html("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br>Album has been successfully updated in " + global_AppName + ".<br>&nbsp<br>&nbsp</p >");
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
                $(".modalFooter").empty();
                $('.modalHeader').html('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
                $('#okModalText').html("<div class='modalIcon'><img src='./graphics/warning.png'></div><p>&nbsp<br><b>DATABASE ERROR</b> - album could not be updated in " + global_AppName + ".<br>&nbsp<br>&nbsp</p >");
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
        //if (row.albumCount == 1) {
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
    ipcRenderer.send("open_file_dialog", ["manual_artwork", "Select Album Artwork Image File", "C:\\", "Select File", [{ name: 'Images', extensions: ['jpg'] }], "openFile"]);
});

// Response from selecting manual artwork browse dialog box
ipcRenderer.on("manual_artwork", (event, data) => {
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
    $(".modalFooter").empty();
    $('.modalHeader').html('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
    $('#okModalText').html("<div class='modalIcon'><img src='./graphics/question.png'></div><p>&nbsp<br>Are you sure you want to delete this album from " + global_AppName + "?<br>&nbsp</p >");
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
        $(".modalFooter").empty();
        $('.modalHeader').html('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').html("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br>Album has been successfully deleted from " + global_AppName + ".<br>&nbsp<br>&nbsp</p >");
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
        $(".modalFooter").empty();
        $('.modalHeader').html('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').html("<div class='modalIcon'><img src='./graphics/warning.png'></div><p>&nbsp<br><b>DATABASE ERROR</b> - album could not be deleted from " + global_AppName + ".<br>&nbsp<br>&nbsp</p >");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        $('.background').css('filter', 'blur(5px)');
    }
});