//#################################
// Sync Database to Music Directory
//#################################

var newArtist = "";
var newAlbum = "";
var artistMBID = "";
var coverArtSpot = "";
var importType = "";

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

    // Display newmusic.html page
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

//#########################################
// Onclick event for Manual button
//#########################################
$(document).on('click', '#btnManual', function (event) {
    event.preventDefault();
    // Check if online
    var connection = navigator.onLine;

    if (connection) {
        newArtist = $("#tblImportMusic tr.highlight").find('td:first').text();
        newAlbum = $("#tblImportMusic tr.highlight").find('td:nth-child(2)').text();
        if (!newArtist) {
            newArtist = $("#selectedArtist").text();
            newAlbum = $("#selectedAlbum").text();
        }
        // Get value of import radio buttons
        importType = $("input[name='albumType']:checked").val();

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
        $("#inpCount").val(files.length)
        var counter = 1;
        var form = $("#frmAdd")

        // Loop through each music file in album directory
        for (var i = 0; i < files.length; i++) {
            var audioSource = MUSIC_PATH + artist + "/" + album + "/" + files[i];
            var audio = $('<audio class="player" id="' + i + '" src="' + audioSource + '"></audio>');

            // Send track 1 file path to main'js to read ID3 metadata
            if (i == 0) {
                ipcRenderer.send("read_ID3tags", [audioSource])
            }

            $("#divAudioElements").append(audio);
            var fieldset = $("<fieldset><legend>Track " + counter + "</legend><label class='lblTrackName'>Name: </label><input required class='inpTrackName' id='" + counter + "trackName' name=" + counter + "trackName' type='text' size='79' value='' /><label class='lblFileName'>File Name:</label><input required class='inpFileName' id='" + counter + "fileName' name='" + counter + "fileName' type='text' size='79' value='' readonly /><label class='lblTrackTime'>Time:</label><input required class='inpTrackTime' id='" + counter + "pTime' name='" + counter + "pTime' type='text' size='8 value='' readonly /><br><label class='lblTrackName'>Mood 1:</label><select class='sltMood1' id='" + counter + "mood1' name=" + counter + "mood1'><option value=''></option><option value='Aggressive'>Aggressive</option><option value='Brooding'>Brooding</option><option value='Cool'>Cool</option><option value='Defiant'>Defiant</option><option value='Easygoing'>Easygoing</option><option value='Empowering'>Empowering</option><option value='Energizing'>Energizing</option><option value='Excited'>Excited</option><option value='Fiery'>Fiery</option><option value='Gritty'>Gritty</option><option value='Lively'>Lively</option><option value='Melancholy'>Melancholy</option><option value='Peaceful'>Peaceful</option><option value='Romantic'>Romantic</option><option value='Rowdy'>Rowdy</option><option value='Sensual'>Sensual</option><option value='Sentimental'>Sentimental</option><option value='Serious'>Serious</option><option value='Somber'>Somber</option><option value='Sophisticated'>Sophisticated</option><option value='Stirring'>Stirring</option><option value='Tender'>Tender</option><option value='Upbeat'>Upbeat</option><option value='Urgent'>Urgent</option><option value='Yearning'>Yearning</option><option value='Other'>Other</option></select><label class='lblFileName'>Mood 2: </label><select class='sltMood2' id='" + counter + "mood2' name=" + counter + "mood2'></select><br><label class='lblTrackName'>Tempo 1:</label><select class='sltTempo1' id='" + counter + "tempo1' name=" + counter + "tempo1'><option value=''></option><option value='Slow Tempo'>Slow Tempo</option><option value='Medium Tempo'>Medium Tempo</option><option value='Fast Tempo'>Fast Tempo</option></select><label class='lblFileName'>Tempo 2:</label><select class='sltTempo2' id='" + counter + "tempo2' name=" + counter + "tempo2'></select><br><label class='lblTrackName'>Genre 2:</label><input class='inpTrackGenre' id='" + counter + "genre2' name=" + counter + "genre2' type='text' size='40' value='' readonly/><label class='lblFileName'>Genre 3:</label><input class='inpTrackGenre' id='" + counter + "genre3' name=" + counter + "genre3' type='text' size='40' value='' readonly/></fieldset>");

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
    // Function go get meta data from Musicbrainz
    albumMetadata();
});

// Receive IPC response from reading first track file's ID3 metadata tags
ipcRenderer.on("from_read_ID3tags", (event, data) => {
    var metaData = data[0];
    var mainGenre = metaData.tags.genre
    if (mainGenre) {

        $("#mainGenre").html('<img width="15" height="15" src="./graphics/tick.png"/>');
        $("#mainGenre").append(" " + mainGenre)

        //$("#mainGenre").text(" " + mainGenre)
    }
    else {
        $("#mainGenre").html('<img width="15" height="15" src="./graphics/cross.png"/>');
        //$("#mainGenre").text(" No genre metadata found in audio file.")
    }
});

// Receive IPC search response Spotify for album and artist
ipcRenderer.on("from_spotify_search", (event, data) => {
    var spotifyResponse = data[0];
    var album = data[1];
    var albumType = "";
    var albumSpotID = "";
    album = album.toLowerCase();

    // Get value of import radio buttons
    importType = $("input[name='albumType']:checked").val();
    if (importType == "single") {
        albumType = "single"
    }
    else {
        albumType = "album"
    }
    
    // Find Spotify album ID to use to search for tracks
    $.each(spotifyResponse.albums.items, function (i, items) {
        var spotifyName = items.name.toLowerCase();
        if (spotifyName == album && items.album_type == albumType) {
            albumSpotID = items.id;
            return false;
        }       
    });

    // Send IPC to get albums tracks from Spotify
    if (albumSpotID == "") {
        $("#trackData").html('<img width="15" height="15" src="./graphics/cross.png"/>');
    }
    else {
        var query = albumSpotID + '/tracks';
        ipcRenderer.send("spotify_getTracks", [query])
    }
});

// Receive IPC response from Spotify for album tracks
ipcRenderer.on("from_getTracks", (event, data) => {
    var spotifyResponse = data[0];
    var tracksSpotID = "";

    // Get each track ID
    $.each(spotifyResponse.items, function (i, items) {
        tracksSpotID += items.id + ","
    });
    tracksSpotID = tracksSpotID.substring(0, tracksSpotID.length - 1);

    // Send IPC to get audio features from Spotify
    var query = tracksSpotID;
    if (tracksSpotID == "") {
        $("#trackData").html('<img width="15" height="15" src="./graphics/cross.png"/>');
    }
    else {
        var query = tracksSpotID;
        ipcRenderer.send("spotify_getAudioFeatures", [query])
    }
});

// Receive IPC response from Spotify for album tracks
ipcRenderer.on("from_getAudioFeatures", (event, data) => {
    var spotifyResponse = data[0];
    // Check if any data returned from spotify
    if (spotifyResponse.audio_features[0] != null) {
        // Declare variables
        var valence;
        var mood1;
        var spotifyNoTracks = spotifyResponse.audio_features.length;
        var noTracks = $("#inpCount").val();
        var counter;
        var baseX;
        var baseY;

        // Check if number of tracks from spotify matches database, if not alter noTracks to match spotify
        // Otherwise it throws an error trying to get data for a track that doesn't exist in spotify
        if (noTracks > spotifyNoTracks) {
            noTracks = spotifyNoTracks;
        }

        // Loop over each track and match track number to spotify array
        for (var i = 0; i < (noTracks); i++) {
            counter = i + 1;

            // Get the tracknumber from the leading numbers of the trackname
            var trackName = $("#" + counter + "trackName").val();
            var tNumber = trackName.substr(0, trackName.indexOf(' '));
            tNumber = tNumber.replace(/^0+/, '');
            // Track number
            var trackNumber = parseInt(tNumber);
            // Track numbers from spotify json start at zero
            trackNumber -= 1;

            try {
                // Get valence from json file
                var valenceFloat = spotifyResponse.audio_features[trackNumber].valence;
                valenceFloat *= 100;
                var valenceInt = Math.round(valenceFloat);

                // Get energy from json file
                var energyFloat = spotifyResponse.audio_features[trackNumber].energy;
                energyFloat *= 100;
                var energyInt = Math.round(energyFloat);

                // Get tempo from json file
                var tempoFloat = spotifyResponse.audio_features[trackNumber].tempo;
                var tempoInt = Math.round(tempoFloat);
                var tempo2;
            }
            catch{
                console.log("Error reading json file.")
                $("#trackData").html('<img width="15" height="15" src="./graphics/cross.png"/>');
                return false;
            }

            //##################################
            //## Populate json data into form ##
            //##################################
            // Populate Tempo 1 into form
            if (tempoInt <= 26) {
                $("#" + counter + "tempo1").val("Slow Tempo");
                tempo2 = "Static";
            }
            else if (tempoInt <= 53) {
                $("#" + counter + "tempo1").val("Slow Tempo");
                tempo2 = "Very Slow";
            }
            else if (tempoInt <= 79) {
                $("#" + counter + "tempo1").val("Slow Tempo");
                tempo2 = "Slow";
            }
            else if (tempoInt <= 96) {
                $("#" + counter + "tempo1").val("Medium Tempo");
                tempo2 = "Medium Slow";
            }
            else if (tempoInt <= 112) {
                $("#" + counter + "tempo1").val("Medium Tempo");
                tempo2 = "Medium";
            }
            else if (tempoInt <= 129) {
                $("#" + counter + "tempo1").val("Medium Tempo");
                tempo2 = "Medium Fast";
            }
            else if (tempoInt <= 149) {
                $("#" + counter + "tempo1").val("Fast Tempo");
                tempo2 = "Fast";
            }
            else if (tempoInt > 150) {
                $("#" + counter + "tempo1").val("Fast Tempo");
                tempo2 = "Very Fast";
            }
            else {
                $("#" + counter + "tempo1").val("");
                tempo2 = "";
            }
            var tempo1 = $("#" + counter + "tempo1").val();

            // Populate Tempo 2 value and options into selection box
            switch (tempo1) {
                case "Slow Tempo":
                    $("#" + counter + "tempo2").empty();
                    $("#" + counter + "tempo2").append("<option></option>");
                    $("#" + counter + "tempo2").append("<option>Static</option>");
                    $("#" + counter + "tempo2").append("<option>Very Slow</option>");
                    $("#" + counter + "tempo2").append("<option>Slow</option>");
                    $("#" + counter + "tempo2").val(tempo2);
                    break;
                case "Medium Tempo":
                    $("#" + counter + "tempo2").empty();
                    $("#" + counter + "tempo2").append("<option></option>");
                    $("#" + counter + "tempo2").append("<option>Medium Slow</option>");
                    $("#" + counter + "tempo2").append("<option>Medium</option>");
                    $("#" + counter + "tempo2").append("<option>Medium Fast</option>");
                    $("#" + counter + "tempo2").val(tempo2);
                    break;
                case "Fast Tempo":
                    $("#" + counter + "tempo2").empty();
                    $("#" + counter + "tempo2").append("<option></option>");
                    $("#" + counter + "tempo2").append("<option>Fast</option>");
                    $("#" + counter + "tempo2").append("<option>Very Fast</option>");
                    $("#" + counter + "tempo2").val(tempo2);
                    break;
            }

            // Mood 1
            // Create array of for values for mood1 grouped by valence
            if (valenceInt <= 19) {
                valence = ['Somber', 'Gritty', 'Serious', 'Brooding', 'Aggressive'];
                baseY = 0;
            }
            else if (valenceInt <= 39) {
                valence = ['Melancholy', 'Cool', 'Yearning', 'Urgent', 'Defiant'];
                baseY = 20;
            }
            else if (valenceInt <= 59) {
                valence = ['Sentimental', 'Sophisticated', 'Sensual', 'Fiery', 'Energizing'];
                baseY = 40;
            }
            else if (valenceInt <= 79) {
                valence = ['Tender', 'Romantic', 'Empowering', 'Stirring', 'Rowdy'];
                baseY = 60;
            }
            else {
                valence = ['Peaceful', 'Easygoing', 'Upbeat', 'Lively', 'Excited'];
                baseY = 80;
            }

            // Select mood1 array matching energy data from json file
            if (energyInt <= 19) {
                mood1 = valence[0];
                baseX = 0;
            }
            else if (energyInt <= 39) {
                mood1 = valence[1];
                baseX = 20;
            }
            else if (energyInt <= 59) {
                mood1 = valence[2];
                baseX = 40;
            }
            else if (energyInt <= 79) {
                mood1 = valence[3];
                baseX = 60;
            }
            else {
                mood1 = valence[4];
                baseX = 80;
            }

            // Populate mood1 value into form
            $("#" + counter + "mood1").val(mood1);

            // Calculate x and y values for mood2 matric, which is a 2 x 2 matrix
            var mood2X = (energyInt - baseX) / 20;
            var mood2Y = (valenceInt - baseY) / 20;

            // Populate mood2 selection options
            switch (mood1) {
                case "Peaceful":
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Pastoral / Serene</option>");
                    $("#" + counter + "mood2").append("<option>Delicate / Tranquil</option>");
                    $("#" + counter + "mood2").append("<option>Reverent / Healing</option>");
                    $("#" + counter + "mood2").append("<option>Quiet / Introspective</option>");
                    // Calm Positive
                    if (mood2X <= 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Pastoral / Serene");
                    }
                    // Energetic Positive
                    else if (mood2X > 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Delicate / Tranquil");
                    }
                    // Calm Dark
                    else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                        $("#" + counter + "mood2").val("Reverent / Healing");
                    }
                    // Energetic Dark
                    else {
                        $("#" + counter + "mood2").val("Quiet / Introspective");
                    }
                    break;
                case "Romantic":
                    $("#" + counter + "mood2").empty();
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Sweet / Sincere</option>");
                    $("#" + counter + "mood2").append("<option>Heartfelt Passion</option>");
                    $("#" + counter + "mood2").append("<option>Dramatic / Romantic</option>");
                    $("#" + counter + "mood2").append("<option>Lush / Romantic</option>");
                    if (mood2X <= 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Sweet / Sincere");
                    }
                    else if (mood2X > 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Heartfelt Passion");
                    }
                    else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                        $("#" + counter + "mood2").val("Dramatic / Romantic");
                    }
                    else {
                        $("#" + counter + "mood2").val("Lush / Romantic");
                    }
                    break;
                case "Sentimental":
                    $("#" + counter + "mood2").empty();
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Tender / Sincere</option>");
                    $("#" + counter + "mood2").append("<option>Gentle Bittersweet</option>");
                    $("#" + counter + "mood2").append("<option>Lyrical Sentimental</option>");
                    $("#" + counter + "mood2").append("<option>Cool Melancholy</option>");
                    if (mood2X <= 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Tender / Sincere");
                    }
                    else if (mood2X > 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Gentle Bittersweet");
                    }
                    else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                        $("#" + counter + "mood2").val("Lyrical Sentimental");
                    }
                    else {
                        $("#" + counter + "mood2").val("Cool Melancholy");
                    }
                    break;
                case "Tender":
                    $("#" + counter + "mood2").empty();
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Refined / Mannered</option>");
                    $("#" + counter + "mood2").append("<option>Awakening / Stately</option>");
                    $("#" + counter + "mood2").append("<option>Romantic / Lyrical</option>");
                    $("#" + counter + "mood2").append("<option>Light Groovy</option>");
                    if (mood2X <= 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Refined / Mannered");
                    }
                    else if (mood2X > 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Awakening / Stately");
                    }
                    else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                        $("#" + counter + "mood2").val("Romantic / Lyrical");
                    }
                    else {
                        $("#" + counter + "mood2").val("Light Groovy");
                    }
                    break;
                case "Easygoing":
                    $("#" + counter + "mood2").empty();
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Hopeful / Breezy</option>");
                    $("#" + counter + "mood2").append("<option>Cheerful / Playful</option>");
                    $("#" + counter + "mood2").append("<option>Friendly</option>");
                    $("#" + counter + "mood2").append("<option>Charming / Easygoing</option>");
                    if (mood2X <= 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Hopeful / Breezy");
                    }
                    else if (mood2X > 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Cheerful / Playful");
                    }
                    else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                        $("#" + counter + "mood2").val("Friendly");
                    }
                    else {
                        $("#" + counter + "mood2").val("Charming / Easygoing");
                    }
                    break;
                case "Yearning":
                    $("#" + counter + "mood2").empty();
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Bittersweet Pop</option>");
                    $("#" + counter + "mood2").append("<option>Energetic Yearning</option>");
                    $("#" + counter + "mood2").append("<option>Sensitive / Exploring</option>");
                    $("#" + counter + "mood2").append("<option>Energetic Dreamy</option>");
                    if (mood2X <= 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Bittersweet Pop");
                    }
                    else if (mood2X > 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Energetic Yearning");
                    }
                    else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                        $("#" + counter + "mood2").val("Sensitive / Exploring");
                    }
                    else {
                        $("#" + counter + "mood2").val("Energetic Dreamy");
                    }
                    break;
                case "Sophisticated":
                    $("#" + counter + "mood2").empty();
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Suave / Sultry</option>");
                    $("#" + counter + "mood2").append("<option>Dark Playful</option>");
                    $("#" + counter + "mood2").append("<option>Intimate Bittersweet</option>");
                    $("#" + counter + "mood2").append("<option>Smoky / Romantic</option>");
                    if (mood2X <= 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Suave / Sultry");
                    }
                    else if (mood2X > 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Dark Playful");
                    }
                    else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                        $("#" + counter + "mood2").val("Intimate Bittersweet");
                    }
                    else {
                        $("#" + counter + "mood2").val("Smoky / Romantic");
                    }
                    break;
                case "Sensual":
                    $("#" + counter + "mood2").empty();
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Soft Soulful</option>");
                    $("#" + counter + "mood2").append("<option>Sensual Groove</option>");
                    $("#" + counter + "mood2").append("<option>Dreamy Pulse</option>");
                    $("#" + counter + "mood2").append("<option>Intimate</option>");
                    if (mood2X <= 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Soft Soulful");
                    }
                    else if (mood2X > 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Sensual Groove");
                    }
                    else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                        $("#" + counter + "mood2").val("Dreamy Pulse");
                    }
                    else {
                        $("#" + counter + "mood2").val("Intimate");
                    }
                    break;
                case "Cool":
                    $("#" + counter + "mood2").empty();
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Casual Groove</option>");
                    $("#" + counter + "mood2").append("<option>Wary / Defiant</option>");
                    $("#" + counter + "mood2").append("<option>Cool Confidence</option>");
                    $("#" + counter + "mood2").append("<option>Dark Groovy</option>");
                    if (mood2X <= 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Casual Groove");
                    }
                    else if (mood2X > 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Wary / Defiant");
                    }
                    else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                        $("#" + counter + "mood2").val("Cool Confidence");
                    }
                    else {
                        $("#" + counter + "mood2").val("Dark Groovy");
                    }
                    break;
                case "Gritty":
                    $("#" + counter + "mood2").empty();
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Sober / Determined</option>");
                    $("#" + counter + "mood2").append("<option>Strumming Yearning</option>");
                    $("#" + counter + "mood2").append("<option>Depressed / Lonely</option>");
                    $("#" + counter + "mood2").append("<option>Gritty / Soulful</option>");
                    if (mood2X <= 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Sober / Determined");
                    }
                    else if (mood2X > 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Strumming Yearning");
                    }
                    else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                        $("#" + counter + "mood2").val("Depressed / Lonely");
                    }
                    else {
                        $("#" + counter + "mood2").val("Gritty / Soulful");
                    }
                    break;
                case "Somber":
                    $("#" + counter + "mood2").empty();
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Solemn / Spiritual</option>");
                    $("#" + counter + "mood2").append("<option>Enigmatic / Mysterious</option>");
                    $("#" + counter + "mood2").append("<option>Dark Cosmic</option>");
                    $("#" + counter + "mood2").append("<option>Creepy / Ominous</option>");
                    if (mood2X <= 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Solemn / Spiritual");
                    }
                    else if (mood2X > 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Enigmatic / Mysterious");
                    }
                    else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                        $("#" + counter + "mood2").val("Dark Cosmic");
                    }
                    else {
                        $("#" + counter + "mood2").val("Creepy / Ominous");
                    }
                    break;
                case "Melancholy":
                    $("#" + counter + "mood2").empty();
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Mysterious / Dreamy</option>");
                    $("#" + counter + "mood2").append("<option>Light Melancholy</option>");
                    $("#" + counter + "mood2").append("<option>Wistful / Forlorn</option>");
                    $("#" + counter + "mood2").append("<option>Sad / Soulful</option>");
                    if (mood2X <= 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Mysterious / Dreamy");
                    }
                    else if (mood2X > 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Light Melancholy");
                    }
                    else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                        $("#" + counter + "mood2").val("Wistful / Forlorn");
                    }
                    else {
                        $("#" + counter + "mood2").val("Sad / Soulful");
                    }
                    break;
                case "Serious":
                    $("#" + counter + "mood2").empty();
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Melodramatic</option>");
                    $("#" + counter + "mood2").append("<option>Hypnotic Rhythm</option>");
                    $("#" + counter + "mood2").append("<option>Serious / Cerebral</option>");
                    $("#" + counter + "mood2").append("<option>Thrilling</option>");
                    if (mood2X <= 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Melodramatic");
                    }
                    else if (mood2X > 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Hypnotic Rhythm");
                    }
                    else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                        $("#" + counter + "mood2").val("Serious / Cerebral");
                    }
                    else {
                        $("#" + counter + "mood2").val("Thrilling");
                    }
                    break;
                case "Brooding":
                    $("#" + counter + "mood2").empty();
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Evocative / Intriguing</option>");
                    $("#" + counter + "mood2").append("<option>Energetic Melancholy</option>");
                    $("#" + counter + "mood2").append("<option>Dreamy Brooding</option>");
                    $("#" + counter + "mood2").append("<option>Alienated / Brooding</option>");
                    if (mood2X <= 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Evocative / Intriguing");
                    }
                    else if (mood2X > 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Energetic Melancholy");
                    }
                    else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                        $("#" + counter + "mood2").val("Dreamy Brooding");
                    }
                    else {
                        $("#" + counter + "mood2").val("Alienated / Brooding");
                    }
                    break;
                case "Fiery":
                    $("#" + counter + "mood2").empty();
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Dark Sparkling Lyrical</option>");
                    $("#" + counter + "mood2").append("<option>Fiery Groove</option>");
                    $("#" + counter + "mood2").append("<option>Passionate Rhythm</option>");
                    $("#" + counter + "mood2").append("<option>Energetic Abstract Groove</option>");
                    if (mood2X <= 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Dark Sparkling Lyrical");
                    }
                    else if (mood2X > 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Fiery Groove");
                    }
                    else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                        $("#" + counter + "mood2").val("Passionate Rhythm");
                    }
                    else {
                        $("#" + counter + "mood2").val("Energetic Abstract Groove");
                    }
                    break;
                case "Urgent":
                    $("#" + counter + "mood2").empty();
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Dark Pop</option>");
                    $("#" + counter + "mood2").append("<option>Dark Pop Intensity</option>");
                    $("#" + counter + "mood2").append("<option>Dark Urgent</option>");
                    $("#" + counter + "mood2").append("<option>Energetic Anxious</option>");
                    if (mood2X <= 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Dark Pop");
                    }
                    else if (mood2X > 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Dark Pop Intensity");
                    }
                    else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                        $("#" + counter + "mood2").val("Dark Urgent");
                    }
                    else {
                        $("#" + counter + "mood2").val("Energetic Anxious");
                    }
                    break;
                case "Defiant":
                    $("#" + counter + "mood2").empty();
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Heavy Brooding</option>");
                    $("#" + counter + "mood2").append("<option>Hard Positive Excitement</option>");
                    $("#" + counter + "mood2").append("<option>Attitude / Defiant</option>");
                    $("#" + counter + "mood2").append("<option>Hard Dark Excitement</option>");
                    if (mood2X <= 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Heavy Brooding");
                    }
                    else if (mood2X > 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Hard Positive Excitement");
                    }
                    else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                        $("#" + counter + "mood2").val("Attitude / Defiant");
                    }
                    else {
                        $("#" + counter + "mood2").val("Hard Dark Excitement");
                    }
                    break;
                case "Aggressive":
                    $("#" + counter + "mood2").empty();
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Dark Hard Beat</option>");
                    $("#" + counter + "mood2").append("<option>Heavy Triumphant</option>");
                    $("#" + counter + "mood2").append("<option>Chaotic / Intense</option>");
                    $("#" + counter + "mood2").append("<option>Aggressive Power</option>");
                    if (mood2X <= 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Dark Hard Beat");
                    }
                    else if (mood2X > 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Heavy Triumphant");
                    }
                    else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                        $("#" + counter + "mood2").val("Chaotic / Intense");
                    }
                    else {
                        $("#" + counter + "mood2").val("Aggressive Power");
                    }
                    break;
                case "Rowdy":
                    $("#" + counter + "mood2").empty();
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Ramshackle / Rollicking</option>");
                    $("#" + counter + "mood2").append("<option>Wild / Rowdy</option>");
                    $("#" + counter + "mood2").append("<option>Confident / Tough</option>");
                    $("#" + counter + "mood2").append("<option>Driving Dark Groove</option>");
                    if (mood2X <= 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Ramshackle / Rollicking");
                    }
                    else if (mood2X > 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Wild / Rowdy");
                    }
                    else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                        $("#" + counter + "mood2").val("Confident / Tough");
                    }
                    else {
                        $("#" + counter + "mood2").val("Driving Dark Groove");
                    }
                    break;
                case "Excited":
                    $("#" + counter + "mood2").empty();
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Loud Celebratory</option>");
                    $("#" + counter + "mood2").append("<option>Euphoric Energy</option>");
                    $("#" + counter + "mood2").append("<option>Upbeat Pop Groove</option>");
                    $("#" + counter + "mood2").append("<option>Happy Excitement</option>");
                    if (mood2X <= 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Loud Celebratory");
                    }
                    else if (mood2X > 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Euphoric Energy");
                    }
                    else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                        $("#" + counter + "mood2").val("Upbeat Pop Groove");
                    }
                    else {
                        $("#" + counter + "mood2").val("Happy Excitement");
                    }
                    break;
                case "Energizing":
                    $("#" + counter + "mood2").empty();
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Arousing Groove</option>");
                    $("#" + counter + "mood2").append("<option>Heavy Beat</option>");
                    $("#" + counter + "mood2").append("<option>Edgy / Sexy</option>");
                    $("#" + counter + "mood2").append("<option>Abstract Beat</option>");
                    if (mood2X <= 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Arousing Groove");
                    }
                    else if (mood2X > 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Heavy Beat");
                    }
                    else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                        $("#" + counter + "mood2").val("Edgy / Sexy");
                    }
                    else {
                        $("#" + counter + "mood2").val("Abstract Beat");
                    }
                    break;
                case "Empowering":
                    $("#" + counter + "mood2").empty();
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Strong / Stable</option>");
                    $("#" + counter + "mood2").append("<option>Powerful / Heroic</option>");
                    $("#" + counter + "mood2").append("<option>Dramatic Emotion</option>");
                    $("#" + counter + "mood2").append("<option>Idealistic / Stirring</option>");
                    if (mood2X <= 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Strong / Stable");
                    }
                    else if (mood2X > 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Powerful / Heroic");
                    }
                    else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                        $("#" + counter + "mood2").val("Dramatic Emotion");
                    }
                    else {
                        $("#" + counter + "mood2").val("Idealistic / Stirring");
                    }
                    break;
                case "Stirring":
                    $("#" + counter + "mood2").empty();
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Invigorating / Joyous</option>");
                    $("#" + counter + "mood2").append("<option>Jubilant / Soulful</option>");
                    $("#" + counter + "mood2").append("<option>Focused Sparkling</option>");
                    $("#" + counter + "mood2").append("<option>Triumphant / Rousing</option>");
                    if (mood2X <= 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Invigorating / Joyous");
                    }
                    else if (mood2X > 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Jubilant / Soulful");
                    }
                    else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                        $("#" + counter + "mood2").val("Focused Sparkling");
                    }
                    else {
                        $("#" + counter + "mood2").val("Triumphant / Rousing");
                    }
                    break;
                case "Lively":
                    $("#" + counter + "mood2").empty();
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Showy / Rousing</option>");
                    $("#" + counter + "mood2").append("<option>Lusty / Jaunty</option>");
                    $("#" + counter + "mood2").append("<option>Playful / Swinging</option>");
                    $("#" + counter + "mood2").append("<option>Exuberant / Festive</option>");
                    if (mood2X <= 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Showy / Rousing");
                    }
                    else if (mood2X > 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Lusty / Jaunty");
                    }
                    else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                        $("#" + counter + "mood2").val("Playful / Swinging");
                    }
                    else {
                        $("#" + counter + "mood2").val("Exuberant / Festive");
                    }
                    break;
                case "Upbeat":
                    $("#" + counter + "mood2").empty();
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Carefree Pop</option>");
                    $("#" + counter + "mood2").append("<option>Party / Fun</option>");
                    $("#" + counter + "mood2").append("<option>Soulful / Easygoing</option>");
                    $("#" + counter + "mood2").append("<option>Happy / Soulful</option>");
                    if (mood2X <= 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Carefree Pop");
                    }
                    else if (mood2X > 0.5 && mood2Y > 0.5) {
                        $("#" + counter + "mood2").val("Party / Fun");
                    }
                    else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                        $("#" + counter + "mood2").val("Soulful / Easygoing");
                    }
                    else {
                        $("#" + counter + "mood2").val("Happy / Soulful");
                    }
                    break;
                case "Other":
                    $("#" + counter + "mood2").empty();
                    $("#" + counter + "mood2").append("<option></option>");
                    $("#" + counter + "mood2").append("<option>Other</option>");
                    break;
            }
        }
        $("#trackData").html('<img width="15" height="15" src="./graphics/tick.png"/>');
    }
    else {
        $("#trackData").html('<img width="15" height="15" src="./graphics/cross.png"/>');
    }
});

