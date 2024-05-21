$(document).ready(function () {
    // Declare artist variable
    var artist;

    // Get artist name from hidden field
    artist = $("#hiddenArtistName").text();

    // Display heading with artist name
    $("#discographyArtistName").append("Discography of Albums by " + artist);

    // Variable for Discography list
    var ul = $('#ulDiscography');

    // Call ajax function artistIDQuery
    artistIDQuery(artist).done(processDataArtistID);

    // Function to send ajax xml query to Musicbrainz server
    function artistIDQuery(query) {
        var queryArtist = query;
        // Artist search url
        var url = musicbrainzUrl + "artist/?query=artist:" + queryArtist;
        // Encode url
        var encodedUrl = encodeURI(url);
        return $.ajax({
            url: encodedUrl,
            error: function (textStatus) {
                ajaxError(textStatus.statusText, textStatus.status, encodedUrl)
            }
        });
    }

    // Function to process data from received xml file searching for artistID
    // This function gets start and end date of artist and artis type
    function processDataArtistID(xml) {
        var discographyDetails = "";
        var $artist = $(this);

        // Get the first artist in xml and check it is match score = 100
        var $artist = $(xml).find('artist').eq(0);
        var matchScore = $artist.attr('ns2:score')

        // Find the 100% artist match
        if (matchScore == "100") {
            global_TrackListing = false;
            var artistName = $artist.find('name').eq(0).text();
            artistID = $artist.attr("id");
            var type = $artist.attr('type')
            var begin = $artist.find('begin').text();
            var end = $artist.find('end').text();

            // Display start and end date of artist
            if (begin != "") {
                if (end == "") {
                    end = "present day"
                }
                // Calculate age if person
                if (type == "Person") {
                    // If person is alive
                    if (end == "present day") {
                        // Calculate age
                        var age = new Date(new Date() - new Date(begin)).getFullYear() - 1970;
                    }
                    // Else if person is dead
                    else {
                        // Calculate age
                        var age = new Date(new Date(end) - new Date(begin)).getFullYear() - 1970;
                    }
                    // 
                    discographyDetails = "Alive from " + begin + " to " + end + ". Aged " + age + ".";
                }
                // Details if type is group
                else if (type == "Group") {
                    discographyDetails = "Recording from " + begin + " to " + end + ".";
                }
                // Details if no type
                else {
                    discographyDetails = " * ";
                }
                $("#discographyDetails").append(discographyDetails);
            }
            // No information found on Musicbrainz
            else {
                console.log("No information found on Musicbrainz")
                $("#discographyDetails").append(" * ");
            }
        }
    }

    // Send IPC to search Spotify for album and artist
    ipcRenderer.send("spotify_getArtistID", [artist, "discography"])



    ipcRenderer.on("from_discography", (event, data) => {

        var spotifyResponse = data;

        // Set variable for overlay class on album image
        var overlay = "overlay";
        if (global_ArtIconShape == "round") {
            overlay = "overlayRound";
        }

        var numberAlbums = spotifyResponse[0].items.length
        $("#discographyCount").empty();
        $("#discographyCount").append(numberAlbums + " albums found. Click on an album to listen in Spotify web-player.");

        if (numberAlbums >= 1) {
            // Remove any li from list
            ul.empty()
            // Get each spotify albumID
            $.each(spotifyResponse[0].items, function (i, items) {
                var album = items.name;
                var releaseDate = items.release_date;
                var imageLink = items.images[1].url;
                var albumLink = items.external_urls.spotify

                // Small art icons
                if (global_ArtIconSize == "small") {
                    $(ul).attr('class', 'albumDisplay');
                    var li = $('<li><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                    li.find('img').attr('src', imageLink);
                    li.find('a').attr('href', albumLink);
                    li.find('a').attr('target', '_blank');
                    li.find('span').append('</b><br>' + album + '</b><br>' + releaseDate);
                    li.appendTo(ul);
                }

                // Large art icons
                else {
                    $(ul).attr('class', 'albumDisplayLarge');
                    var li = $('<li><a><img class="' + global_ArtIconShape + '"><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                    li.find('img').attr('src', imageLink);
                    li.find('a').attr('href', albumLink);
                    li.find('a').attr('target', '_blank');
                    li.find('span').append('</b><br>' + album + '</b><br>' + releaseDate);
                    li.appendTo(ul);
                }

            });
        }
        else {
            // Display modal information box
            $('#okModal').css('display', 'block');
            $('.modalHeader').empty();
            $('#okModalText').empty();
            $(".modalFooter").empty();
            $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
            $('#okModalText').append("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br><b>No albums could be found.</b><br><br>&nbsp</p >");
            var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
            $('.modalFooter').append(buttons);
            $("#btnOkModal").focus();
            $("#btnSync").prop("disabled", false);
            $('.background').css('filter', 'blur(5px)');
            // Hide discography page and go back
            $("#divTrackListing").css("display", "none");
            $("#divContent").css("width", "auto");
            window.history.back();
            return false;
        }
        // Calculate width of divSpotifyAlbumList so that it fills screen width
        var winWidth = $(window).width();
        var divContentWidth = $("#divContent").width();
        var divSidemenu;

        if ($("#divSideMenu").is(":visible")) {
            divSidemenu = 0;
        }
        else {
            divSidemenu = 240;
        }
        // Set width for divSpotifyAlbumList
        $(".divSpotifyAlbumList").css("width", winWidth - (divSidemenu + divContentWidth));
    });

    function noResult() {
        // Display modal box if no artistID found in Musicbrainz database
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br><b>" + artist + "</b> not found in discography database.<br>&nbsp<br>&nbsp</p>");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        $('.background').css('filter', 'blur(5px)');

        // If tracklisting is true display current album tracklisting page
        if (global_TrackListing == true) {
            $("#divTrackListing").load("./html/displayalbum.html?artist=" + global_ArtistID + "&album=" + global_AlbumID);
        }
        else {
            // Hide biography page and go back
            $("#divTrackListing").css("display", "none");
            $("#divContent").css("width", "auto");
        }  
    }

    // Error handling for ajax errors
    function ajaxError(statusText, status, url) {
        // Hide modal box
        $('#okModal').css('display', 'none');
        $('.background').css('filter', 'blur(0px)');
        // Display modal box if no artistID found in Musicbrainz database
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/warning.png'></div><p><b>Could not connect to remote server.</b><br>" + url + "<br>The remote server may be currently unavailable. See error code below.<br><b>" + statusText + ": " + status + "</b><br>&nbsp<br></p>");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        $('.background').css('filter', 'blur(5px)');
        // If tracklisting is true display current album tracklisting page
        if (global_TrackListing == true) {
            $("#divTrackListing").load("./html/displayalbum.html?artist=" + global_ArtistID + "&album=" + global_AlbumID);
        }
        else {
            // Hide biography page and go back
            $("#divTrackListing").css("display", "none");
            $("#divContent").css("width", "auto");
        }
        return;
    }

    // Display Spotify logo depending on which skin is selected
    if (global_Background == "#eeeeee") {
        $(".spotifyLogo").attr('src', './graphics/spotify_black.png');
    }
    else {
        $(".spotifyLogo").attr('src', './graphics/spotify_white.png');
    }

    backgroundChange();
});