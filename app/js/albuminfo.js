$(document).ready(function () {
    // Get artist name from hidden field in artistalbums.html
    var artist = $("#hiddenArtistName").text();
    // Remove any apostrophes and replace with a space
    artist = artist.replace(/'/g, ' ');
    // Remove all but alpha-numeric characters and spaces
    artist = artist.replace(/[^\w\s]/gi, '');

    // Get album name from hidden field in artistalbums.html
    var album = $("#hiddenAlbumName").text();

    // Call function to display album details and art
    displayAlbumInfo()

    async function displayAlbumInfo() {
        // Select the album details from database
        var sql = "SELECT track.trackID, track.artistID, track.albumID, track.trackName, track.fileName, track.playTime, track.count, track.lastPlay, track.genre2, track.genre3, track.favourite, artist.artistName, album.albumName, album.genreID, album.releaseDate, album.albumTime, album.dateAdd, album.albumLastPlay, genre.genreName FROM track INNER JOIN artist ON track.artistID=artist.artistID INNER JOIN album ON track.albumID=album.albumID INNER JOIN genre ON album.genreID=genre.genreID WHERE track.albumID=? ORDER by track.trackName ASC";

        var rows = await dBase.all(sql, global_AlbumID);

        // Get folder.jpg file path
        try {
            var modifiedDate = Date().toLocaleString();
            var artworkSource = MUSIC_PATH + rows[0].artistName + "/" + rows[0].albumName + "/folder.jpg?modified=" + modifiedDate;
        }
        catch{
            var artworkSource = "./graphics/notFound.gif"
        }
        $("#imgInfoArtwork").attr('src', artworkSource);

        // Create text for full genre list for album
        var genreText = rows[0].genreName;
        if (rows[0].genreName != rows[0].genre2) {
            genreText = genreText + " - " + rows[0].genre2;
        }
        if (rows[0].genre2 != rows[0].genre3) {
            genreText = genreText + " - " + rows[0].genre3;
        }

        var albumLastPlay = formatDate(rows[0].albumLastPlay);
        // If album never played update variable with never else last play date
        var lastPlayed;
        if (albumLastPlay == null) {
            lastPlayed = "Never";
        }
        else {
            lastPlayed = albumLastPlay;
        }

        var albumDetails = " Released " + rows[0].releaseDate + "<br>Play time " + rows[0].albumTime + "<br>Last Played " + lastPlayed + "<br>";
        $("#displayInfoAlbumName").append(rows[0].albumName + " <br>by " + rows[0].artistName);
        $("#displayInfoAlbumDetails").append(albumDetails + genreText);
    }

    // Display modal box checking wikipedia database
    $('#okModal').css('display', 'block');
    $('.modalHeader').empty();
    $('#okModalText').empty();
    $(".modalFooter").empty();
    $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
    $('#okModalText').append("<div class='modalIcon'><img src='./graphics/record.gif'></div><p>&nbsp<br>Retrieving information from wikidata.org. Please wait.<br>&nbsp<br>&nbsp</p >");
    var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
    $('.modalFooter').append(buttons);
    $("#btnOkModal").focus();
    $('.background').css('filter', 'blur(5px)');

    // Search wikipedia for album page using artist name in text and album name in title
    wikiAlbumQuery().done(processWikiAlbum);

    // Function to send ajax xml query to Wikipedia server to get wiki page details for album
    function wikiAlbumQuery() {
        // Check if artist name has spaces in it and use search with quotes around artist name
        if (/\s/.test(artist)) {
            // Send ajax query to wikipedia
            return $.ajax({
                url: wikiQueryUrl,
                data: {
                    action: 'query',
                    origin: '*',
                    format: 'xml',
                    generator: 'search',
                    gsrnamespace: '0',
                    gsrlimit: '1',
                    prop: 'info',
                    inprop: 'url',
                    gsrsearch: '"' + artist + '" intitle:"' + album + '" album'
                },
                error: function (textStatus) {
                    ajaxError(textStatus.statusText, textStatus.status, wikiQueryUrl)
                }
            });
        }
        else {
            // If artist name is single word use search without quotes (with quotes sometines doesn't find correct page)
            // Send ajax query to wikipedia
            return $.ajax({
                url: wikiQueryUrl,
                data: {
                    action: 'query',
                    origin: '*',
                    format: 'xml',
                    generator: 'search',
                    gsrnamespace: '0',
                    gsrlimit: '1',
                    prop: 'info',
                    inprop: 'url',
                    gsrsearch: artist + ' intitle:"' + album + '" album'
                },
                error: function (textStatus) {
                    ajaxError(textStatus.statusText, textStatus.status, wikiQueryUrl)
                }
            });
        }
    }

    function processWikiAlbum(xml) {
        var wikiPageid = $(xml).find('page').attr('pageid');
        // If nothing found for album in wikipedia exit
        if (wikiPageid == undefined) {
            noResult();
            return;
        }
        // Search wikipedia for text of album
        wikiAlbumText(wikiPageid).done(processWikiAlbumText);

        // Function to send ajax xml query to Wikipedia server to get wiki page for album
        function wikiAlbumText(query) {
            queryWikiPageID = query;
            // Send ajax query to wikipedia
            return $.ajax({
                url: wikiQueryUrl,
                data: {
                    format: 'xml',
                    action: 'query',
                    prop: 'extracts',
                    redirects: '1',
                    pageids: queryWikiPageID
                },
                error: function (textStatus) {
                    ajaxError(textStatus.statusText, textStatus.status, wikiQueryUrl)
                }
            });
        }

        function processWikiAlbumText(xml) {
            // Get summary extract from xml
            var wikiSummaryRaw = $(xml).find('extract').text();
            // Check if correct page found by checing first word in wiki extract matches first word in album title
            // Get first word of wiki extract
            var splitExtract1 = wikiSummaryRaw.split("</b>");
            var splitExtract2 = splitExtract1[0].split("<b>");
            var splitExtract3 = splitExtract2[1].split(" ");

            // If text contains <span>, remove
            splitExtract3[0] = splitExtract3[0].replace('<span>', "");
            // If text contains </span>, remove
            splitExtract3[0] = splitExtract3[0].replace('</span>', "");
            // Remove all but alpha-numeric characters
            splitExtract3[0] = splitExtract3[0].replace(/\W/g, '');
            // Convert to lowercase
            splitExtract3[0] = splitExtract3[0].toLowerCase();

            // Get first word of album title
            var splitAlbum = album.split(" ");
            // Remove all but alpha-numeric characters
            splitAlbum[0] = splitAlbum[0].replace(/\W/g, '');
            // Convert to lowercase
            splitAlbum[0] = splitAlbum[0].toLowerCase();

            // Check if first words match
            if (splitAlbum[0] == splitExtract3[0]) {
                // Split at start of track listing
                var splitExtract = wikiSummaryRaw.split('<h2><span id="Track_list');
                // Split at start of accolades
                var splitExtract1 = splitExtract[0].split('<h3><span id="Accolades');

                $("#albumInfoText").append(splitExtract1[0]);
                // Hide modal box
                $('#okModal').css('display', 'none');
                $('.background').css('filter', 'blur(0px)');
            }
            else {
                noResult();
                return;
            }
        }
    }

    function noResult() {
        // Hide please wait modal box
        $('#okModal').css('display', 'none');
        $('.background').css('filter', 'blur(0px)');
        // Display modal box if no album found in wikidata database
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br><b>" + album + "</b> not found in wikidata database.<br>&nbsp<br>&nbsp</p>");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        $('.background').css('filter', 'blur(5px)');
        // Go back to track listing page for album
        $('#divTrackListing').load("./html/displayalbum.html?artist=" + global_ArtistID + "&album=" + global_AlbumID);
        return;
    }

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

    backgroundChange();

    
});