function albumMetadata() {
    // Set variables
    var artist = $("#selectedArtist").text();
    var album = $("#selectedAlbum").text();
    var albumCheck = $("#selectedAlbum").text();

    // Replace encoded &amp with &
    artist = artist.replace(/&amp;/g, '&');
    album = album.replace(/&amp;/g, '&');

    // Send IPC to search Spotify for album and artist
    var query = 'album:' + album + ' artist:' + artist + '&type=album';

    ipcRenderer.send("spotify_search", [query, album])

    // Call ajax function artistIDQuery
    queryArtistID(newArtist).done(artistIDProcessData);

    // Function to send ajax xml query to Musicbrainz server
    function queryArtistID(query) {
        var queryArtist = query;
        // Artist serach url
        var url = "https://musicbrainz.org/ws/2/artist/?query=artist:" + queryArtist;
        // Encode url
        var encodedUrl = encodeURI(url);
        return $.ajax({
            url: encodedUrl
        });
    }

    // Function to process data from received xml file searching for artistID
    function artistIDProcessData(xml) {
        var releaseGroupID = "";

        $(xml).find('artist').each(function () {
            var $artist = $(this);
            var matchScore = $artist.attr('ns2:score')
            // Find the 100% artist match
            if (matchScore == "100") {
                artistMBID = $artist.attr("id");
            }
        });

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
                    url = "https://musicbrainz.org/ws/2/release-group?artist=" + queryArtistID + "&limit=100&type=single"
                }
                else {
                    url = "https://musicbrainz.org/ws/2/release-group?artist=" + queryArtistID + "&limit=100&type=album|ep"
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
                        // Remove any commas to aid matching
                        title = title.replace(',', '');
                        var date = $release.find('first-release-date').text();
                        albumCheck = albumCheck.toLowerCase();
                        // Remove any commas to aid matching
                        albumCheck = albumCheck.replace(',', '');
                        if (title == albumCheck) {
                            releaseFound = true;
                            releaseGroupID = $release.attr('id')
                            var albumDate = date.substring(0, 4);
                            $("#inpReleaseDate").val(albumDate);
                            $("#albumData").html('<img width="15" height="15" src="./graphics/tick.png"/>');

                            // Get cover artwork
                            // Call ajax function releaseIDQuery
                            releaseIDQuery(releaseGroupID).done(dataReleaseIDProcess);

                            // Function to send ajax xml query to Musicbrainz server
                            function releaseIDQuery(query) {
                                var queryreleaseGroupID = query;
                                // Artist serach url
                                var url = "https://musicbrainz.org/ws/2/release?release-group=" + queryreleaseGroupID
                                return $.ajax({
                                    url: url
                                });
                            }

                            // Function to process data from received xml file searching for releaseIDQuery
                            function dataReleaseIDProcess(xml) {
                                var frontFound = false;
                                var backFound = false;
                                newAlbum = newAlbum.toLowerCase();
                                // Remove any commas to aid matching
                                albumCheck = albumCheck.replace(',', '');
                                $(xml).find('release').each(function () {
                                    var $release = $(this);
                                    var releaseID = $release.attr('id');
                                    var title = $release.find('title').text().toLowerCase();
                                    // Remove any commas to aid matching
                                    title = title.replace(',', '');
                                    var front = $release.find('front').text();
                                    var back = $release.find('back').text();
                                    if (title == newAlbum) {
                                        // Back cover art
                                        if (back == "true" && backFound == false) {
                                            backFound = true;
                                            var backArt = "https://coverartarchive.org/release/" + releaseID + "/back-500"
                                            $("#inpBackArtURL").val(backArt);
                                            $("#backArtwork").html('<img width="15" height="15" src="./graphics/tick.png"/>');
                                        }

                                        if (front == "true" && frontFound == false) {
                                            // Front cover art
                                            frontFound = true;
                                            var coverArt = "https://coverartarchive.org/release/" + releaseID + "/front-500"

                                            $("#imgCoverArt").attr('src', coverArt);
                                            $("#inpCoverArtURL").val(coverArt);

                                            var coverArtUrl = $("#inpCoverArtURL").val();
                                            var artFilePath = MUSIC_PATH + artist + "/" + album + "/tempArt.jpg"
                                            $("#frontArtwork").html('<img width="15" height="15" src="./graphics/tick.png"/>');
                                            // Send message to main.js to save and tempArt image
                                            ipcRenderer.send("save_temp_artwork", [artFilePath, coverArtUrl]);
                                        }
                                    }
                                });
                                if (frontFound == false) {
                                    $("#frontArtwork").html('<img width="15" height="15" src="./graphics/cross.png"/>');
                                }
                                if (backFound == false) {
                                    $("#backArtwork").html('<img width="15" height="15" src="./graphics/cross.png"/>');
                                }
                            }

                            // Call ajax function releaseQueryGenre
                            releaseQueryGenre(releaseGroupID).done(dataGenreProcess);

                            // Function to send ajax xml query to Musicbrainz server
                            function releaseQueryGenre(query) {
                                var queryreleaseGroupID = query;
                                // Artist serach url
                                var url = "https://musicbrainz.org/ws/2/release-group/" + queryreleaseGroupID + "?inc=genres"
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
                                else {
                                    $("#genreTags").html('<img width="15" height="15" src="./graphics/cross.png"/>');
                                }
                                //$("#genreTags").text(genreTags)
                            }
                            return false;
                        }
                    });
                    if (releaseFound == false) {
                        $("#albumData").html('<img width="15" height="15" src="./graphics/cross.png"/>');
                        $("#frontArtwork").html('<img width="15" height="15" src="./graphics/cross.png"/>');
                        $("#backArtwork").html('<img width="15" height="15" src="./graphics/cross.png"/>');
                        $("#genreTags").html('<img width="15" height="15" src="./graphics/cross.png"/>');
                    }
                }
                else {
                    // If count == 0 then no data found
                    $("#albumData").html('<img width="15" height="15" src="./graphics/cross.png"/>');
                    $("#frontArtwork").html('<img width="15" height="15" src="./graphics/cross.png"/>');
                    $("#backArtwork").html('<img width="15" height="15" src="./graphics/cross.png"/>');
                    $("#genreTags").html('<img width="15" height="15" src="./graphics/cross.png"/>');
                }
            }
            // Call ajax function originQueryArtist
            originQueryArtist(artistMBID).done(dataOriginProcess);

            // Function to send ajax xml query to Musicbrainz server
            function originQueryArtist(query) {
                var queryArtistID = query;
                // Artist serach url
                var url = "https://musicbrainz.org/ws/2/artist/" + queryArtistID
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
            }
        }
    }

    var counter = 1;
    for (var i = 0; i < files.length; i++) {
        // Check if file ext is flac or mp3/m4a/wav
        var check = files[i].substr(-4);
        if (check == "flac") {
            var tName = files[i].slice(0, -5);
        }
        else {
            var tName = files[i].slice(0, -4);
        }

        // Check filename format if downloaded from Amazon in format "01 - SongName" and remove the dash after the track number
        var format = tName.substring(2, 5);
        if (format == " - ") {
            // Slice tName around the " - " in order to remove the dash
            tName = tName.slice(0, 2) + tName.slice(4, tName.length);
        }
        // Trackname
        $("#" + counter + "trackName").val(tName);
        // Filename
        $("#" + counter + "fileName").val(files[i]);

        counter += 1;
    }
}

