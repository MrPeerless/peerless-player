$(document).ready(function () {
    
    var spotifyResponse;

    // Release type radio button default value
    $("#radioAllRelease").prop("checked", true);

    // Artist type radio button default value
    $("#radioAllArtists").prop("checked", true);

    // Send IPC to search Spotify for album and artist
    ipcRenderer.send("spotify_getNewReleases")

    ipcRenderer.on("from_getNewReleases", (event, data) => {
        spotifyResponse = data;
        console.log(spotifyResponse)

        var numberReleases = spotifyResponse[0].albums.items.length
        //console.log(numberReleases)

        $("#numberNewReleases").text("Displaying " + numberReleases + " new releases.")

        // Set variable for overlay class on album image
        var overlay = "overlay";
        if (global_ArtIconShape == "round") {
            overlay = "overlayRound";
        }

        // Variable for album list
        var ul = $('#ulNewReleases');
        // Remove any li from list
        ul.empty()

        if (numberReleases > 1) {
            // Get each spotify albumID
            $.each(spotifyResponse[0].albums.items, function (i, items) {
                var artist = items.artists[0].name;
                var album = items.name;
                var releaseDate = items.release_date;
                var imageLink = items.images[1].url;
                //console.log("Artist = " + artist)
                //console.log("Album = " + album)
                //console.log("Release Date = " + releaseDate)
                //console.log("Image Link = " + imageLink)

                // Napster search link for album
                var albumLink = napsterUrl + artist + "+" + album;
                var encodedUrl = encodeURI(albumLink);

                if (global_ArtIconSize == "small") {
                    $(ul).attr('class', 'albumDisplay');
                    var li = $('<li><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                    li.find('img').attr('src', imageLink);
                    li.find('a').attr('href', encodedUrl);
                    li.find('a').attr('target', '_blank');
                    li.find('span').append('<br><b>' + artist + '</b><br>' + album + '</b><br>' + releaseDate);
                    li.appendTo(ul);
                }

                // Large art icons
                else {
                    $(ul).attr('class', 'albumDisplayLarge');
                    var li = $('<li><a><img class="' + global_ArtIconShape + '"><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                    li.find('img').attr('src', imageLink);
                    li.find('a').attr('href', encodedUrl);
                    li.find('a').attr('target', '_blank');
                    li.find('span').append('<br><b>' + artist + '</b><br>' + album + '</b><br>' + releaseDate);
                    li.appendTo(ul);
                }
            });
        }

        /*
        else {
            // Display modal information box
            $('#okModal').css('display', 'block');
            $('.modalHeader').empty();
            $('#okModalText').empty();
            $(".modalFooter").empty();
            $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
            $('#okModalText').append("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br><b>No new releases could be found.</b><br><br>&nbsp</p >");
            var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
            $('.modalFooter').append(buttons);
            $("#btnOkModal").focus();
            $("#btnSync").prop("disabled", false);
            $('.background').css('filter', 'blur(5px)');
            // Hide recommendations page and go back
            $("#divTrackListing").css("display", "none");
            $("#divContent").css("width", "auto");
            window.history.back();
            return false;
        }
        */
    });

    // The code to populate the newreleases.js page is in the ipcreply.js file

    // Click event for releaseType radio button
    $(document).on('click', 'input[name="releaseType"]', function () {
        //console.log($(this).val());
        var releaseType = $(this).val();
        console.log("release = " + releaseType)

        var releaseArtist = $("input[name='releaseArtist']:checked").val();
        console.log("artist = " + releaseArtist)

        if (releaseType == "all") {
            // All releases
            console.log("All")
        }
        else if (releaseType == "albums") {
            // Album releases
            console.log("Albums")
        }
        else {
            // Single releases
            console.log("Singles")
        }
    });
});