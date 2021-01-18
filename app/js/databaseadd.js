//#################################
// Sync Database to Music Directory
//#################################
$(document).on('click', '#btnSync', function (event) {
    event.preventDefault();
    btnSyncClick()
});

function btnSyncClick() {
    // Check if there is a MUSIC_PATH
    if (!MUSIC_PATH) {
        // If no MUSIC_PATH display warning
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/warning.png'></div><p>&nbsp<br><b>WARNING. No Music Path has been set.</b><br>Please go to Settings and set your Music Path.&nbsp</p >");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        $('.background').css('filter', 'blur(5px)');
        return
    }
    // Check if online
    var connection = navigator.onLine;

    if (connection) {
        // If connected to internet
        // Check there is a global_userID, if not run function newUser() to get gracenote userID
        if (global_UserID == null) {
            newUser()
        }

        $("#divContent").css("width", "475px");
        // Hide A to Z menu
        $('#spnAtoZmenu').css('display', 'none');
        // Hide Artist and Album column of Song table
        $("#tblSongs td:nth-child(2)").css("display", "none");
        $("#tblSongs th:nth-child(2)").css("display", "none");
        $("#tblSongs td:nth-child(3)").css("display", "none");
        $("#tblSongs th:nth-child(3)").css("display", "none");
        // Show and load newmusic.html file
        $("#divTrackListing").css("display", "block");
        $('#divTrackListing').load("./html/newmusic.html");
        // Disable btnSync
        $("#btnSync").prop("disabled", true);
        $(document).ajaxComplete(function () {
            $(document).scrollTop(0);
            backgroundChange()
        });
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
}

//#########################################
// Onclick event for Search Gracenote button
//#########################################
$(document).on('click', '#btnSearchGracenote', function (event) {
    event.preventDefault();
    var newArtist = $("#tblGracenote tr.highlight").find('td:first').text();
    // Call function to display input form
    if (!newArtist) {
        return false;
    }
    else {
        // Display modal box checking Gracenote
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/record.gif'></div><p>&nbsp<br>Searching the Gracenote database. Please wait.<br>&nbsp<br>&nbsp</p >");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        $('.background').css('filter', 'blur(5px)');
        albumMatches();
    }
});

//#########################################
// Onclick event for Manual button
//#########################################
$(document).on('click', '#btnManual', function (event) {
    event.preventDefault();
    global_ImportMode = "manual";

    var newArtist = $("#tblGracenote tr.highlight").find('td:first').text();
    var newAlbum = $("#tblGracenote tr.highlight").find('td:nth-child(2)').text();
    if (!newArtist) {
        newArtist = $("#selectedArtist").text();
        newAlbum = $("#selectedAlbum").text();
    }

    if (newArtist) {
        // Populate hidden elements with selected album details
        $("#selectedArtist").text(newArtist);
        $("#selectedAlbum").text(newAlbum);
        // Set variables for screen width
        var srnWidth = $(window).width();
        var width = (srnWidth - 260);
        // Load add to database page
        $("#divTrackListing").css("display", "none");
        $("#divContent").css("width", width);
        // Set url
        var url = ("./html/importtodatabase.html");
        // Load Add to Database page
        $("#divContent").load(url);
    }
    else {
        return;
    }
});

//#################################################
// Function to display album matches from Gracenote
//#################################################
function albumMatches() {
    // Send xml query to Gracenote to find number of matches
    var newArtist = $("#tblGracenote tr.highlight").find('td:first').text();
    var newAlbum = $("#tblGracenote tr.highlight").find('td:nth-child(2)').text();

    var queryData = "<?xml version='1.0' encoding='UTF-8'?><QUERIES><AUTH><CLIENT>12398848-977A13ABAD0F2E143D38E61AF28B78DB</CLIENT>" +
        "<USER>" + global_UserID + "</USER></AUTH><LANG>eng</LANG><COUNTRY>uk</COUNTRY>" +
        "<QUERY CMD='ALBUM_SEARCH'>" +
        "<TEXT TYPE='ARTIST'>" + newArtist + "</TEXT>" +
        "<TEXT TYPE='ALBUM_TITLE'>" + newAlbum + "</TEXT>" +
        "<RANGE><START>1</START><END>10</END></RANGE>" +
        "</QUERY></QUERIES>";

    // Populate hidden elements with selected album details
    $("#selectedArtist").text(newArtist);
    $("#selectedAlbum").text(newAlbum);
    $("#selectedNoTracks").text($("#tblGracenote tr.highlight").find('td:nth-child(3)').text());

    // Call ajax function albumQuery
    albumQuery(queryData).done(checkData);

    // Function to send ajax xml query to Gracenote server
    function albumQuery(query) {
        var queryAlbum = query;
        return $.ajax({
            url: gracenoteUrl,
            data: queryAlbum,
            type: "POST",
            datatype: "xml"
        });
    }

    // Function to process response of ajax xml query for album matches
    function checkData(response) {
        var albumsFound = $(response).find("END").text();
        // Convert albumsFound to an integer
        var c = parseInt(albumsFound);

        // Get number of tracks for album from main.js
        ipcRenderer.send("count_tracks", [MUSIC_PATH, $("#selectedArtist").text(), $("#selectedAlbum").text()])

        // Display details of album selected with numbr of tracks
        ipcRenderer.on("from_count_tracks", (event, data) => {
            var numberTracks = data[0];
            $('#displayNewMusicDetails').empty();
            $('#displayNewMusicDetails').append(albumsFound + " Album matches have been found in the Gracenote database.<br>" + "Searched for: " + $("#selectedArtist").text() + ", " + $("#selectedAlbum").text() + ", No. Tracks " + numberTracks);
        });

        // Clear existing elments from New Music search
        $('#tblGracenote').empty();
        $('#displayNewMusicDetails').empty();
        $('#displayNewMusicInfo').empty();
        $('#displayNewMusicInfo').append("Select the closest match and click on GET button to get album metadata.<br>If no suitable matches found click on MANUAL button to manually import album metadata.")

        $('.background').css('filter', 'blur(0px)');
        $('#btnSearchGracenote').css('display', 'none');
        $('#btnDownloadGracenote').css('display', 'inline-block');
        $("#btnDownloadGracenote").prop("disabled", true);

        var table = $("#tblGracenote")
        var tableHeader = $("<tr><th class='rowGraceTitle'>Title</th><th class='rowGraceDate'>Date</th><th class='rowGraceTracks'>No. Tracks</th></tr>");
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

//#########################################
// Onclick event for Get Metadata button
//#########################################
$(document).on('click', '#btnDownloadGracenote', function (event) {
    event.preventDefault();
    var gnID = $("#tblGracenote tr.highlight").find('td:last').text();
    // Call function to display input form
    if (!gnID) {
        return false;
    }
    else {
        // Display modal box checking Gracenote
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/record.gif'></div><p>&nbsp<br>Searching the Gracenote database. Please wait.<br>&nbsp<br>&nbsp</p >");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        $('.background').css('filter', 'blur(5px)');

        global_ImportMode = "auto";
        // Set variables for screen width
        var srnWidth = $(window).width();
        var width = (srnWidth - 260);
        // Load add to database page
        $("#divTrackListing").css("display", "none");
        $("#divContent").css("width", width);

        // Set url
        var url = ("./html/importtodatabase.html");
        // Load Add to Database page
        $("#divContent").load(url);
        $('.background').css('filter', 'blur(0px)');
    }
});

// Array to store list of files sent back by IPC from main.js
var files = [];

// Message recieved from main.js with files in album directory
// files_album_directory
// Receive all files in album directory
ipcRenderer.on("files_album_directory", (event, data) => {
    var sender = data[0];
    if (sender == "importtodatabase") {
        files = data[1];
        var artist = data[2];
        var album = data[3];
        var counter = 1;
        var form = $("#frmAdd")

        // Loop through each music file in album directory
        for (var i = 0; i < files.length; i++) {
            var audioSource = MUSIC_PATH + artist + "/" + album + "/" + files[i];
            var audio = $('<audio class="player" id="' + i + '" src="' + audioSource + '"></audio>');

            $("#divAudioElements").append(audio);
            var fieldset = $("<fieldset><legend>Track " + counter + "</legend><label class='lblTrackName'>Name: </label><input required class='inpTrackName' id='" + counter + "trackName' name=" + counter + "trackName' type='text' size='79' value='' /><label class='lblFileName'>File Name:</label><input required class='inpFileName' id='" + counter + "fileName' name='" + counter + "fileName' type='text' size='75' value='' readonly /><label class='lblTrackTime'>Time:</label><input required class='inpTrackTime' id='" + counter + "pTime' name='" + counter + "pTime' type='text' size='8 value='' /><br><label class='lblTrackName'>Mood 1:</label><select class='sltMood1' id='" + counter + "mood1' name=" + counter + "mood1'><option value=''></option><option value='Peaceful'>Peaceful</option><option value='Romantic'>Romantic</option><option value='Sentimental'>Sentimental</option><option value='Tender'>Tender</option><option value='Easygoing'>Easygoing</option><option value='Yearning'>Yearning</option><option value='Sophisticated'>Sophisticated</option><option value='Sensual'>Sensual</option><option value='Cool'>Cool</option><option value='Gritty'>Gritty</option><option value='Somber'>Somber</option><option value='Melancholy'>Melancholy</option><option value='Serious'>Serious</option><option value='Brooding'>Brooding</option><option value='Fiery'>Fiery</option><option value='Urgent'>Urgent</option><option value='Defiant'>Defiant</option><option value='Aggressive'>Aggressive</option><option value='Rowdy'>Rowdy</option><option value='Excited'>Excited</option><option value='Energizing'>Energizing</option><option value='Empowering'>Empowering</option><option value='Stirring'>Stirring</option><option value='Lively'>Lively</option><option value='Upbeat'>Upbeat</option><option value='Other'>Other</option></select><label class='lblFileName'>Mood 2:</label><select class='sltMood2' id='" + counter + "mood2' name=" + counter + "mood2'></select><br><label class='lblTrackName'>Tempo 1:</label><select class='sltTempo1' id='" + counter + "tempo1' name=" + counter + "tempo1'><option value=''></option><option value='Slow Tempo'>Slow Tempo</option><option value='Medium Tempo'>Medium Tempo</option><option value='Fast Tempo'>Fast Tempo</option></select><label class='lblFileName'>Tempo 2:</label><select class='sltTempo2' id='" + counter + "tempo2' name=" + counter + "tempo2'></select><br><label class='lblTrackName'>Genre 2:</label><input class='inpTrackName' id='" + counter + "genre2' name=" + counter + "genre2' type='text' size='40' value='' /><label class='lblFileName'>Genre 3:</label><input class='inpTrackName' id='" + counter + "genre3' name=" + counter + "genre3' type='text' size='40' value='' /></fieldset>");

            // Append fieldset to form
            fieldset.appendTo(form);

            // Increase counter
            counter += 1;
        }
        // Get audio file and total album duration
        var totalTime = 0;
        var albumTime = 0;
        $(".player").each(function () {
            $(this).on('loadedmetadata', function () {
                var id = $(this).attr('id');
                // Use the audio id number to to create a reference to the playTime input box
                var count = parseInt(id);
                count += 1;
                var pTime = "#" + count + "pTime";
                // Get file duration
                var seconds = (this.duration);
                // Add duration to the total time of the album
                var secs = parseInt(seconds);
                totalTime += secs;
                // Convert seconds to minuntes and seconds
                var minutes = Math.floor(seconds / 60);
                seconds = Math.floor(seconds % 60);
                seconds = (seconds >= 10) ? seconds : "0" + seconds;
                var time = (minutes + ":" + seconds);
                // Calculate total album time
                var albumMinutes = Math.floor(totalTime / 60);
                var albumSeconds = Math.floor(totalTime % 60);
                albumSeconds = (albumSeconds >= 10) ? albumSeconds : "0" + albumSeconds;
                albumTime = (albumMinutes + ":" + albumSeconds);
                // Add the time value to the playTime input box
                $(pTime).val(time);

                $("#inpAlbumTime").val(albumTime);
            });
        });
    }
    // Function go get meta data fromn Gracenote in index.js
    albumMetadata();
});

//#########################################
// Function to display Add to Database page
//######################################### 
function albumMetadata() {
    var gnID = $("#tblGracenote tr.highlight").find('td:last').text();
    // Create XMl string query to query album tracks
    var queryTracks = "<?xml version='1.0' encoding='UTF-8'?><QUERIES><AUTH><CLIENT>12398848-977A13ABAD0F2E143D38E61AF28B78DB</CLIENT><USER>" + global_UserID + "</USER></AUTH><LANG>eng</LANG><COUNTRY>uk</COUNTRY><QUERY CMD='ALBUM_FETCH'><GN_ID>" + gnID + "</GN_ID><OPTION><PARAMETER>SELECT_EXTENDED</PARAMETER><VALUE>ARTIST_OET,MOOD,TEMPO</VALUE></OPTION><OPTION><PARAMETER>SELECT_DETAIL</PARAMETER>  <VALUE>GENRE:3LEVEL,MOOD:2LEVEL,TEMPO:3LEVEL,ARTIST_ORIGIN:4LEVEL,ARTIST_ERA:2LEVEL,ARTIST_TYPE:2LEVEL</VALUE></OPTION><OPTION><PARAMETER>SELECT_EXTENDED</PARAMETER><VALUE>COVER</VALUE></OPTION></QUERY></QUERIES>"
    trackQuery(queryTracks).done(trackData);

    // Make ajax request for track details
    function trackQuery(query) {
        if (global_ImportMode == "auto") {
            var queryTracks = query;
            return $.ajax({
                url: gracenoteUrl,
                data: queryTracks,
                type: "POST",
                datatype: "xml"
            });
        }
        // If importing manually with no Gracenote metadata
        else {
            return $.ajax({
                type: "POST",
                datatype: "xml"
            });
        }
    }

    // Callback function referenced from trackQuery.
    function trackData(response) {
        // Set variables
        var artist = $("#selectedArtist").text();
        var album = $("#selectedAlbum").text();
        // Replace encoded &amp with &
        artist = artist.replace(/&amp;/g, '&');
        album = album.replace(/&amp;/g, '&');
        var counter = 1;

        // moodCount is a separte counter for when mood1 = other and there is no mood2, increase the moodcount by 1 
        //otherwise the following tracks read the previous tracks mood
        var moodCount = 0;

        // Get main genre for album
        var genre1 = $(response).find('GENRE[ORD="1"]').eq(0).text();

        $('[name=sltGenre]').val(genre1);

        // Genre 2
        var genre2 = $(response).find('GENRE[ORD="2"]').eq(0).text();
        // Genre 3
        var genre3 = $(response).find('GENRE[ORD="3"]').eq(0).text();

        // Loop through each music file and populate XML data
        for (var i = 0; i < files.length; i++) {
            var tName = files[i].slice(0, -4);

            // Check filename format if downloaded from Amazon in format "01 - SongName" and remove the dash after the track number
            var format = tName.substring(2, 5);
            if (format == " - ") {
                // Slice tName around the " - " in order to remove the dash
                tName = tName.slice(0, 2) + tName.slice(4, tName.length);
            }

            // Get the track number from start of track name
            var tNumber = files[i].substr(0, files[i].indexOf(' '));
            // Remove leading zero
            tNumber = tNumber.replace(/^0+/, '');
            // number = for accessing the xml data which is zero indexed
            var number = parseInt(tNumber);

            number -= 1;
            // Trackname
            $("#" + counter + "trackName").val(tName);
            // Filename
            $("#" + counter + "fileName").val(files[i]);
            // Get XML data for each track
            // Mood 1;
            var mood1 = $(response).find('TRACK MOOD[ORD="1"]').eq(number).text();
            $("#" + counter + "mood1").val(mood1);
            // Tempo 1
            var tempo1 = $(response).find('TRACK TEMPO[ORD="1"]').eq(number).text();
            $("#" + counter + "tempo1").val(tempo1);
            // Tempo 2
            var tempo2 = $(response).find('TRACK TEMPO[ORD="2"]').eq(number).text();
            switch (tempo1) {
                case "Slow Tempo":
                    $("#" + counter + "tempo2").append("<option></option>");
                    $("#" + counter + "tempo2").append("<option>Static</option>");
                    $("#" + counter + "tempo2").append("<option>Very Slow</option>");
                    $("#" + counter + "tempo2").append("<option>Slow</option>");
                    break;
                case "Medium Tempo":
                    $("#" + counter + "tempo2").append("<option></option>");
                    $("#" + counter + "tempo2").append("<option>Medium Slow</option>");
                    $("#" + counter + "tempo2").append("<option>Medium</option>");
                    $("#" + counter + "tempo2").append("<option>Medium Fast</option>");
                    break;
                case "Fast Tempo":
                    $("#" + counter + "tempo2").append("<option></option>");
                    $("#" + counter + "tempo2").append("<option>Fast</option>");
                    $("#" + counter + "tempo2").append("<option>Very Fast</option>");
                    break;
            }
            $("#" + counter + "tempo2").val(tempo2);
            // Genre  2
            $("#" + counter + "genre2").val(genre2);
            // Genre 3
            $("#" + counter + "genre3").val(genre3);
            // Mood 2
            switch (mood1) {
                case "Peaceful":
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Reverent / Healing</option>");
                    $("#" + counter + "mood2").append("<option>Quiet / Introspective</option>");
                    $("#" + counter + "mood2").append("<option>Delicate / Tranquil</option>");
                    $("#" + counter + "mood2").append("<option>Pastoral / Serene</option>");
                    break;
                case "Romantic":
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Lush / Romantic</option>");
                    $("#" + counter + "mood2").append("<option>Sweet / Sincere</option>");
                    $("#" + counter + "mood2").append("<option>Heartfelt Passion</option>");
                    $("#" + counter + "mood2").append("<option>Dramatic / Romantic</option>");
                    break;
                case "Sentimental":
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Lyrical Sentimental</option>");
                    $("#" + counter + "mood2").append("<option>Gentle Bittersweet</option>");
                    $("#" + counter + "mood2").append("<option>Tender / Sincere</option>");
                    $("#" + counter + "mood2").append("<option>Cool Melancholy</option>");
                    break;
                case "Tender":
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Romantic / Lyrical</option>");
                    $("#" + counter + "mood2").append("<option>Refined / Mannered</option>");
                    $("#" + counter + "mood2").append("<option>Awakening / Stately</option>");
                    $("#" + counter + "mood2").append("<option>Light Groovy</option>");
                    break;
                case "Easygoing":
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Friendly</option>");
                    $("#" + counter + "mood2").append("<option>Hopeful / Breezy</option>");
                    $("#" + counter + "mood2").append("<option>Cheerful / Playful</option>");
                    $("#" + counter + "mood2").append("<option>Charming / Easygoing</option>");
                    break;
                case "Yearning":
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Sensitive / Exploring</option>");
                    $("#" + counter + "mood2").append("<option>Energetic Yearning</option>");
                    $("#" + counter + "mood2").append("<option>Energetic Dreamy</option>");
                    $("#" + counter + "mood2").append("<option>Bittersweet Pop</option>");
                    break;
                case "Sophisticated":
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Smoky / Romantic</option>");
                    $("#" + counter + "mood2").append("<option>Intimate Bittersweet</option>");
                    $("#" + counter + "mood2").append("<option>Suave / Sultry</option>");
                    $("#" + counter + "mood2").append("<option>Dark Playful</option>");
                    break;
                case "Sensual":
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Soft Soulful</option>");
                    $("#" + counter + "mood2").append("<option>Sensual Groove</option>");
                    $("#" + counter + "mood2").append("<option>Intimate</option>");
                    $("#" + counter + "mood2").append("<option>Dreamy Pulse</option>");
                    break;
                case "Cool":
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Cool Confidence</option>");
                    $("#" + counter + "mood2").append("<option>Casual Groove</option>");
                    $("#" + counter + "mood2").append("<option>Dark Groovy</option>");
                    $("#" + counter + "mood2").append("<option>Wary / Defiant</option>");
                    break;
                case "Gritty":
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Depressed / Lonely</option>");
                    $("#" + counter + "mood2").append("<option>Sober / Determined</option>");
                    $("#" + counter + "mood2").append("<option>Gritty / Soulful</option>");
                    $("#" + counter + "mood2").append("<option>Strumming Yearning</option>");
                    break;
                case "Somber":
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Dark Cosmic</option>");
                    $("#" + counter + "mood2").append("<option>Enigmatic / Mysterious</option>");
                    $("#" + counter + "mood2").append("<option>Creepy / Ominous</option>");
                    $("#" + counter + "mood2").append("<option>Solemn / Spiritual</option>");
                    break;
                case "Melancholy":
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Mysterious / Dreamy</option>");
                    $("#" + counter + "mood2").append("<option>Wistful / Forlorn</option>");
                    $("#" + counter + "mood2").append("<option>Light Melancholy</option>");
                    $("#" + counter + "mood2").append("<option>Sad / Soulful</option>");
                    break;
                case "Serious":
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Thrilling</option>");
                    $("#" + counter + "mood2").append("<option>Melodramatic</option>");
                    $("#" + counter + "mood2").append("<option>Serious / Cerebral</option>");
                    $("#" + counter + "mood2").append("<option>Hypnotic Rhythm</option>");
                    break;
                case "Brooding":
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Energetic Melancholy</option>");
                    $("#" + counter + "mood2").append("<option>Alienated / Brooding</option>");
                    $("#" + counter + "mood2").append("<option>Evocative / Intriguing</option>");
                    $("#" + counter + "mood2").append("<option>Dreamy Brooding</option>");
                    break;
                case "Fiery":
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Dark Sparkling Lyrical</option>");
                    $("#" + counter + "mood2").append("<option>Fiery Groove</option>");
                    $("#" + counter + "mood2").append("<option>Passionate Rhythm</option>");
                    $("#" + counter + "mood2").append("<option>Energetic Abstract Groove</option>");
                    break;
                case "Urgent":
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Dark Urgent</option>");
                    $("#" + counter + "mood2").append("<option>Dark Pop</option>");
                    $("#" + counter + "mood2").append("<option>Dark Pop Intensity</option>");
                    $("#" + counter + "mood2").append("<option>Energetic Anxious</option>");
                    break;
                case "Defiant":
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Heavy Brooding</option>");
                    $("#" + counter + "mood2").append("<option>Hard Dark Excitement</option>");
                    $("#" + counter + "mood2").append("<option>Hard Positive Excitement</option>");
                    $("#" + counter + "mood2").append("<option>Attitude / Defiant</option>");
                    break;
                case "Aggressive":
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Dark Hard Beat</option>");
                    $("#" + counter + "mood2").append("<option>Heavy Triumphant</option>");
                    $("#" + counter + "mood2").append("<option>Chaotic / Intense</option>");
                    $("#" + counter + "mood2").append("<option>Aggressive Power</option>");
                    break;
                case "Rowdy":
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Driving Dark Groove</option>");
                    $("#" + counter + "mood2").append("<option>Wild / Rowdy</option>");
                    $("#" + counter + "mood2").append("<option>Ramshackle / Rollicking</option>");
                    $("#" + counter + "mood2").append("<option>Confident / Tough</option>");
                    break;
                case "Excited":
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Loud Celebratory</option>");
                    $("#" + counter + "mood2").append("<option>Happy Excitement</option>");
                    $("#" + counter + "mood2").append("<option>Upbeat Pop Groove</option>");
                    $("#" + counter + "mood2").append("<option>Euphoric Energy</option>");
                    break;
                case "Energizing":
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Arousing Groove</option>");
                    $("#" + counter + "mood2").append("<option>Heavy Beat</option>");
                    $("#" + counter + "mood2").append("<option>Abstract Beat</option>");
                    $("#" + counter + "mood2").append("<option>Edgy / Sexy</option>");
                    break;
                case "Empowering":
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Dramatic Emotion</option>");
                    $("#" + counter + "mood2").append("<option>Powerful / Heroic</option>");
                    $("#" + counter + "mood2").append("<option>Idealistic / Stirring</option>");
                    $("#" + counter + "mood2").append("<option>Strong / Stable</option>");
                    break;
                case "Stirring":
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Jubilant / Soulful</option>");
                    $("#" + counter + "mood2").append("<option>Triumphant / Rousing</option>");
                    $("#" + counter + "mood2").append("<option>Focused Sparkling</option>");
                    $("#" + counter + "mood2").append("<option>Invigorating / Joyous</option>");
                    break;
                case "Lively":
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Showy / Rousing</option>");
                    $("#" + counter + "mood2").append("<option>Playful / Swingin'</option>");
                    $("#" + counter + "mood2").append("<option>Exuberant / Festive</option>");
                    $("#" + counter + "mood2").append("<option>Lusty / Jaunty</option>");
                    break;
                case "Upbeat":
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Happy / Soulful</option>");
                    $("#" + counter + "mood2").append("<option>Carefree Pop</option>");
                    $("#" + counter + "mood2").append("<option>Party / Fun</option>");
                    $("#" + counter + "mood2").append("<option>Soulful / Easygoing</option>");
                    break;
                case "Other":
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Other</option>");
                    break;
            }

            // Mood 2
            if (mood1 == "Other") {
                var mood2 = "Other";
                moodCount += 1;
            }
            else {
                var mood2 = $(response).find('TRACK MOOD[ORD="2"]').eq(number - moodCount).text();
            }
            $("#" + counter + "mood2").val(mood2);
            counter += 1;
        }

        // Populate hidden field with number of tracks
        counter -= 1
        $("#inpCount").val(counter)

        // Populate meta data from Gracenote XML file
        // Get URL of cover art and display image and URl in text input box
        var coverArt = $(response).find('URL').eq(0).text();
        $("#imgCoverArt").attr('src', coverArt);
        $("#inpCoverArtURL").val(coverArt);

        // Get album release date
        var albumDate = $(response).find('DATE').eq(0).text();
        if (albumDate == "") {
            albumDate = "";
        }
        $("#inpReleaseDate").val(albumDate);

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
        // Check if artist is Various Artists and if it is don't add artist origin
        if (artist == "Various Artists") {
            $("#inpArtistOrigin").val("");
        }
        else {
            $("#inpArtistOrigin").val(origin);
        }
    }
    // Hide modal box
    $('#okModal').css('display', 'none');
}

// Change Mood2 selection box when Mood1 changed
$(document).on('change', '.sltMood1', function () {
    // Get ID of selection element
    var mood1ID = $(this).attr('id');
    // Get value selected
    var mood1Value = $(this).val();
    // Get first digit of ID which represents track no.
    var trackNo = mood1ID.substring(0, 1);
    // Mood2 ID
    var mood2ID = trackNo + "mood2";
    // Empty contents of mood2 selection element
    $('#' + mood2ID).empty();
    // populate mood2 selection element based on value in mood1 selection element
    switch (mood1Value) {
        case "Peaceful":
            $('#' + mood2ID).append("<option></option>");
            $('#' + mood2ID).append("<option>Reverent / Healing</option>");
            $('#' + mood2ID).append("<option>Quiet / Introspective</option>");
            $('#' + mood2ID).append("<option>Delicate / Tranquil</option>");
            $('#' + mood2ID).append("<option>Pastoral / Serene</option>");
            break;
        case "Romantic":
            $('#' + mood2ID).append("<option></option>");
            $('#' + mood2ID).append("<option>Lush / Romantic</option>");
            $('#' + mood2ID).append("<option>Sweet / Sincere</option>");
            $('#' + mood2ID).append("<option>Heartfelt Passion</option>");
            $('#' + mood2ID).append("<option>Dramatic / Romantic</option>");
            break;
        case "Sentimental":
            $('#' + mood2ID).append("<option></option>");
            $('#' + mood2ID).append("<option>Lyrical Sentimental</option>");
            $('#' + mood2ID).append("<option>Gentle Bittersweet</option>");
            $('#' + mood2ID).append("<option>Tender / Sincere</option>");
            $('#' + mood2ID).append("<option>Cool Melancholy</option>");
            break;
        case "Tender":
            $('#' + mood2ID).append("<option></option>");
            $('#' + mood2ID).append("<option>Romantic / Lyrical</option>");
            $('#' + mood2ID).append("<option>Refined / Mannered</option>");
            $('#' + mood2ID).append("<option>Awakening / Stately</option>");
            $('#' + mood2ID).append("<option>Light Groovy</option>");
            break;
        case "Easygoing":
            $('#' + mood2ID).append("<option></option>");
            $('#' + mood2ID).append("<option>Friendly</option>");
            $('#' + mood2ID).append("<option>Hopeful / Breezy</option>");
            $('#' + mood2ID).append("<option>Cheerful / Playful</option>");
            $('#' + mood2ID).append("<option>Charming / Easygoing</option>");
            break;
        case "Yearning":
            $('#' + mood2ID).append("<option></option>");
            $('#' + mood2ID).append("<option>Sensitive / Exploring</option>");
            $('#' + mood2ID).append("<option>Energetic Yearning</option>");
            $('#' + mood2ID).append("<option>Energetic Dreamy</option>");
            $('#' + mood2ID).append("<option>Bittersweet Pop</option>");
            break;
        case "Sophisticated":
            $('#' + mood2ID).append("<option></option>");
            $('#' + mood2ID).append("<option>Smoky / Romantic</option>");
            $('#' + mood2ID).append("<option>Intimate Bittersweet</option>");
            $('#' + mood2ID).append("<option>Suave / Sultry</option>");
            $('#' + mood2ID).append("<option>Dark Playful</option>");
            break;
        case "Sensual":
            $('#' + mood2ID).append("<option></option>");
            $('#' + mood2ID).append("<option>Soft Soulful</option>");
            $('#' + mood2ID).append("<option>Sensual Groove</option>");
            $('#' + mood2ID).append("<option>Intimate</option>");
            $('#' + mood2ID).append("<option>Dreamy Pulse</option>");
            break;
        case "Cool":
            $('#' + mood2ID).append("<option></option>");
            $('#' + mood2ID).append("<option>Cool Confidence</option>");
            $('#' + mood2ID).append("<option>Casual Groove</option>");
            $('#' + mood2ID).append("<option>Dark Groovy</option>");
            $('#' + mood2ID).append("<option>Wary / Defiant</option>");
            break;
        case "Gritty":
            $('#' + mood2ID).append("<option></option>");
            $('#' + mood2ID).append("<option>Depressed / Lonely</option>");
            $('#' + mood2ID).append("<option>Sober / Determined</option>");
            $('#' + mood2ID).append("<option>Gritty / Soulful</option>");
            $('#' + mood2ID).append("<option>Strumming Yearning</option>");
            break;
        case "Somber":
            $('#' + mood2ID).append("<option></option>");
            $('#' + mood2ID).append("<option>Dark Cosmic</option>");
            $('#' + mood2ID).append("<option>Enigmatic / Mysterious</option>");
            $('#' + mood2ID).append("<option>Creepy / Ominous</option>");
            $('#' + mood2ID).append("<option>Solemn / Spiritual</option>");
            break;
        case "Melancholy":
            $('#' + mood2ID).append("<option></option>");
            $('#' + mood2ID).append("<option>Mysterious / Dreamy</option>");
            $('#' + mood2ID).append("<option>Wistful / Forlorn</option>");
            $('#' + mood2ID).append("<option>Light Melancholy</option>");
            $('#' + mood2ID).append("<option>Sad / Soulful</option>");
            break;
        case "Serious":
            $('#' + mood2ID).append("<option></option>");
            $('#' + mood2ID).append("<option>Thrilling</option>");
            $('#' + mood2ID).append("<option>Melodramatic</option>");
            $('#' + mood2ID).append("<option>Serious / Cerebral</option>");
            $('#' + mood2ID).append("<option>Hypnotic Rhythm</option>");
            break;
        case "Brooding":
            $('#' + mood2ID).append("<option></option>");
            $('#' + mood2ID).append("<option>Energetic Melancholy</option>");
            $('#' + mood2ID).append("<option>Alienated / Brooding</option>");
            $('#' + mood2ID).append("<option>Evocative / Intriguing</option>");
            $('#' + mood2ID).append("<option>Dreamy Brooding</option>");
            break;
        case "Fiery":
            $('#' + mood2ID).append("<option></option>");
            $('#' + mood2ID).append("<option>Dark Sparkling Lyrical</option>");
            $('#' + mood2ID).append("<option>Fiery Groove</option>");
            $('#' + mood2ID).append("<option>Passionate Rhythm</option>");
            $('#' + mood2ID).append("<option>Energetic Abstract Groove</option>");
            break;
        case "Urgent":
            $('#' + mood2ID).append("<option></option>");
            $('#' + mood2ID).append("<option>Dark Urgent</option>");
            $('#' + mood2ID).append("<option>Dark Pop</option>");
            $('#' + mood2ID).append("<option>Dark Pop Intensity</option>");
            $('#' + mood2ID).append("<option>Energetic Anxious</option>");
            break;
        case "Defiant":
            $('#' + mood2ID).append("<option></option>");
            $('#' + mood2ID).append("<option>Heavy Brooding</option>");
            $('#' + mood2ID).append("<option>Hard Dark Excitement</option>");
            $('#' + mood2ID).append("<option>Hard Positive Excitement</option>");
            $('#' + mood2ID).append("<option>Attitude / Defiant</option>");
            break;
        case "Aggressive":
            $('#' + mood2ID).append("<option></option>");
            $('#' + mood2ID).append("<option>Dark Hard Beat</option>");
            $('#' + mood2ID).append("<option>Heavy Triumphant</option>");
            $('#' + mood2ID).append("<option>Chaotic / Intense</option>");
            $('#' + mood2ID).append("<option>Aggressive Power</option>");
            break;
        case "Rowdy":
            $('#' + mood2ID).append("<option></option>");
            $('#' + mood2ID).append("<option>Driving Dark Groove</option>");
            $('#' + mood2ID).append("<option>Wild / Rowdy</option>");
            $('#' + mood2ID).append("<option>Ramshackle / Rollicking</option>");
            $('#' + mood2ID).append("<option>Confident / Tough</option>");
            break;
        case "Excited":
            $('#' + mood2ID).append("<option></option>");
            $('#' + mood2ID).append("<option>Loud Celebratory</option>");
            $('#' + mood2ID).append("<option>Happy Excitement</option>");
            $('#' + mood2ID).append("<option>Upbeat Pop Groove</option>");
            $('#' + mood2ID).append("<option>Euphoric Energy</option>");
            break;
        case "Energizing":
            $('#' + mood2ID).append("<option></option>");
            $('#' + mood2ID).append("<option>Arousing Groove</option>");
            $('#' + mood2ID).append("<option>Heavy Beat</option>");
            $('#' + mood2ID).append("<option>Abstract Beat</option>");
            $('#' + mood2ID).append("<option>Edgy / Sexy</option>");
            break;
        case "Empowering":
            $('#' + mood2ID).append("<option></option>");
            $('#' + mood2ID).append("<option>Dramatic Emotion</option>");
            $('#' + mood2ID).append("<option>Powerful / Heroic</option>");
            $('#' + mood2ID).append("<option>Idealistic / Stirring</option>");
            $('#' + mood2ID).append("<option>Strong / Stable</option>");
            break;
        case "Stirring":
            $('#' + mood2ID).append("<option></option>");
            $('#' + mood2ID).append("<option>Jubilant / Soulful</option>");
            $('#' + mood2ID).append("<option>Triumphant / Rousing</option>");
            $('#' + mood2ID).append("<option>Focused Sparkling</option>");
            $('#' + mood2ID).append("<option>Invigorating / Joyous</option>");
            break;
        case "Lively":
            $('#' + mood2ID).append("<option></option>");
            $('#' + mood2ID).append("<option>Showy / Rousing</option>");
            $('#' + mood2ID).append("<option>Playful / Swingin'</option>");
            $('#' + mood2ID).append("<option>Exuberant / Festive</option>");
            $('#' + mood2ID).append("<option>Lusty / Jaunty</option>");
            break;
        case "Upbeat":
            $('#' + mood2ID).append("<option></option>");
            $('#' + mood2ID).append("<option>Happy / Soulful</option>");
            $('#' + mood2ID).append("<option>Carefree Pop</option>");
            $('#' + mood2ID).append("<option>Party / Fun</option>");
            $('#' + mood2ID).append("<option>Soulful / Easygoing</option>");
            break;
        case "Other":
            $('#' + mood2ID).append("<option></option>");
            $('#' + mood2ID).append("<option>Other</option>");
            break;
    }
});

// Change Tempo2 selection box when Tempo1 changed
$(document).on('change', '.sltTempo1', function () {
    // Get ID of selection element
    var tempo1ID = $(this).attr('id');
    // Get value selected
    var tempo1Value = $(this).val();
    // Get first digit of ID which represents track no.
    var trackNo = tempo1ID.substring(0, 1);
    // Tempo2 ID
    var tempo2ID = trackNo + "tempo2";
    // Empty contents of mood2 selection element
    $('#' + tempo2ID).empty();
    // populate mood2 selection element based on value in mood1 selection element
    switch (tempo1Value) {
        case "Slow Tempo":
            $("#" + tempo2ID).append("<option></option>");
            $("#" + tempo2ID).append("<option>Static</option>");
            $("#" + tempo2ID).append("<option>Very Slow</option>");
            $("#" + tempo2ID).append("<option>Slow</option>");
            break;
        case "Medium Tempo":
            $("#" + tempo2ID).append("<option></option>");
            $("#" + tempo2ID).append("<option>Medium Slow</option>");
            $("#" + tempo2ID).append("<option>Medium</option>");
            $("#" + tempo2ID).append("<option>Medium Fast</option>");
            break;
        case "Fast Tempo":
            $("#" + tempo2ID).append("<option></option>");
            $("#" + tempo2ID).append("<option>Fast</option>");
            $("#" + tempo2ID).append("<option>Very Fast</option>");
            break;
    }
});

//#############################
// Import new album to database
//#############################
// Cancel button on import album to database
$(document).on('click', '#btnImportCancel', function (event) {
    event.preventDefault();
    $("#frmAdd").empty();
    $("#divContent").load("./html/home.html");
    //window.history.back();

    //$("#divTrackListing").css("display", "none");
    //$("#divContent").css("display", "block");

    // Enable btnSync
    $("#btnSync").prop("disabled", false);
});

// Import button on import album to database
$(document).on('click', '#btnImportAlbum', function (event) {
    event.preventDefault();
    $("#btnImportAlbum").prop("disabled", true);
    // Add form validations. This validates the required attr in the html form
    $("#frmAdd").validate({});
    if ($("#frmAdd").valid()) {
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
        var albumTime = $("#inpAlbumTime").val();
        var genre = $('[name=sltGenre]').val();
        var noTracks = $("#inpCount").val();
        var coverArtUrl = $("#inpCoverArtURL").val();
        // Get todays date and convert
        var todayDate = new Date();
        var dateAdd = convertDate(todayDate);

        // Rename directories if changed on input
        ipcRenderer.send("rename_directory", [MUSIC_PATH, originalArtistName, originalAlbumName, artist, album, "add"]);

        populateTables();

        async function populateTables() {
            try {
                // ARTIST TABLE
                // Check if artist is already in database, if not add to artist table
                var sql = "SELECT artistID FROM artist WHERE artistName=?";
                var response = await dBase.get(sql, artist);

                // If artist name is not in database add to artist table
                if (response == null) {
                    var entry = `"${artist}","${artistOrigin}"`;
                    var sql = "INSERT INTO artist (artistName, origin) " + "VALUES (" + entry + ")";
                    var insert = await dBase.run(sql);
                }

                var sql = "SELECT artistID FROM artist WHERE artistName=?";
                var response = await dBase.get(sql, artist);
                var artistID = response.artistID;

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
                // Insert data into album table
                var entry = `"${genreID}","${artistID}","${album}","${releaseDate}","${albumTime}","${dateAdd}"`;
                var sql = "INSERT INTO album (genreID, artistID, albumName, releaseDate, albumTime, dateAdd) " + "VALUES(" + entry + ")";
                var insert = await dBase.run(sql);

                // TRACK TABLE
                // Get albumID from album table
                var sql = "SELECT albumID, albumName FROM album WHERE artistID=?";
                var rows = await dBase.all(sql, artistID)
                var albumID;

                rows.forEach((row) => {
                    if (row.albumName == album) {
                        albumID = row.albumID
                    }
                });

                // Zero variable for initial playCount
                var count = 0;
                // Set counters
                var counter1 = 1;
                noTracks = parseInt(noTracks);
                // Loop through each track and add to track table
                for (var i = 0; i < (noTracks); i++) {
                    var trackName = $("#" + counter1 + "trackName").val();
                    var fileName = $("#" + counter1 + "fileName").val();
                    var playTime = $("#" + counter1 + "pTime").val();
                    var mood1 = $("#" + counter1 + "mood1").val();
                    var mood2 = $("#" + counter1 + "mood2").val();
                    var tempo1 = $("#" + counter1 + "tempo1").val();
                    var tempo2 = $("#" + counter1 + "tempo2").val();
                    var genre2 = $("#" + counter1 + "genre2").val();
                    var genre3 = $("#" + counter1 + "genre3").val();
                    var favourite = 0;
                    var entry = `"${genreID}","${artistID}","${albumID}","${trackName}","${fileName}","${playTime}","${count}","${mood1}","${mood2}","${tempo1}","${tempo2}","${genre2}","${genre3}","${favourite}"`;
                    var sql = "INSERT INTO track (genreID, artistID, albumID, trackName, fileName, playTime, count, mood1, mood2, tempo1, tempo2, genre2, genre3, favourite) " + "VALUES(" + entry + ")";
                    var insert = await dBase.run(sql);
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
                    ipcRenderer.send("save_artwork", [artFilePath, resizedFilePath, coverArtUrl, genre]);
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

                // Show OK modal box to confirm album added to database
                $('#okModal').css('display', 'block');
                $('.modalHeader').empty();
                $('#okModalText').empty();
                $(".modalFooter").empty();
                $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
                $('#okModalText').append("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br>Album has been successfully added to " + global_AppName + ".<br>&nbsp<br>&nbsp</p >");
                var buttons = $("<button class='btnContent' id='btnOkImport'>OK</button>");
                $('.modalFooter').append(buttons);
                $("#btnOkImport").focus();
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
                $('#okModalText').append("<div class='modalIcon'><img src='./graphics/warning.png'></div><p>&nbsp<br><b>DATABASE ERROR</b> - album not added to " + global_AppName + ".<br>&nbsp<br>&nbsp</p >");
                var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
                $('.modalFooter').append(buttons);
                $("#btnOkModal").focus();
                $('.background').css('filter', 'blur(5px)');
            }
        }
    }
    else {
        console.log("Form not validated")
    }
    $("#btnImportAlbum").prop("disabled", false);
});

// Manual add artwork
// Click event from clicking on artwork in add album
$(document).on('click', '#addAlbum', function (event) {
    event.preventDefault();
    // Send message to main.js to open dialog box
    ipcRenderer.send("open_file_dialog", ["add_artwork", "Select Album Artwork Image File", "C:\\", "Select File", [{ name: 'Images', extensions: ['jpg'] }], "openFile"]);
});

// Response from selecting manual artwork browse dialog box
ipcRenderer.on("add_artwork", (event, data) => {
    var coverArt = data[0];
    $("#imgCoverArt").attr('src', coverArt);
    $("#inpCoverArtURL").val(coverArt);
});
