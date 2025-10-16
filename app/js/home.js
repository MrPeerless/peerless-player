$(function () {
    // Check if online
    var connection = navigator.onLine;

    // Set variable for overlay class on album image
    var overlay = "overlay";
    if (global_ArtIconShape == "round") {
        overlay = "overlayRound";
    }

    $("#divTrackListing").empty();

    // Set modified date to now
    var modifiedDate = Date().toLocaleString();

    // Set number of columns to display depending on screenwidth
    var totalList = 0;
    var totalFirstRow = 0;
    global_SrnWidth = $(window).width();

    // Calculate how many albums to display per row 
    if ($('#divSideMenu').is(":visible")) {
        totalFirstRow = parseInt((global_SrnWidth - 35) * global_Zoom / (214 * global_Zoom));
    } else {
        totalFirstRow = parseInt((global_SrnWidth - 240) * global_Zoom / (214 * global_Zoom));
    }
    totalList = totalFirstRow * 10;

    displayRecentlyAdded()

    // Display recently added albums
    async function displayRecentlyAdded() {
        // Select all albums from the database by added date
        var sql = "SELECT album.albumID, artist.artistID, album.albumName, artist.artistName, album.releaseDate, album.dateAdd FROM album INNER JOIN artist ON album.artistID=artist.artistID ORDER BY album.dateAdd DESC";
        var rows = await dBase.all(sql);

        // Unordered list to attach list items to
        var ul = $('#ulRecentlyAdded');
        // Set counter
        var counter = 1;
        // Adjust size of rows to number of columns
        rows.length = totalList;
        rows.forEach((row) => {
            var artworkSource = MUSIC_PATH + row.artistName + "/" + row.albumName + "/folder.jpg?modified=" + modifiedDate;

            var albumLink = "./html/displayalbum.html?album=" + row.albumID + "&artist=" + row.artistID;
            // Format dateAdd string
            var albumDate = formatDate(row.dateAdd);

            // Create <li> item for each album and append to <ul>
            // First row of list
            if (counter <= totalFirstRow) {
                // Small art icons
                if (global_ArtIconSize == "small") {
                    $(ul).attr('class', 'albumDisplay');
                    var li = $('<li><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').append('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br>' + albumDate);
                    li.appendTo(ul);
                }
                // Large art icons
                else {
                    $(ul).attr('class', 'albumDisplayLarge');
                    var li = $('<li><a><img class="' + global_ArtIconShape + '"><br><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').append('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br>' + albumDate);
                    li.appendTo(ul);
                }
            }
            // Hidden rows of list
            else {
                // Small art icons
                if (global_ArtIconSize == "small") {
                    $(ul).attr('class', 'albumDisplay');
                    var li = $('<li class="addedHidden"><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').append('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br>' + albumDate);
                    li.appendTo(ul);
                }
                // Large art icons
                else {
                    $(ul).attr('class', 'albumDisplayLarge');
                    var li = $('<li class="addedHidden"><a><img class="' + global_ArtIconShape + '"><br><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').append('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br>' + albumDate);
                    li.appendTo(ul);
                }              
            }
            // Artwork 404 handling
            $("." + global_ArtIconShape).bind("error", function () {
                // Replace with default image
                $(this).attr("src", "./graphics/notFound.gif");
            });
            // Increment counter for list items
            counter += 1;
        });
    }

    displayRecentlyPlayed()

    async function displayRecentlyPlayed() {
        // Select all albums from the database by recently played
        var sql = "SELECT album.albumID, artist.artistID, album.albumName, artist.artistName, album.releaseDate, album.albumLastPlay FROM album INNER JOIN artist ON album.artistID=artist.artistID ORDER BY album.albumLastPlay DESC";
        var rows = await dBase.all(sql);

        // Unordered list to attach list items to
        var ul = $('#ulRecentlyPlayed');
        // Set counter
        var counter = 1;
        // Adjust size of rows to number of columns
        rows.length = totalList;
        rows.forEach((row) => {
            var artworkSource = MUSIC_PATH + row.artistName + "/" + row.albumName + "/folder.jpg?modified=" + modifiedDate;

            var albumLink = "./html/displayalbum.html?album=" + row.albumID + "&artist=" + row.artistID;

            // Format dateAdd string
            var albumDate = formatDate(row.albumLastPlay);

            // Create <li> item for each album and append to <ul>
            // First row of list
            if (counter <= totalFirstRow) {
                // Small art icons
                if (global_ArtIconSize == "small") {
                    $(ul).attr('class', 'albumDisplay');
                    var li = $('<li><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').append('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br>' + albumDate);
                    li.appendTo(ul);
                }
                // Large art icons
                else {
                    $(ul).attr('class', 'albumDisplayLarge');
                    var li = $('<li><a><img class="' + global_ArtIconShape + '"><br><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').append('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br>' + albumDate);
                    li.appendTo(ul);
                }
            }
            // Hidden rows of list
            else {
                // Small art icons
                if (global_ArtIconSize == "small") {
                    $(ul).attr('class', 'albumDisplay');
                    var li = $('<li class="playedHidden"><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').append('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br>' + albumDate);
                    li.appendTo(ul);
                }
                // Large art icons
                else {
                    $(ul).attr('class', 'albumDisplayLarge');
                    var li = $('<li class="playedHidden"><a><img class="' + global_ArtIconShape + '"><br><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').append('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br>' + albumDate);
                    li.appendTo(ul);
                }
            }
            // Artwork 404 handling
            $("." + global_ArtIconShape).bind("error", function () {
                // Replace with default image
                $(this).attr("src", "./graphics/notFound.gif");
            });
            // Increment counter for list items
            counter += 1;
        });
    }

    displayMostPlayed()

    async function displayMostPlayed() {
        // Select all albums from the database by most played
        //var sql = "SELECT album.albumID, artist.artistID, album.albumName, artist.artistName, album.albumCount FROM album INNER JOIN artist ON album.artistID=artist.artistID ORDER BY album.albumCount DESC";
        var sql = "SELECT ROUND(album.albumCount/(SELECT COUNT (track.albumID)+0.0), 5)*((CAST(SUBSTR(album.albumTime, 0, INSTR(album.albumTime, ':'))*60 + SUBSTR(album.albumTime, INSTR(album.albumTime,':')+1, length(album.albumTime))AS FLOAT)/2700)+1) AS ranking, track.artistID, track.albumID, album.albumName, album.albumCount, album.albumTime, artist.artistName FROM track INNER JOIN artist ON track.artistID=artist.artistID INNER JOIN album ON track.albumID=album.albumID GROUP BY track.albumID ORDER BY ranking DESC";
        var rows = await dBase.all(sql);

        // Unordered list to attach list items to
        var ul = $('#ulMostPlayed');
        // Set counter
        var counter = 1;
        // Adjust size of rows to number of columns
        rows.length = totalList;
        rows.forEach((row) => {
            var artworkSource = MUSIC_PATH + row.artistName + "/" + row.albumName + "/folder.jpg?modified=" + modifiedDate;

            var albumLink = "./html/displayalbum.html?album=" + row.albumID + "&artist=" + row.artistID;

            // Create <li> item for each album and append to <ul>
            // First row of list
            if (counter <= totalFirstRow) {
                // Small art icons
                if (global_ArtIconSize == "small") {
                    $(ul).attr('class', 'albumDisplay');
                    var li = $('<li><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').append('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br> No. ' + counter);
                    li.appendTo(ul);
                }
                // Large art icons
                else {
                    $(ul).attr('class', 'albumDisplayLarge');
                    var li = $('<li><a><img class="' + global_ArtIconShape + '"><br><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').append('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br> No. ' + counter);
                    li.appendTo(ul);
                }
            }
            // Hidden rows of list
            else {
                // Small art icons
                if (global_ArtIconSize == "small") {
                    $(ul).attr('class', 'albumDisplay');
                    var li = $('<li class="mostPlayedHidden"><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').append('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br> No. ' + counter);
                    li.appendTo(ul);
                }
                // Large art icons
                else {
                    $(ul).attr('class', 'albumDisplayLarge');
                    var li = $('<li class="mostPlayedHidden"><a><img class="' + global_ArtIconShape + '"><br><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                    li.find('img').attr('src', artworkSource);
                    li.find('a').attr('href', albumLink);
                    li.find('span').append('<br><b>' + row.albumName + '</b><br>' + row.artistName + '<br> No. ' + counter);
                    li.appendTo(ul);
                }
            }
            // Artwork 404 handling
            $("." + global_ArtIconShape).bind("error", function () {
                // Replace with default image
                $(this).attr("src", "./graphics/notFound.gif");
            });
            // Increment counter for list items
            counter += 1;
        });
        // Shuffle tracks
        // Select all trackIDs from track table
        var sql = "SELECT trackID FROM track";
        var tracks = await dBase.all(sql);
        shuffleArray(tracks)
    }

    // If online populate New Releases
    if (connection) {
        $("#spnNewReleases").append('<h1 style="margin-left: 0.0em;"><button id="btnNewReleasesShow"></button> New Album Releases</h1>');
          newReleases();
    }
    
    function newReleases() {
        // Set search dates for last 40 days
        var today = new Date();
        var pastDate = new Date(new Date().setDate(today.getDate() - 60));
        today = today.toISOString().split('T')[0];        
        pastDate = pastDate.toISOString().split('T')[0];

        // If starting up app query Musicbrainz for new releases
        if (global_newReleases.length == 0) {
            newReleasesQuery(today, pastDate).then(processNewReleases);
        }
        else {
            processNewReleases();
        }

        // Function to send ajax query to Musicbrainz server to get list of new releases
        function newReleasesQuery(today, pastDate) {
            // Artist search url
            var url = musicbrainzUrl + "release/?query=date:[" + pastDate + " TO " + today + "] AND country:(XE OR GB) AND format:cd"
            // Encode url
            var encodedUrl = encodeURI(url);
            return $.ajax({
                url: encodedUrl,
                error: function (textStatus) {
                    ajaxError(textStatus.statusText, textStatus.status, url)
                }
            });
        }

        // Function to process data recieved from Musicbrainz or already stored in global variable
        function processNewReleases(xml) {
            // Variable for New Releases list
            var newReleases = [];
            var ul = $('#ulNewReleases');
            var counter = 1;

            // If global_newReleases is empty populate from xml file
            if (global_newReleases.length == 0) {
                $(xml).find('release').each(function () {
                    var $release = $(this);
                    var releaseGroupId = $release.find('release-group').attr('id');
                    var releaseTitle = $release.find('title').eq(0).text();
                    var artistName = $release.find('name').eq(0).text();
                    var releaseDate = $release.find('date').eq(0).text();
                    var releaseType = $release.find('release-group').attr('type');
                    // Populate newReleases array
                    newReleases.push({ id: releaseGroupId, type: releaseType, date: releaseDate, title: releaseTitle, artist: artistName, artUrl: '' })
                });
                // Sort newReleases into date order
                newReleases.sort(function (a, b) {
                    return new Date(b.date) - new Date(a.date);
                });

                // Remove duplicates from newReleases and add unique array to global_newReleases variable
                const key = 'id';
                global_newReleases = [...new Map(newReleases.map(item => [item[key], item])).values()]
            }

            // Loop through array and populate list of new releases
            global_newReleases.forEach(function (newRelease) {
                if (newRelease.type == "Album" || newRelease.type == "EP") {
                    var elementLength = newRelease.date.length;
                    // Check that a full release date is available
                    if (elementLength == 10) {
                        var searchAlbum = newRelease.title.replace(/\s+/g, '+')
                        var searchArtist = newRelease.artist.replace(/\s+/g, '+')
                        var searchLink = musicYoutubeUrl + 'search?q=album+' + searchAlbum + '+' + searchArtist
                        
                        // Visible first row of new releases
                        if (counter <= totalFirstRow) {
                            // Increment counter for list items
                            counter += 1;
                            // Small art icons
                            if (global_ArtIconSize == "small") {
                                $(ul).attr('class', 'albumDisplay');
                                var li = $('<li><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                                li.find('a').attr('href', searchLink);
                                li.find('a').attr('target', '_blank');
                                li.find('span').append('<b><br>' + newRelease.title + '</b><br>' + newRelease.artist + '<br>' + newRelease.date);
                                li.appendTo(ul);
                            }
                            // Large art icons
                            else {
                                $(ul).attr('class', 'albumDisplayLarge');
                                var li = $('<li><a><img class="' + global_ArtIconShape + '"><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                                li.find('a').attr('href', searchLink);
                                li.find('a').attr('target', '_blank');
                                li.find('span').append('<b><br>' + newRelease.title + '</b><br>' + newRelease.artist + '<br>' + newRelease.date);
                                li.appendTo(ul);
                            }
                        }
                        // Hidden rows of list
                        else {
                            // Small art icons
                            if (global_ArtIconSize == "small") {
                                $(ul).attr('class', 'albumDisplay');
                                var li = $('<li class="newReleasesHidden"><a><img class="' + global_ArtIconShape + '"><span></span></a></li>');
                                li.find('a').attr('href', searchLink);
                                li.find('a').attr('target', '_blank');
                                li.find('span').append('<br><b>' + newRelease.title + '</b><br>' + newRelease.artist + '<br>' + newRelease.date);
                                li.appendTo(ul);
                            }
                            // Large art icons
                            else {
                                $(ul).attr('class', 'albumDisplayLarge');
                                var li = $('<li class="newReleasesHidden"><a><img class="' + global_ArtIconShape + '"><div class="' + overlay + '"><div class="textAlbum"><span></span></div></div></a></li>');
                                li.find('a').attr('href', searchLink);
                                li.find('a').attr('target', '_blank');
                                li.find('span').append('<br><b>' + newRelease.title + '</b><br>' + newRelease.artist + '<br>' + newRelease.date);
                                li.appendTo(ul);
                            }
                        }

                        // Functions to get cover art for new releases
                        // If no cover art URL in array send ajax query
                        if (newRelease.artUrl == '') {
                            coverartQuery(newRelease.id).then(processCoverArt);
                        }
                        // Use cover art URL in array
                        else {
                            li.find('img').attr('src', newRelease.artUrl);
                        }

                        // Ajax call to get URL for cover art
                        function coverartQuery(query) {
                            // Artist search url
                            var url = coverartArchiveUrl + "release-group/" + query
                            return $.ajax({
                                url: url,
                                error: function (request, status, error) {
                                    console.log("COVER ART ERROR :: " + request.responseText);
                                    // If no cover art found remove li and change class of li so it is visible
                                    li.remove();
                                    $('li:nth-child(' + totalFirstRow + ')').removeClass('newReleasesHidden')
                                }
                            });
                        }

                        // Add coverart to list items
                        function processCoverArt(response) {
                            // Get cover art and add thumbnail url
                            coverArt = response['images'][0]['image']
                            coverArt = coverArt.substring(0, coverArt.length - 4);
                            coverArt = coverArt + "-250.jpg";
                            li.find('img').attr('src', coverArt);
                            // Add cover art URL to array
                            newRelease.artUrl = coverArt;
                        }
                    }
                }
            });           
        }
    }

    backgroundChange();
});