//#########################
//### GENRE 2 SELECTION ###
//#########################
// Change Genre2 selection box when Genre changed
$(document).on('change', '#sltGenre1', function () {
    // Get value selected
    var genreName = $(this).val();
    if (genreName != "") {
        $("#lblGenre2").css('display', 'inline-block');
        $("#inpGenre2").css('display', 'inline-block');
        $('#inpGenre2').val("");
        $('#listGenre2').empty();

        populateGenre2()
    }
    else {
        $("#lblGenre2").css('display', 'none');
        $("#inpGenre2").css('display', 'none');
        $('#inpGenre2').val("");
        $('#listGenre2').empty();
        $("#lblGenre3").css('display', 'none');
        $("#inpGenre3").css('display', 'none');
        $('#inpGenre3').val("");
        $('#listGenre3').empty();
        // Clear each track genre2 and genre3
        var counter = 1;
        for (var i = 0; i < files.length; i++) {
            // Genre2
            $("#" + counter + "genre2").val('');
            // Genre3
            $("#" + counter + "genre3").val('');
            counter += 1;
        }
    }

    // Populate list values of genre2 based on main genre
    async function populateGenre2() {
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
        $('#inpGenre2').empty();
        // Populate genre2 selection element based on value in genre selection element
        switch (genreName) {
            case "Alternative & Punk":
                var fixedGenre2 = ['Alternative', 'Alternative Folk', 'Brit Rock', 'Garage Rock Revival', 'New Wave Pop', 'Punk'];
                // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
                var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
                // Populate inpubox list
                for (const item of genre2) {
                    $('#listGenre2').append($("<option>").attr('value', item));
                }
                break;
            case "Blues":
                var fixedGenre2 = ['Acoustic Blues', 'Blues Rock', 'Electric Blues', 'General Blues'];
                // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
                var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
                // Populate inpubox list
                for (const item of genre2) {
                    $('#listGenre2').append($("<option>").attr('value', item));
                }
                break;
            case "Classical":
                var fixedGenre2 = ['Baroque', 'Chamber Music', 'Classical Guitar', 'Contemporary', 'General Classical', 'Opera'];
                // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
                var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
                // Populate inpubox list
                for (const item of genre2) {
                    $('#listGenre2').append($("<option>").attr('value', item));
                }
                break;
            case "Comedy":
                var fixedGenre2 = ['Comedy'];
                // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
                var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
                // Populate inpubox list
                for (const item of genre2) {
                    $('#listGenre2').append($("<option>").attr('value', item));
                }
                break;
            case "Country":
                var fixedGenre2 = ['Classic Country', 'General Country', 'Traditional Country'];
                // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
                var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
                // Populate inpubox list
                for (const item of genre2) {
                    $('#listGenre2').append($("<option>").attr('value', item));
                }
                break;
            case "Dance":
                var fixedGenre2 = ['Dance & Club', 'General Dance'];
                // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
                var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
                // Populate inpubox list
                for (const item of genre2) {
                    $('#listGenre2').append($("<option>").attr('value', item));
                }
                break;
            case "Electronica":
                var fixedGenre2 = ['Disco', 'Downtempo, Lounge & Ambient', 'Electronic', 'Electronica Fusion', 'Electronica Mainstream', 'House', 'Techno', 'Trance'];
                // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
                var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
                // Populate inpubox list
                for (const item of genre2) {
                    $('#listGenre2').append($("<option>").attr('value', item));
                }
                break;
            case "Folk":
                var fixedGenre2 = ['Alternative Folk', 'Celtic', 'Contemporary Folk', 'Folk Rock'];
                // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
                var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
                // Populate inpubox list
                for (const item of genre2) {
                    $('#listGenre2').append($("<option>").attr('value', item));
                }
                break;
            case "Hip-Hop/Rap":
                var fixedGenre2 = ['General Hip Hop', 'General Rap', 'Old School Hip Hop'];
                // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
                var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
                // Populate inpubox list
                for (const item of genre2) {
                    $('#listGenre2').append($("<option>").attr('value', item));
                }
                break;
            case "Holiday":
                var fixedGenre2 = ['Christmas'];
                // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
                var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
                // Populate inpubox list
                for (const item of genre2) {
                    $('#listGenre2').append($("<option>").attr('value', item));
                }
                break;
            case "Indie":
                var fixedGenre2 = ['Indie Rock', 'Indie Pop'];
                // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
                var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
                // Populate inpubox list
                for (const item of genre2) {
                    $('#listGenre2').append($("<option>").attr('value', item));
                }
                break;
            case "Jazz":
                var fixedGenre2 = ['Bebop & Modern Jazz', 'Big Band & Swing', 'Contemporary Jazz & Fusion', 'Early Jazz'];
                // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
                var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
                // Populate inpubox list
                for (const item of genre2) {
                    $('#listGenre2').append($("<option>").attr('value', item));
                }
                break;
            case "Metal":
                var fixedGenre2 = ['General Metal', 'Hardcore Metal'];
                // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
                var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
                // Populate inpubox list
                for (const item of genre2) {
                    $('#listGenre2').append($("<option>").attr('value', item));
                }
                break;
            case "Pop":
                var fixedGenre2 = ['Classic Pop Vocals', 'European Pop', 'Latin Pop', 'Western Pop'];
                // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
                var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
                // Populate inpubox list
                for (const item of genre2) {
                    $('#listGenre2').append($("<option>").attr('value', item));
                }
                break;
            case "Reggae":
                var fixedGenre2 = ['General Reggae', 'Ska/Rock Steady'];
                // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
                var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
                // Populate inpubox list
                for (const item of genre2) {
                    $('#listGenre2').append($("<option>").attr('value', item));
                }
                break;
            case "Rock":
                var fixedGenre2 = ["Alternative", "Alternative Roots", "Classic Rock", "Hard Rock", "Mainstream Rock", "Psychedelic Rock", "Rock & Roll", "Soft Rock"];
                // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
                var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
                // Populate inpubox list
                for (const item of genre2) {
                    $('#listGenre2').append($("<option>").attr('value', item));
                }
            case "Soul":
                var fixedGenre2 = ['Classic R&B/Soul', 'General R&B/Soul'];
                // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
                var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
                // Populate inpubox list
                for (const item of genre2) {
                    $('#listGenre2').append($("<option>").attr('value', item));
                }
                break;
            case "Soundtrack":
                var fixedGenre2 = ['Original Film/TV Music'];
                // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
                var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
                // Populate inpubox list
                for (const item of genre2) {
                    $('#listGenre2').append($("<option>").attr('value', item));
                }
                break;     
            case "Traditional":
                var fixedGenre2 = ['Easy Listening', 'European Traditional', 'Religious'];
                // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
                var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
                // Populate inpubox list
                for (const item of genre2) {
                    $('#listGenre2').append($("<option>").attr('value', item));
                }
                break; 
            case "Urban":
                var fixedGenre2 = ['Contemporary Jazz & Fusion', 'Contemporary R&B/Soul', 'Western Hip-Hop/Rap'];
                // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
                var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
                // Populate inpubox list
                for (const item of genre2) {
                    $('#listGenre2').append($("<option>").attr('value', item));
                }
                break;                 
            case "World":
                var fixedGenre2 = ['African Traditional', 'European Traditional', 'Latin Traditional', 'New Age', 'Other Traditions'];
                // Combine and remove duplicates from fixedGenre2 and database genre2 into 1 array
                var genre2 = fixedGenre2.concat(dbGenre2.filter((item) => fixedGenre2.indexOf(item) < 0))
                // Populate inpubox list
                for (const item of genre2) {
                    $('#listGenre2').append($("<option>").attr('value', item));
                }
                break;
        }
        
    }
});

