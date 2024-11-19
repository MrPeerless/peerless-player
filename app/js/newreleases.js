$(function () {
    // Varibale for new release data from spotify
    var spotifyResponse;

    // Get list of your artists from database
    var artists = [];
    getArtists()
    async function getArtists() {
        var sql = "SELECT artistName FROM artist";
        var rows = await dBase.all(sql);
        rows.forEach((row) => {
            artists.push(row.artistName);
        });
    }
    
    // Variable for album list
    var ul = $('#ulNewReleases');

    // Set variable for overlay class on album image
    var overlay = "overlay";
    if (global_ArtIconShape == "round") {
        overlay = "overlayRound";
    }

    // Display Spotify logo depending on which skin is selected
    if (global_Background == "#eeeeee") {
        $(".spotifyLogo").attr('src', './graphics/spotify_black.png');
    }
    else {
        $(".spotifyLogo").attr('src', './graphics/spotify_white.png');
    }

    // Release type radio button default value
    $("#radioAllRelease").prop("checked", true);

    // Artist type radio button default value
    $("#radioAllArtists").prop("checked", true);

    // Send IPC to search Spotify for album and artist
    ipcRenderer.send("spotify_getNewReleases")

    ipcRenderer.on("from_getNewReleases", (event, data) => {
        spotifyResponse = data;
        // Get number of releases found
        var numberReleases = spotifyResponse[0].albums.items.length
        // If more than 1 release found call function to display releases
        if (numberReleases > 1) {
            displayAll("all");
        }
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
            $("#btnOkModal")[0].focus();
            $("#btnSync").prop("disabled", false);
            $('.background').css('filter', 'blur(5px)');
            // Hide recommendations page and go back
            $("#divTrackListing").css("display", "none");
            $("#divContent").css("width", "auto");
            window.history.back();
            return false;
        }
    });

    // Click event for releaseType radio button
    $(document).on('click', 'input[name="releaseType"]', function () {
        var releaseType = $(this).val();
        var releaseArtist = $("input[name='releaseArtist']:checked").val();
        if (releaseType == "all") {
            // All releases
            displayAll(releaseArtist);
        }
        else if (releaseType == "albums" ) {
            // Album releases
            displayAlbums(releaseArtist);
        }
        else {
            // Single releases
            displaySingles(releaseArtist);
        }
    });

    // Click event for releaseArtist radio button
    $(document).on('click', 'input[name="releaseArtist"]', function () {
        var releaseArtist = $(this).val();
        var releaseType = $("input[name='releaseType']:checked").val();
        if (releaseType == "all") {
            // All releases
            displayAll(releaseArtist);
        }
        else if (releaseType == "albums") {
            // Album releases
            displayAlbums(releaseArtist);
        }
        else {
            // Single releases
            displaySingles(releaseArtist);
        }
    });

    function displayAll(selection) {
        // Remove any li from list
        ul.empty()
        var counter = 0;
        $("#headingNewReleases").text("All New Releases.")

        // Get each spotify albumID
        $.each(spotifyResponse[0].albums.items, function (i, items) {
            var artist = items.artists[0].name;
            var albumLink = items.external_urls.spotify;
            if (selection == "all") {
                var album = items.name;
                var releaseDate = items.release_date;
                var imageLink = items.images[0].url;

                // Small art icons
                if (global_ArtIconSize == "small") {
                    $(ul).attr('class', 'albumDisplay');
                    var li = $('<li><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                    li.find('img').attr('src', imageLink);
                    li.find('a').attr('href', albumLink);
                    li.find('a').attr('target', '_blank');
                    li.find('span').append('<br><b>' + artist + '</b><br>' + album + '</b><br>' + releaseDate);
                    li.appendTo(ul);
                }

                // Large art icons
                else {
                    $(ul).attr('class', 'albumDisplayLarge');
                    var li = $('<li><a><img class="' + global_ArtIconShape + '"><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                    li.find('img').attr('src', imageLink);
                    li.find('a').attr('href', albumLink);
                    li.find('a').attr('target', '_blank');
                    li.find('span').append('<br><b>' + artist + '</b><br>' + album + '</b><br>' + releaseDate);
                    li.appendTo(ul);
                }
                counter += 1;
            }
            else if (selection == "yours" && artists.includes(artist)) {
                var album = items.name;
                var releaseDate = items.release_date;
                var imageLink = items.images[0].url;

                // Small art icons
                if (global_ArtIconSize == "small") {
                    $(ul).attr('class', 'albumDisplay');
                    var li = $('<li><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                    li.find('img').attr('src', imageLink);
                    li.find('a').attr('href', albumLink);
                    li.find('a').attr('target', '_blank');
                    li.find('span').append('<br><b>' + artist + '</b><br>' + album + '</b><br>' + releaseDate);
                    li.appendTo(ul);
                }

                // Large art icons
                else {
                    $(ul).attr('class', 'albumDisplayLarge');
                    var li = $('<li><a><img class="' + global_ArtIconShape + '"><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                    li.find('img').attr('src', imageLink);
                    li.find('a').attr('href', albumLink);
                    li.find('a').attr('target', '_blank');
                    li.find('span').append('<br><b>' + artist + '</b><br>' + album + '</b><br>' + releaseDate);
                    li.appendTo(ul);
                }
                counter += 1;
            }
            else if (selection == "new") {
                var check = artists.includes(artist);
                if (check == false) {
                    var album = items.name;
                    var releaseDate = items.release_date;
                    var imageLink = items.images[0].url;

                    // Small art icons
                    if (global_ArtIconSize == "small") {
                        $(ul).attr('class', 'albumDisplay');
                        var li = $('<li><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                        li.find('img').attr('src', imageLink);
                        li.find('a').attr('href', albumLink);
                        li.find('a').attr('target', '_blank');
                        li.find('span').append('<br><b>' + artist + '</b><br>' + album + '</b><br>' + releaseDate);
                        li.appendTo(ul);
                    }

                    // Large art icons
                    else {
                        $(ul).attr('class', 'albumDisplayLarge');
                        var li = $('<li><a><img class="' + global_ArtIconShape + '"><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                        li.find('img').attr('src', imageLink);
                        li.find('a').attr('href', albumLink);
                        li.find('a').attr('target', '_blank');
                        li.find('span').append('<br><b>' + artist + '</b><br>' + album + '</b><br>' + releaseDate);
                        li.appendTo(ul);
                    }
                    counter += 1;
                }    
            }
        });
        $("#numberNewReleases").text("Displaying " + counter + " new releases.")
    }

    function displayAlbums(selection) {
        // Remove any li from list
        ul.empty()
        var counter = 0;
        $("#headingNewReleases").text("New Album Releases.")
        // Get each spotify albumID
        $.each(spotifyResponse[0].albums.items, function (i, items) {
            var albumType = items.album_type;
            var artist = items.artists[0].name;
            var albumLink = items.external_urls.spotify;
            if (albumType == "album") {
                if (selection == "all") {
                    var album = items.name;
                    var releaseDate = items.release_date;
                    var imageLink = items.images[0].url;

                    // Small art icons
                    if (global_ArtIconSize == "small") {
                        $(ul).attr('class', 'albumDisplay');
                        var li = $('<li><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                        li.find('img').attr('src', imageLink);
                        li.find('a').attr('href', albumLink);
                        li.find('a').attr('target', '_blank');
                        li.find('span').append('<br><b>' + artist + '</b><br>' + album + '</b><br>' + releaseDate);
                        li.appendTo(ul);
                    }

                    // Large art icons
                    else {
                        $(ul).attr('class', 'albumDisplayLarge');
                        var li = $('<li><a><img class="' + global_ArtIconShape + '"><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                        li.find('img').attr('src', imageLink);
                        li.find('a').attr('href', albumLink);
                        li.find('a').attr('target', '_blank');
                        li.find('span').append('<br><b>' + artist + '</b><br>' + album + '</b><br>' + releaseDate);
                        li.appendTo(ul);
                    }
                    counter += 1;
                }
                else if (selection == "yours" && artists.includes(artist)) {
                    var album = items.name;
                    var releaseDate = items.release_date;
                    var imageLink = items.images[0].url;

                    // Small art icons
                    if (global_ArtIconSize == "small") {
                        $(ul).attr('class', 'albumDisplay');
                        var li = $('<li><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                        li.find('img').attr('src', imageLink);
                        li.find('a').attr('href', albumLink);
                        li.find('a').attr('target', '_blank');
                        li.find('span').append('<br><b>' + artist + '</b><br>' + album + '</b><br>' + releaseDate);
                        li.appendTo(ul);
                    }

                    // Large art icons
                    else {
                        $(ul).attr('class', 'albumDisplayLarge');
                        var li = $('<li><a><img class="' + global_ArtIconShape + '"><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                        li.find('img').attr('src', imageLink);
                        li.find('a').attr('href', albumLink);
                        li.find('a').attr('target', '_blank');
                        li.find('span').append('<br><b>' + artist + '</b><br>' + album + '</b><br>' + releaseDate);
                        li.appendTo(ul);
                    }
                    counter += 1;
                }
                else if (selection == "new") {
                    var check = artists.includes(artist);
                    if (check == false) {
                        var album = items.name;
                        var releaseDate = items.release_date;
                        var imageLink = items.images[0].url;

                        // Small art icons
                        if (global_ArtIconSize == "small") {
                            $(ul).attr('class', 'albumDisplay');
                            var li = $('<li><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                            li.find('img').attr('src', imageLink);
                            li.find('a').attr('href', albumLink);
                            li.find('a').attr('target', '_blank');
                            li.find('span').append('<br><b>' + artist + '</b><br>' + album + '</b><br>' + releaseDate);
                            li.appendTo(ul);
                        }

                        // Large art icons
                        else {
                            $(ul).attr('class', 'albumDisplayLarge');
                            var li = $('<li><a><img class="' + global_ArtIconShape + '"><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                            li.find('img').attr('src', imageLink);
                            li.find('a').attr('href', albumLink);
                            li.find('a').attr('target', '_blank');
                            li.find('span').append('<br><b>' + artist + '</b><br>' + album + '</b><br>' + releaseDate);
                            li.appendTo(ul);
                        }
                        counter += 1;
                    }
                }
            }

        });
        $("#numberNewReleases").text("Displaying " + counter + " new releases.")
    }

    function displaySingles(selection) {
        // Remove any li from list
        ul.empty()
        var counter = 0;
        $("#headingNewReleases").text("New Single Releases.")
        // Get each spotify albumID
        $.each(spotifyResponse[0].albums.items, function (i, items) {
            var albumType = items.album_type;
            var artist = items.artists[0].name;
            var albumLink = items.external_urls.spotify;
            if (albumType == "single") {
                if (selection == "all") {
                    var album = items.name;
                    var releaseDate = items.release_date;
                    var imageLink = items.images[0].url;

                    // Small art icons
                    if (global_ArtIconSize == "small") {
                        $(ul).attr('class', 'albumDisplay');
                        var li = $('<li><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                        li.find('img').attr('src', imageLink);
                        li.find('a').attr('href', albumLink);
                        li.find('a').attr('target', '_blank');
                        li.find('span').append('<br><b>' + artist + '</b><br>' + album + '</b><br>' + releaseDate);
                        li.appendTo(ul);
                    }

                    // Large art icons
                    else {
                        $(ul).attr('class', 'albumDisplayLarge');
                        var li = $('<li><a><img class="' + global_ArtIconShape + '"><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                        li.find('img').attr('src', imageLink);
                        li.find('a').attr('href', albumLink);
                        li.find('a').attr('target', '_blank');
                        li.find('span').append('<br><b>' + artist + '</b><br>' + album + '</b><br>' + releaseDate);
                        li.appendTo(ul);
                    }
                    counter += 1;
                }
                else if (selection == "yours" && artists.includes(artist)) {
                    var album = items.name;
                    var releaseDate = items.release_date;
                    var imageLink = items.images[0].url;

                    // Small art icons
                    if (global_ArtIconSize == "small") {
                        $(ul).attr('class', 'albumDisplay');
                        var li = $('<li><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                        li.find('img').attr('src', imageLink);
                        li.find('a').attr('href', albumLink);
                        li.find('a').attr('target', '_blank');
                        li.find('span').append('<br><b>' + artist + '</b><br>' + album + '</b><br>' + releaseDate);
                        li.appendTo(ul);
                    }

                    // Large art icons
                    else {
                        $(ul).attr('class', 'albumDisplayLarge');
                        var li = $('<li><a><img class="' + global_ArtIconShape + '"><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                        li.find('img').attr('src', imageLink);
                        li.find('a').attr('href', albumLink);
                        li.find('a').attr('target', '_blank');
                        li.find('span').append('<br><b>' + artist + '</b><br>' + album + '</b><br>' + releaseDate);
                        li.appendTo(ul);
                    }
                    counter += 1;
                }
                else if (selection == "new") {
                    var check = artists.includes(artist);
                    if (check == false) {
                        var album = items.name;
                        var releaseDate = items.release_date;
                        var imageLink = items.images[0].url;

                        // Small art icons
                        if (global_ArtIconSize == "small") {
                            $(ul).attr('class', 'albumDisplay');
                            var li = $('<li><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                            li.find('img').attr('src', imageLink);
                            li.find('a').attr('href', albumLink);
                            li.find('a').attr('target', '_blank');
                            li.find('span').append('<br><b>' + artist + '</b><br>' + album + '</b><br>' + releaseDate);
                            li.appendTo(ul);
                        }

                        // Large art icons
                        else {
                            $(ul).attr('class', 'albumDisplayLarge');
                            var li = $('<li><a><img class="' + global_ArtIconShape + '"><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                            li.find('img').attr('src', imageLink);
                            li.find('a').attr('href', albumLink);
                            li.find('a').attr('target', '_blank');
                            li.find('span').append('<br><b>' + artist + '</b><br>' + album + '</b><br>' + releaseDate);
                            li.appendTo(ul);
                        }
                        counter += 1;
                    }
                }
            }
        });
        $("#numberNewReleases").text("Displaying " + counter + " new releases.")
    }
});