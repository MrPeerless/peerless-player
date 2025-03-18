$(function () {
    // Album/Single radio button default value
    $("#radioAlbum").prop("checked", true);

    editAlbum();

    async function editAlbum() {
        // Populate input boxes from artist table
        var sql = "SELECT artistName, origin FROM artist WHERE artistID=?";
        var row = await dBase.get(sql, global_ArtistID);
        var artist = row.artistName;
        var artistOrigin = row.origin;

        // Artist details
        $("#inpArtistName").val(artist);
        $("#inpOriginalArtistName").val(artist);
        $("#inpArtistOrigin").val(artistOrigin);

        // Populate input boxes from album table
        var sql = "SELECT genreID, albumName, releaseDate, albumTime FROM album WHERE albumID=?";
        var row = await dBase.get(sql, global_AlbumID);
        var genreID = row.genreID;
        var album = row.albumName;
        var releaseDate = row.releaseDate;
        var albumTime = row.albumTime;

        // Album details
        $("#inpAlbumName").val(album);
        $("#inpOriginalAlbumName").val(album);
        $("#inpReleaseDate").val(releaseDate);
        $("#inpEditAlbumTime").val(albumTime);

        // Header details
        $("#editAlbumDetails").text("Editing: " + album + " by " + artist);
        $("#editAlbumInfo").empty();
        $("#editAlbumInfo").append("&#x2022 Click on <b>GET</b> to update track and album metadata.<br>&#x2022 Click on <b>ARTWORK</b> to update album cover art.<br>&#x2022 Click on <b>Album Artwork</b> to select an image file manually.<br>&#x2022 Click on <b>DELETE</b> to delete the album from the database.");

        // Path to album artwork
        var modifiedDate = Date().toLocaleString();
        var artworkSource = MUSIC_PATH + artist + "/" + album + "/folder.jpg?modified=" + modifiedDate;
        $("#imgCoverArt").attr('src', artworkSource);

        // Get genre name from genre table
        var sql = "SELECT genreName FROM genre WHERE genreID=?";
        var row = await dBase.get(sql, genreID);
        var genre = row.genreName;

        // Genre details
        // Populate Genre1 listbox with genre
        $('[name=sltGenre1]').val(genre);

        // Track details
        var sql = "SELECT trackID, trackName, fileName, playTime, count, mood1, mood2, tempo1, tempo2, genre2, genre3 FROM track WHERE albumID=?";
        var rows = await dBase.all(sql, global_AlbumID);
        var form = $("#frmEdit")
        var counter = 1;

        $('#inpGenre2Edit').val(rows[0].genre2)
        $('#inpGenre3Edit').val(rows[0].genre3)

        // Loop through each track and create fieldset and append to form
        rows.forEach((row) => {
            // Split trackName on first spaceto get trackNumber
            var trackNumber = row.trackName.split(/\s(.+)/)[0]

            var fieldset = $("<fieldset><legend>Track " + counter + "</legend><label class='lblTrackName'>Name: </label><input class='hidden' id='" + counter + "trackNumber' name=" + counter + "trackNumber' type='text' size='4' value='' /><input class='hidden' id='" + counter + "trackID' name=" + counter + " trackID' type='text' size='4' value='' /><input required class='inpTrackName' id='" + counter + "trackName' name=" + counter + "trackName' type='text' size='79' value='' /><label class='lblFileName'>File Name:</label><input required class='inpFileName' id='" + counter + "fileName' name='" + counter + "fileName' type='text' size='75' value='' /><label class='lblTrackTime'>Time:</label><input required class='inpEditTrackTime' id='" + counter + "pTime' name='" + counter + "pTime' type='text' size='8 value='' readonly/><br><label class='lblTrackName'>Mood 1:</label><select class='sltMood1' id='" + counter + "mood1' name=" + counter + "mood1'></select><label class='lblFileName'>Mood 2:</label><select class='sltMood2' id='" + counter + "mood2' name=" + counter + "mood2'></select><label class='lblTrackTime'>Energy:</label><input class='inpManualEnergy' id='" + counter + "energy' name='" + counter + "energy' type='text' size='3 value='' /><br><label class='lblTrackName'>Tempo 1:</label><select class='sltTempo1' id='" + counter + "tempo1' name=" + counter + "tempo1'></select><label class='lblFileName'>Tempo 2:</label><select class='sltTempo2' id='" + counter + "tempo2' name=" + counter + "tempo2'></select><label class='lblTrackTime'>Valence:</label><input class='inpManualValence' id='" + counter + "valence' name='" + counter + "valence' type='text' size='3 value='' /><br><label class='lblTrackName'>Genre 2:</label><input class='inpTrackGenre' id='" + counter + "genre2' name=" + counter + "genre2' type='text' size='40' value = '' readonly/><label class='lblFileName'>Genre 3:</label><input class='inpTrackGenre' id='" + counter + "genre3' name=" + counter + "genre3' type='text' size='40' value='' readonly/><label class='lblTrackTime'>Tempo:</label><input class='inpManualTempo' id='" + counter + "tempo' name='" + counter + "tempo' type='text' size='3 value='' /></fieldset>");

            // Append fieldset to form
            fieldset.appendTo(form);

            // Populate mood1 listbox
            $("#" + counter + "mood1").append("<option></option>");
            $("#" + counter + "mood1").append("<option value='Aggressive'>Aggressive</option>");
            $("#" + counter + "mood1").append("<option value='Brooding'>Brooding</option>");
            $("#" + counter + "mood1").append("<option value='Cool'>Cool</option>");
            $("#" + counter + "mood1").append("<option value='Defiant'>Defiant</option>");
            $("#" + counter + "mood1").append("<option value='Easygoing'>Easygoing</option>");
            $("#" + counter + "mood1").append("<option value='Empowering'>Empowering</option>");
            $("#" + counter + "mood1").append("<option value='Energizing'>Energizing</option>");
            $("#" + counter + "mood1").append("<option value='Excited'>Excited</option>");
            $("#" + counter + "mood1").append("<option value='Fiery'>Fiery</option>");
            $("#" + counter + "mood1").append("<option value='Gritty'>Gritty</option>");
            $("#" + counter + "mood1").append("<option value='Lively'>Lively</option>");
            $("#" + counter + "mood1").append("<option value='Melancholy'>Melancholy</option>");
            $("#" + counter + "mood1").append("<option value='Peaceful'>Peaceful</option>");
            $("#" + counter + "mood1").append("<option value='Romantic'>Romantic</option>");
            $("#" + counter + "mood1").append("<option value='Rowdy'>Rowdy</option>");
            $("#" + counter + "mood1").append("<option value='Sensual'>Sensual</option>");
            $("#" + counter + "mood1").append("<option value='Sentimental'>Sentimental</option>");
            $("#" + counter + "mood1").append("<option value='Serious'>Serious</option>");
            $("#" + counter + "mood1").append("<option value='Somber'>Somber</option>");
            $("#" + counter + "mood1").append("<option value='Sophisticated'>Sophisticated</option>");
            $("#" + counter + "mood1").append("<option value='Stirring'>Stirring</option>");
            $("#" + counter + "mood1").append("<option value='Tender'>Tender</option>");
            $("#" + counter + "mood1").append("<option value='Upbeat'>Upbeat</option>");
            $("#" + counter + "mood1").append("<option value='Urgent'>Urgent</option>");
            $("#" + counter + "mood1").append("<option value='Yearning'>Yearning</option>");
            $("#" + counter + "mood1").append("<option value='Other'>Other</option>");


            // Populate tempo1 listbox
            $("#" + counter + "tempo1").append("<option></option>");
            $("#" + counter + "tempo1").append("<option>Slow Tempo</option>");
            $("#" + counter + "tempo1").append("<option>Medium Tempo</option>");
            $("#" + counter + "tempo1").append("<option>Fast Tempo</option>");

            // Apply values to fields from database query
            $("#" + counter + "trackNumber").val(trackNumber);
            $("#" + counter + "trackID").val(row.trackID);
            $("#" + counter + "trackName").val(row.trackName);
            $("#" + counter + "fileName").val(row.fileName);
            $("#" + counter + "pTime").val(row.playTime);
            $("#" + counter + "mood1").val(row.mood1);
            $("#" + counter + "tempo1").val(row.tempo1);
            
            $("#" + counter + "genre2").val(row.genre2);
            $("#" + counter + "genre3").val(row.genre3);


            // Populate tempo2 listbox depending on tempo1 selected
            var tempo1Selected = $("#" + counter + "tempo1").val();

            switch (tempo1Selected) {
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
            $("#" + counter + "tempo2").val(row.tempo2);

            // Populate mood2 listbox depending on mood1 selected
            var mood1Selected = $("#" + counter + "mood1").val();

            switch (mood1Selected) {
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

            // Populate value for mood2
            $("#" + counter + "mood2").val(row.mood2);

            // Increase counter
            counter += 1;
        });
        // Populate hidden field with number of tracks
        counter -= 1
        $("#inpCount").val(counter)

        // Replace encoded &amp with &
        artist = artist.replace(/&amp;/g, '&');
        album = album.replace(/&amp;/g, '&');

        // Call ajax function artistIDQuery
        queryArtistID(artist).done(artistIDProcessData);

        // Function to send ajax xml query to Musicbrainz server
        function queryArtistID(query) {
            var queryArtist = query;
            // Artist serach url
            var url = musicbrainzUrl + "artist/?query=artist:" + queryArtist;
            // Encode url
            var encodedUrl = encodeURI(url);
            return $.ajax({
                url: encodedUrl
            });
        }
        // Function to process data from received xml file searching for artistID
        function artistIDProcessData(xml) {
            // Loop to find matching artist
            for (var i = 0; i < 10; i++) {
                var $artist = $(xml).find('artist').eq(i);
                var name = $artist.find('name').eq(0).text().toLowerCase();
                var artistCheck = artist.toLowerCase();

                // Remove any punctuation to aid matching
                name = name.replace(/[.,;:?()'-\/]/g, ' ')
                // Remove  non standard unicode charcters from MB xml result
                // Remove unicode char u-2019 single comma quotation mark
                name = name.replace(/\u2019/g, ' ')
                // Remove unicode char u-2013 en dash
                name = name.replace(/\u2013/g, ' ')
                // Remove unicode char u-2010 hyphen
                name = name.replace(/\u2010/g, ' ')
                // Remove any multiple spaces
                name = name.replace(/  +/g, ' ')
                // Remove any spaces at start and end
                name = name.trim();
                name = name.trimEnd();

                // Remove any punctuation to aid matching
                artistCheck = artistCheck.replace(/[.,;:?()'-\/]/g, ' ')
                // Remove any multiple spaces
                artistCheck = artistCheck.replace(/  +/g, ' ')
                // Remove any spaces at start and end
                artistCheck = artistCheck.trim();
                artistCheck = artistCheck.trimEnd();

                if (artistCheck == name) {
                    artistMBID = $artist.attr("id");
                    // Store Artist MBID in hidden field
                    $("#inpArtistMBID").val(artistMBID);
                    break;
                }
            }
        }
    }
});