//#########################
//### GENRE 3 SELECTION ###
//#########################
// Change Genre3 selection box when Genre2 changed
$(document).on('change', '#inpGenre2', function () {
    // Change each track genre2 when changed
    var counter = 1;
    var genre2 = $('#inpGenre2').val();
    for (var i = 0; i < files.length; i++) {
        // Genre2
        $("#" + counter + "genre2").val(genre2);
        counter += 1;
    }

    var genreName = $(this).val();
    if (genreName != "") {
        $("#lblGenre3").css('display', 'inline-block');
        $("#inpGenre3").css('display', 'inline-block');
        $('#inpGenre3').val("");
        $('#listGenre3').empty();

        populateGenre3()
    }
    else {
        $("#lblGenre3").css('display', 'none');
        $("#inpGenre3").css('display', 'none');
        $('#inpGenre3').val("");
        $('#listGenre3').empty();
        // Clear each track genre3
        var counter = 1;
        for (var i = 0; i < files.length; i++) {
            // Genre3
            $("#" + counter + "genre3").val('');
            counter += 1;
        }
    }

    // Populate list values of genre2 based on main genre
    async function populateGenre3() {
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

        // Empty contents of genre3 selection element
        $('#inpGenre3').empty();
        // Populate genre3 selection element based on value in genre2 selection element
        switch (genre2) {
            case "Alternative":
                var fixedGenre3 = ['Adult Alternative Rock', 'Alternative Dance', 'Alternative Pop', 'Alternative Rock', 'Alternative Singer-Songwriter', 'Grunge', 'Rockabilly Revival'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "Alternative Folk":
                var fixedGenre3 = ['Contemporary U.S. Folk'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "Brit Rock":
                var fixedGenre3 = ['Brit Pop'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "Garage Rock Revival":
                var fixedGenre3 = ['Lo-Fi/Garage'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "New Wave Pop":
                var fixedGenre3 = ['Synth Pop'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "Punk":
                var fixedGenre3 = ['General Punk', 'Hardcore Punk', 'Old School Punk', 'Pop Punk', 'Post - Punk', 'Straight Edge Punk'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "Acoustic Blues":
                var fixedGenre3 = ['General Acoustic Blues', 'Harmonica Blues'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "Blues Rock":
                var fixedGenre3 = ['British Blues Rock', 'Chicago Blues', 'Texas Blues'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;   
            case "Electric Blues":
                var fixedGenre3 = ['Chicago Blues', 'General Electric Blues', 'Texas Blues'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;  
            case "General Blues":
                var fixedGenre3 = ['Contemporary Blues', 'Country Blues'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;  
            case "Christmas":
                var fixedGenre3 = [];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;    
            case "Baroque":
                var fixedGenre3 = [];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;   
            case "Chamber Music":
                var fixedGenre3 = [];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break; 
            case "Classical Guitar":
                var fixedGenre3 = [];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "Contemporary":
                var fixedGenre3 = ['Piano', 'Strings'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "General Classical":
                var fixedGenre3 = ['Piano', 'Strings'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "Opera":
                var fixedGenre3 = ['Romantic Era', 'Reniassance Era'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "Comedy":
                var fixedGenre3 = [];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "Classic Country":
                var fixedGenre3 = ['Bluegrass', 'Outlaw Country', 'Rockabiliy'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "General Country":
                var fixedGenre3 = ['Alternative Country', 'Americana', 'Contemporary Country', 'Country Pop', 'Country Rock'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "Traditional Country":
                var fixedGenre3 = ['Americana', 'Bluegrass', 'Country Blues'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "Dance & Club":
                var fixedGenre3 = ['Acid House', 'Big Beat', 'Club Dance', 'Hi-NRG', "Jungle/Drum 'n' Bass"];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "General Dance":
                var fixedGenre3 = ['Disco', 'Rave Music'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "Disco":
                var fixedGenre3 = [];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "Downtempo, Lounge & Ambient":
                var fixedGenre3 = ['Ambient Electronica', 'General Downtempo', 'Neo-Lounge', 'Trip Hop'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "Electronic":
                var fixedGenre3 = ['General Electronic', 'Minimalist Experimental'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "Electronica Fusion":
                var fixedGenre3 = ['Ethno-Lounge Electronica'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "Electronica Mainstream":
                var fixedGenre3 = ['Ambient Electronica', 'Big Beat', 'Pop Electronica'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "House":
                var fixedGenre3 = ['Deep House', 'Euro House', 'General House', 'Happy House', 'Progressive House', 'Tech House', 'U.K. Garage'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "Techno":
                var fixedGenre3 = ['Classic Techno', 'Dark Techno/Darkwave', 'General Techno', 'Hardcore Techno', 'Minimalist Techno'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "Trance":
                var fixedGenre3 = ['Ambient Trance', 'General Trance', 'Hard Trance/Acid', 'Progressive/Dream', 'Tech Trance'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "Alternative Folk":
                var fixedGenre3 = ['Contemporary U.S. Folk'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "Celtic":
                var fixedGenre3 = [];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "Contemporary Folk":
                var fixedGenre3 = ['Folk Pop'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "Folk Rock":
                var fixedGenre3 = ['English Folk Rock', 'Classic Folk Rock'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "General Hip Hop":
                var fixedGenre3 = [];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "General Rap":
                var fixedGenre3 = ['Freestyle Rap', 'Hardcore Rap', 'Underground Rap'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;           
            case "Old School Hip Hop":
                var fixedGenre3 = [];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;      
            case "Indie Rock":
                var fixedGenre3 = ['Art Rock', 'Experimental Rock', 'General Indie Rock', 'Madchester', 'Neo-Glam', 'Original Post-Punk', 'Post-Modern Art Music', 'Post-Punk Revival'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "Indie Pop":
                var fixedGenre3 = ['Dream Pop', 'Post-Modern Electronic Pop', 'Twee Pop'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;    
            case "Bebop & Modern Jazz":
                var fixedGenre3 = ['Avant Garde', 'Bebop', 'Modern Jazz', 'Post-Bop'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break; 
            case "Big Band & Swing":
                var fixedGenre3 = ['Big Band', 'Jump Blues', 'Swing Revival'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;      
            case "Contemporary Jazz & Fusion":
                var fixedGenre3 = ['Cool/West Coast Jazz', 'Fusion', 'Jazz Funk', 'Soul Jazz'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;    
            case "Early Jazz":
                var fixedGenre3 = ['New Orleans Jazz', 'Ragtime'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;                
            case "General Metal":
                var fixedGenre3 = ['Alternative Metal', 'Gothic Metal', 'Heavy Metal', 'Pop/Hair Metal', 'Progressive Metal'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "Hardcore Metal":
                var fixedGenre3 = ['Black/Death Metal', 'Rap Metal', 'Thrash/Speed Metal'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;   
            case "Classic Pop Vocals":
                var fixedGenre3 = ['Classic Female Vocal Pop', 'Classic Male Vocal Pop'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break; 
            case "European Pop":
                var fixedGenre3 = ['Euro Disco', 'Euro Pop', 'Eurobeat', 'French Pop'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;   
            case "Latin Pop":
                var fixedGenre3 = ['General Latin Pop'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;   
            case "Western Pop":
                var fixedGenre3 = ['Acoustic Pop', 'Adult Alternative Pop', 'Adult Contemporary', 'Dance Pop', 'Dream Pop', 'Folk Pop', 'Pop Punk', 'Pop Vocal', 'Power Pop', 'R&B', 'Singer-Songwriter', 'Teen Girl Group', 'Teen Pop', 'Twee Pop'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;   
            case "General Reggae":
                var fixedGenre3 = [];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break; 
            case "Ska/Rock Steady":
                var fixedGenre3 = ['Dancehall', 'Dub', 'Ragga'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break; 
            case "Alternative":
                var fixedGenre3 = ['Adult Alternative Rock', 'Alternative Rock', 'Alternative Singer-Songwriter', 'Grunge', 'Rockabilly Revival'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "Alternative Roots":
                var fixedGenre3 = ['Alt Country', 'Roots Rock', 'Southern Rock'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break; 
            case "Classic Rock":
                var fixedGenre3 = ['Blues Rock', 'Boogie Rock', 'Classic Hard Rock', 'Classic Prog', 'Classic Rock'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "Hard Rock":
                var fixedGenre3 = ['General Hard Rock', 'Glam'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break; 
            case "Mainstream Rock":
                var fixedGenre3 = ['General Mainstream Rock'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break; 
            case "Psychedelic Rock":
                var fixedGenre3 = ['Acid Rock'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break; 
            case "Rock & Roll":
                var fixedGenre3 = ['Rockabilly'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break; 
            case "Soft Rock":
                var fixedGenre3 = ['Instrumental Rock'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break; 
            case "Classic R&B/Soul":
                var fixedGenre3 = ['Motown'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break; 
            case "General R&B/Soul":
                var fixedGenre3 = ['Funk', 'Urban Crossover'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break; 
            case "Original Film/TV Music":
                var fixedGenre3 = [];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break; 
            case "Easy Listening":
                var fixedGenre3 = [];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break; 
            case "European Traditional":
                var fixedGenre3 = [];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break; 
            case "Religious":
                var fixedGenre3 = ['Choral', 'Christian', 'Gospel'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;   
            case "Contemporary R&B/Soul":
                var fixedGenre3 = ['Contemporary R&B', 'Neo-Soul', 'Urban AC', 'Urban Crossover'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;   
            case "Western Hip-Hop/Rap":
                var fixedGenre3 = ['European Hip-Hop/Rap', 'European Hip-Hop/Rap'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;  
            case "African Traditional":
                var fixedGenre3 = ['African', 'West African'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;  
            case "European Traditional":
                var fixedGenre3 = ['British Isles', 'General Celtic', 'Klezmer & European Jewish'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;   
            case "Latin Traditional":
                var fixedGenre3 = ['Cuban'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break; 
            case "New Age":
                var fixedGenre3 = ['New Age World Music', 'World Fusion'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
            case "Other Traditions":
                var fixedGenre3 = ['Central Asian', 'Eastern European', 'General World', ' Middle East/Arabic', 'Native American', 'Zydeco/Cajun'];
                // Combine and remove duplicates from fixedGenre3 and database genre3 into 1 array
                var genre3 = fixedGenre3.concat(dbGenre3.filter((item) => fixedGenre3.indexOf(item) < 0))
                // Populate inputbox list
                for (const item of genre3) {
                    $('#listGenre3').append($("<option>").attr('value', item));
                }
                break;
        }      
    }
});

$(document).on('change', '#inpGenre3', function () {
    // Change each track genre3 when changed
    var counter = 1;
    var genre3 = $('#inpGenre3').val();
    if (genre3 != "") {
        for (var i = 0; i < files.length; i++) {
            // Genre3
            $("#" + counter + "genre3").val(genre3);
            counter += 1;
        }
    }
    else {
        $('#inpGenre3').val("");
        // Clear each track genre2 and genre3
        var counter = 1;
        for (var i = 0; i < files.length; i++) {
            // Genre3
            $("#" + counter + "genre3").val('');
            counter += 1;
        }
    }

});

// Change Mood2 selection box when Mood1 changed
$(document).on('change', '.sltMood1', function () {
    // Get ID of selection element
    var mood1ID = $(this).attr('id');
    // Get value selected
    var mood1Value = $(this).val();
    // Get first digit of ID which represents track no.
    var trackNo = mood1ID.substring(0, 2);
    // Remove aplha characters to just get track number
    trackNo = trackNo.replace(/\D/g, '');
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
    var trackNo = tempo1ID.substring(0, 2);
    // Remove aplha characters to just get track number
    trackNo = trackNo.replace(/\D/g, '');
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
        var genre = $('[name=sltGenre1]').val();
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
                    var tempArtPath = MUSIC_PATH + artist + "/" + album + "/tempArt.jpg";
                    var artFilePath = MUSIC_PATH + artist + "/" + album + "/AlbumArtXLarge.jpg";
                    var resizedFilePath = MUSIC_PATH + artist + "/" + album + "/folder.jpg";
                    // Send message to main.js to save AlbumArtXLarge image
                    ipcRenderer.send("save_artXlarge_file", [tempArtPath, artFilePath]);
                    // Send message to main.js to resize folder image
                    ipcRenderer.send("save_folder_file", [tempArtPath, resizedFilePath]);
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

                // Back cover art
                var backCoverArt = $('#inpBackArtURL').val();
                if (backCoverArt) {
                    var artFilePath = MUSIC_PATH + artist + "/" + album + "/backCover.jpg";
                    // Send message to main.js to save AlbumArtXLarge image
                    ipcRenderer.send("save_backCover_art", [artFilePath, backCoverArt]);
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


