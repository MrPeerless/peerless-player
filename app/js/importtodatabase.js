$(document).ready(function () {

    // Get name of artist and album
    var artist = $("#selectedArtist").text();
    var album = $("#selectedAlbum").text();
    // Replace encoded &amp with &
    artist = artist.replace(/&amp;/g, '&');
    album = album.replace(/&amp;/g, '&');

    // Update headings
    $("#addToDatabaseDetails").html("Syncing " + album + " by " + artist);
    if (global_ImportMode == "auto") {
        $("#addToDatabaseInfo").html("The below metadata has been found in the Gracenote database.<br>Please check and make any manual adjustments if necessary and click on the IMPORT button to add the album to " + global_AppName + " database.<br>&nbsp;<br />")
    }
    else {
        $("#addToDatabaseInfo").html("You have selected to manually input the album metadata.<br>The only required fields are Release Date and Genre. Once completed, click on the IMPORT button to add the album to " + global_AppName + " database.<br>&nbsp;<br />")
    }

    // Add artist and album to form input
    $("#inpArtistName").val(artist);
    // Original artist name is used in case user changes the artist name so it can still be found in the directory
    $("#inpOriginalArtistName").val(artist);

    $("#inpAlbumName").val(album);
    // Original album name is used in case user changes the album name so it can still be found in the directory
    $("#inpOriginalAlbumName").val(album);
    // Remove any previous audio elements used to get tracks length
    $("#divAudioElements").empty();

    // Get all files in album directory
    var files = fs.readdirSync(MUSIC_PATH + artist + "/" + album + "/");
    var counter = 1;
    var form = $("#frmAdd")

    // Loop thorugh each music file in album directory
    for (var i = 0; i < files.length; i++) {
        // Get file extension
        var ext = (path.extname(MUSIC_PATH + artist + "/" + album + "/" + files[i]));

        // Check if file is a music file
        if ((ext == '.mp3') || (ext == '.m4a') || (ext == '.wav')) {
            // Get filename
            var f = path.basename(MUSIC_PATH + artist + "/" + album + "/" + files[i]);
            // Load audio files into audio elements to find duration
            var audioSource = MUSIC_PATH + artist + "/" + album + "/" + encodeURIComponent(f);
            var audio = $('<audio class="player" id="' + i + '" src="' + audioSource + '"></audio>');

            $("#divAudioElements").append(audio);
            var fieldset = $("<fieldset><legend>Track " + counter + "</legend><label class='lblTrackName'>Name: </label><input required class='inpTrackName' id='" + counter + "trackName' name=" + counter + "trackName' type='text' size='79' value='' /><label class='lblFileName'>File Name:</label><input required class='inpFileName' id='" + counter + "fileName' name='" + counter + "fileName' type='text' size='75' value='' readonly /><label class='lblTrackTime'>Time:</label><input required class='inpTrackTime' id='" + counter + "pTime' name='" + counter + "pTime' type='text' size='8 value='' /><br><label class='lblTrackName'>Mood 1:</label><select class='sltMood1' id='" + counter + "mood1' name=" + counter + "mood1'><option value=''></option><option value='Peaceful'>Peaceful</option><option value='Romantic'>Romantic</option><option value='Sentimental'>Sentimental</option><option value='Tender'>Tender</option><option value='Easygoing'>Easygoing</option><option value='Yearning'>Yearning</option><option value='Sophisticated'>Sophisticated</option><option value='Sensual'>Sensual</option><option value='Cool'>Cool</option><option value='Gritty'>Gritty</option><option value='Somber'>Somber</option><option value='Melancholy'>Melancholy</option><option value='Serious'>Serious</option><option value='Brooding'>Brooding</option><option value='Fiery'>Fiery</option><option value='Urgent'>Urgent</option><option value='Defiant'>Defiant</option><option value='Aggressive'>Aggressive</option><option value='Rowdy'>Rowdy</option><option value='Excited'>Excited</option><option value='Energizing'>Energizing</option><option value='Empowering'>Empowering</option><option value='Stirring'>Stirring</option><option value='Lively'>Lively</option><option value='Upbeat'>Upbeat</option><option value='Other'>Other</option></select><label class='lblFileName'>Mood 2:</label><select class='sltMood2' id='" + counter + "mood2' name=" + counter + "mood2'></select><br><label class='lblTrackName'>Tempo 1:</label><input class='inpTrackName' id='" + counter + "tempo1' name=" + counter + "tempo1' type='text' size='25' value='' /><label class='lblFileName'>Tempo 2:</label><input class='inpTrackName' id='" + counter + "tempo2' name=" + counter + "tempo2' type='text' size='25' value='' /><br><label class='lblTrackName'>Genre 2:</label><input class='inpTrackName' id='" + counter + "genre2' name=" + counter + "genre2' type='text' size='40' value='' /><label class='lblFileName'>Genre 3:</label><input class='inpTrackName' id='" + counter + "genre3' name=" + counter + "genre3' type='text' size='40' value='' /></fieldset>");

            // Append fieldset to form
            fieldset.appendTo(form);

            // Increase counter
            counter += 1;
        }
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

    // Function go get meta data fromn Gracenote in index.js
    albumMetadata();
});