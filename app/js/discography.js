$(function () {
    // Declare artist variable
    var artist;
    var artistID = "";

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
    // This function gets start and end date of artist and artist type
    function processDataArtistID(xml) {
        $(xml).find('artist').each(function () {
            var discographyDetails = "";
            var $artist = $(this);
            var matchScore = Number($artist.attr('ns2:score'))
            if (matchScore >= "70") {
                var artistName = $artist.find('name').eq(0).text();

                // Check if artist name is in xml result
                var checkArtist = artist.replace(/\W/g, '');
                checkArtist = checkArtist.toLowerCase();
                var checkArtistName = artistName.replace(/\W/g, '');
                checkArtistName = checkArtistName.toLowerCase();

                // Check if artist names match
                if (checkArtistName == checkArtist) {
                    global_TrackListing = false;
                    var artistName = $artist.find('name').eq(0).text();
                    artistID = $artist.attr("id");
                    var type = $artist.attr('type')
                    var begin = $artist.find('begin').text();
                    var end = $artist.find('end').text();
                    var releaseList = [];

                    // Display start and end date of artist
                    if (artistID != "") {
                        if (begin == "") {
                            begin = "Not known"
                        }
                        if (end == "") {
                            end = "present day"
                        }
                        // Calculate age if person
                        if (type == "Person") {
                            var age;
                            // If person is alive
                            if (end == "present day") {
                                // Calculate age
                                age = new Date(new Date() - new Date(begin)).getFullYear() - 1970;
                            }
                            // Else if person is dead
                            else {
                                // Calculate age
                                age = new Date(new Date(end) - new Date(begin)).getFullYear() - 1970;
                            }
                            // 
                            if (age) {
                                discographyDetails = "Alive from " + begin + " to " + end + ". Aged " + age + ".";
                            }
                            else {
                                discographyDetails = "Alive from " + begin + " to " + end + ".";
                            }
                        }
                        // Details if type is group
                        else if (type == "Group") {
                            discographyDetails = "Recording from " + begin + " to " + end + ".";
                        }
                        // Details if no type
                        else {
                            discographyDetails = " * ";
                        }
                        $("#discographyDetails").empty();
                        $("#discographyDetails").append(discographyDetails);

                        // Set variable for overlay class on album image
                        var overlay = "overlay";
                        if (global_ArtIconShape == "round") {
                            overlay = "overlayRound";
                        }
                        // Remove any li from list
                        ul.empty()

                        artistReleaseQuery(artistID).then(processDataRelease);

                        // Function to send ajax xml query to Musicbrainz server
                        function artistReleaseQuery(query) {
                            var queryArtistID = query;
                            // Artist search url
                            var url = musicbrainzUrl + "release-group?artist=" + queryArtistID + "&limit=100&type=album"
                            // Encode url
                            var encodedUrl = encodeURI(url);
                            return $.ajax({
                                url: encodedUrl,
                                error: function (textStatus) {
                                    ajaxError(textStatus.statusText, textStatus.status, url)
                                }
                            });
                        }

                        // Function to process data from received xml file searching for artistID
                        function processDataRelease(xml) {
                            //console.log("xml :: " + JSON.stringify(xml))
                            var releaseGroupID;
                            var type;
                            var title;
                            var date;
                            var sortDate;
                            var numberReleases = $(xml).find('release-group-list').attr('count');
                            numberReleases = Number(numberReleases);
                            if (numberReleases > 100) {
                                numberReleases = 100;
                            }

                            if (numberReleases == 0) {
                                $("#discographyCount").append("No albums found.");
                                return;
                            }

                            var i = 0;
                            // Loop through each release-group and get data
                            $(xml).find('release-group').each(function () {
                                var $release = $(this);
                                releaseGroupID = $release.attr('id')                               
                                type = $release.attr('type')
                                title = $release.find('title').text();
                                date = $release.find('first-release-date').text();
                                sortDate = new Date(date);
                                releaseList.push({ id: releaseGroupID, type: type, title: title, date: date, sortDate: sortDate });
                                i += 1;
                                if (numberReleases == i) {
                                    releaseList.sort(function (a, b) {
                                        return new Date(b.sortDate) - new Date(a.sortDate);
                                    });
                                    //console.log("releaseList :: " + JSON.stringify(releaseList))

                                    // Loop through releaseList and populate in ul
                                    releaseList.forEach(function (release) {
                                        // Create youtube music search url
                                        if (release.type == "Album") {
                                            var searchAlbum = release.title.replace(/\s+/g, '+')
                                            var searchArtist = artist.replace(/\s+/g, '+')
                                            var searchLink = musicYoutubeUrl + 'search?q=' + searchAlbum + '+' + searchArtist

                                            // Small art icons
                                            if (global_ArtIconSize == "small") {
                                                $(ul).attr('class', 'albumDisplay');
                                                var li = $('<li><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                                                li.find('a').attr('href', searchLink);
                                                li.find('a').attr('target', '_blank');
                                                li.find('span').append('</b><br>' + release.title + '</b><br>' + release.date);
                                                li.appendTo(ul);
                                            }
                                            // Large art icons
                                            else {
                                                $(ul).attr('class', 'albumDisplayLarge');
                                                var li = $('<li><a><img class="' + global_ArtIconShape + '"><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                                                li.find('a').attr('href', searchLink);
                                                li.find('a').attr('target', '_blank');
                                                li.find('span').append('<b><br>' + release.title + '</b><br>' + release.date);
                                                li.appendTo(ul);
                                            }
                                            coverartQuery(release.id).then(processAlbum);
                                        }
                                        else {
                                            i -= 1;
                                        }

                                        // Ajax call to get URL for cover art
                                        function coverartQuery(query) {
                                            // Artist search url
                                            var url = coverartArchiveUrl + "release-group/" + query
                                            return $.ajax({
                                                url: url,
                                                error: function (request, status, error) {
                                                    console.log("COVER ART ERROR :: " + request.responseText);
                                                    console.log("COVER ART ERROR :: " + error);
                                                    //li.remove();
                                                    //i -= 1;
                                                    // If no artwork found use default image
                                                    li.find('img').attr('src', "./graphics/playlist_background.png");
                                                }
                                            });
                                        }
                                        // Add coverart to list items
                                        function processAlbum(response) {
                                            console.log("cover art response :: " + response)
                                            // Get cover art and add thumbnail url
                                            coverArt = response['images'][0]['image']
                                            coverArt = coverArt.substring(0, coverArt.length - 4);
                                            coverArt = coverArt + "-250.jpg";                                            
                                            li.find('img').attr('src', coverArt);
                                            // Display number of albums found
                                            $("#discographyCount").empty();
                                            $("#discographyCount").append(i + " albums found.");
                                        }
                                    });
                                }
                            });
                        }
                    }
                    // Calculate width of divAlbumList so that it fills screen width
                    var winWidth = $(window).width();
                    var divContentWidth = $("#divContent").width();
                    var divSidemenu;

                    if ($("#divSideMenu").is(":visible")) {
                        divSidemenu = 35;
                    }
                    else {
                        divSidemenu = 240;
                    }
                    // Set width for divAlbumList
                    $("#divDiscography").css("width", winWidth - (divSidemenu + divContentWidth));
                    return false;
                }
            }
        });
        if (!artistID) {
            noResult();
        }
    }

    function noResult() {
        // Hide please wait modal box
        $('#okModal').css('display', 'none');
        $('.background').css('filter', 'blur(0px)');
        // Display modal box if no artist found in Musicbrainz database
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br><b>" + artist + "</b> not found in Musicbrainz database.<br>&nbsp<br>&nbsp</p>");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal")[0].focus();
        $('.background').css('filter', 'blur(5px)');
        // Go back to track listing page for album
        $("#divTrackListing").css("display", "none");
        $("#divContent").css("width", "auto");
        return;
    }


    /*
    //####### SPOTIFY CODE ##########
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
            $("#btnOkModal")[0].focus();
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
            divSidemenu = 35;
        }
        else {
            divSidemenu = 240;
        }
        // Set width for divSpotifyAlbumList
        $("#divSpotifyDiscography").css("width", winWidth - (divSidemenu + divContentWidth));
    });
    //##### END SPOTIFY CODE ######
    */


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
        $("#btnOkModal")[0].focus();
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

    // Display MusicBrainz
    $("#discogMusicBrainzLogo").attr('src', './graphics/metaBrainz_logo.png');

    // Append X to close button here so that its position adjusts to scrollbars
    $("#btnClose").empty();
    $("#btnClose").append("&times;");

    backgroundChange();
});