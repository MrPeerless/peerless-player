$(document).ready(function () {
    // Set variable for overlay class on album image
    var overlay = "overlay";
    if (global_ArtIconShape == "round") {
        overlay = "overlayRound";
    }
    // Get artist name from hidden field
    var artist = $("#hiddenArtistName").text();

    // Display heading with artist name
    $("#recommendsArtistName").html(global_AppName + " Recommendations");
    $("#recommendsDetails").html("Based on " + artist);

    // Variable for album list
    var ul = $('#ulRecommends');

    // Call ajax function artistIDQuery
    artistIDQuery(artist).done(processDataArtistID);

    // Function to send ajax xml query to Musicbrainz server
    function artistIDQuery(query) {
        var queryArtist = query;
        var url = musicbrainzUrl + "artist/?"
        // Send ajax request to musicbrainz
        return $.ajax({
            url: url,
            data: {
                query: "artist:" + queryArtist
            }
        });
    }

    // Get Musicbrainz artist name (in case artist has characters in name which are not consistent with directory naming ie AC/DC is invalid directory name)
    function processDataArtistID(xml) {
        // Get the first artist in xml and check it is match score = 100
        var $artist = $(xml).find('artist').eq(0);
        var matchScore = $artist.attr('ns2:score')

        // Check if 100% artist match
        if (matchScore == "100") {
            // Get MB name for artist
            var seedArtist = $artist.find('name').eq(0).text();

            // Call ajax function artistIDQuery
            recommendsQuery(seedArtist).done(processDataRecommends);

            // Function to send ajax xml query to Gracenote rythmn API server
            function recommendsQuery(query) {
                var queryArtist = query;
                // Recommends search url
                var url = gracenoteUrl + "radio/recommend?";
                return $.ajax({
                    url: url,
                    data: {
                        artist_name: queryArtist,
                        max_tracks_per_artist: "1",
                        return_count: "8",
                        select_extended: "cover",
                        client: "12398848-977A13ABAD0F2E143D38E61AF28B78DB",
                        user: global_UserID
                    }
                });
            }

            // Function to process data from received xml file searching for artistID
            function processDataRecommends(xml) {
                var albumsFound = $(xml).find("END").text();
                // Check if any results are found
                if (albumsFound != "") {

                    // Convert albumsFound to an integer
                    var c = parseInt(albumsFound);

                    // Counter to loop through XML file
                    var count = 1;
                    // Counter to count number albums found
                    var albumCount = 0;

                    for (var i = 0; i < c; i++) {
                        var artist = $(xml).find('ALBUM[ORD="' + count + '"] ARTIST').eq(0).text();
                        var title = $(xml).find('ALBUM[ORD="' + count + '"] TITLE').eq(0).text();
                        var artURL = $(xml).find('ALBUM[ORD="' + count + '"] URL').eq(0).text();
                        var gnID = $(xml).find('ALBUM[ORD="' + count + '"] GN_ID').eq(0).text();
                        // Remove trailing [ ] from album name to search Napster
                        var titleLink = title.split(' [')[0];

                        // Napster search link for album
                        var albumLink = napsterUrl + artist + "+" + titleLink;
                        var encodedUrl = encodeURI(albumLink);

                        // Check if cover art found
                        if (artURL != "") {
                            // Small art icons
                            if (global_ArtIconSize == "small") {
                                $(ul).attr('class', 'albumDisplay');
                                var li = $('<li><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                                li.find('img').attr('src', artURL);
                                li.find('a').attr('href', encodedUrl);
                                li.find('a').attr('target', '_blank');
                                li.find('span').html('<br><b>' + artist + '</b><br>' + title);
                                li.appendTo(ul);
                            }

                            // Large art icons
                            else {
                                $(ul).attr('class', 'albumDisplayLarge');
                                var li = $('<li><a><img class="' + global_ArtIconShape + '"><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                                li.find('img').attr('src', artURL);
                                li.find('a').attr('href', encodedUrl);
                                li.find('a').attr('target', '_blank');
                                li.find('span').html('<br><b>' + artist + '</b><br>' + title);
                                li.appendTo(ul);
                            }
                            albumCount += 1;
                        }
                        // If no cover art found search GNID in gracenote for cover art
                        else {
                            var queryAlbum = "<?xml version='1.0' encoding='UTF-8'?><QUERIES><AUTH><CLIENT>12398848-977A13ABAD0F2E143D38E61AF28B78DB</CLIENT><USER>" + global_UserID + "</USER></AUTH><LANG>eng</LANG><COUNTRY>uk</COUNTRY><QUERY CMD='ALBUM_FETCH'><GN_ID>" + gnID + "</GN_ID><OPTION><PARAMETER>SELECT_EXTENDED</PARAMETER><VALUE>COVER</VALUE></OPTION></QUERY></QUERIES>"

                            albumQuery(queryAlbum).done(albumData);

                            // Make ajax request for track details
                            function albumQuery(query) {
                                var queryTracks = query;
                                return $.ajax({
                                    url: gracenoteUrl,
                                    data: queryTracks,
                                    type: "POST",
                                    datatype: "xml"
                                });
                            }

                            // Function to process data from received xml file searching for album
                            function albumData(xml) {
                                var artist = $(xml).find('ARTIST').eq(0).text();
                                var title = $(xml).find('TITLE').eq(0).text();
                                var coverArt = $(xml).find('URL').eq(0).text();
                                // Remove trailing [ ] from album name to search Napster
                                var titleLink = title.split(' [')[0];

                                // Napster search link for album
                                var albumLink = napsterUrl + artist + "+" + titleLink;

                                var encodedUrl = encodeURI(albumLink);

                                if (coverArt != "") {
                                    // Small art icons
                                    if (global_ArtIconSize == "small") {
                                        $(ul).attr('class', 'albumDisplay');
                                        var li = $('<li><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                                        li.find('img').attr('src', coverArt);
                                        li.find('a').attr('href', encodedUrl);
                                        li.find('a').attr('target', '_blank');
                                        li.find('span').html('<br><b>' + artist + '</b><br>' + title);
                                        li.appendTo(ul);
                                    }

                                    // Large art icons
                                    else {
                                        $(ul).attr('class', 'albumDisplayLarge');
                                        var li = $('<li><a><img class="' + global_ArtIconShape + '"><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                                        li.find('img').attr('src', coverArt);
                                        li.find('a').attr('href', encodedUrl);
                                        li.find('a').attr('target', '_blank');
                                        li.find('span').html('<br><b>' + artist + '</b><br>' + title);
                                        li.appendTo(ul);
                                    }
                                    // Increase album counter
                                    albumCount += 1;
                                    $("#recommendsCount").html(albumCount + " albums recommended. Click to search Napster for samples.");
                                }
                            }
                        }
                        count += 1;
                    }
                }

                else {
                    // Display modal box if no recommendations found in Gracenote database
                    $('#okModal').css('display', 'block');
                    $(".modalFooter").empty();
                    $('.modalHeader').html('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
                    $('#okModalText').html("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br>No recommendations found for <b>" + seedArtist + "</b> in Gracenote database.<br>&nbsp</p>");
                    var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
                    $('.modalFooter').append(buttons);
                    $("#btnOkModal").focus();
                    // Hide recommendations page and go back
                    $("#divTrackListing").css("display", "none");
                    $("#divContent").css("width", "auto");
                    window.history.back();
                }
            }
        }
    }
});
