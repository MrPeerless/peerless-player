// Get artist name from hidden field
var artist = "";
var artistID = "";

$(document).on('click', '#btnLinks', function (event) {
    event.preventDefault();
    // Check if online
    var connection = navigator.onLine;
    if (connection) {
        artist = $("#hiddenArtistName").text();
        // Call ajax function artistIDQuery
        artistIDQuery(artist).done(processDataArtistID);
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
        $("#btnOkModal")[0].focus();
        $('.background').css('filter', 'blur(5px)');
        return
    }
});

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
function processDataArtistID(xml) {
    var checkResult = false;
    $(xml).find('artist').each(function () {
        var $artist = $(this);
        var matchScore = Number ($artist.attr('ns2:score'))
        if (matchScore >= "90") {
            var artistName = $artist.find('name').eq(0).text();            

            // Check if artist name is in xml result
            var checkArtist = artist.replace(/\W/g, '');
            checkArtist = checkArtist.toLowerCase();

            var checkArtistName = artistName.replace(/\W/g, '');
            checkArtistName = checkArtistName.toLowerCase();

            // Check if artist name appears in the xml artist name retrieved
            checkResult = checkArtistName.includes(checkArtist);
            // If checkResult is false exit
            if (checkResult == true) {
                artistID = $artist.attr("id");
                // Call ajax function artistLinksQuery
                artistLinksQuery(artistID).done(processLinksQuery);
                return false;
            }
        }
    });
    if (!checkResult) {
        // Display modal box if no artistID found in Musicbrainz database
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br><b>" + artist + "</b> not found in links database.<br>&nbsp<br>&nbsp</p>");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal")[0].focus();
        $('.background').css('filter', 'blur(5px)');
    }
}

// Function to send ajax xml query to Musicbrainz server to get URLs
function artistLinksQuery(query) {
    var queryArtist = query;
    var url = musicbrainzUrl + "artist/" + queryArtist + "?inc=url-rels"
    // Send ajax request to musicbrainz
    return $.ajax({
        url: url,
        error: function (textStatus) {
            ajaxError(textStatus.statusText, textStatus.status, url)
        }
    });
}

// Process response from Musicbrainz of URLs
function processLinksQuery(xml) {
    // Declare variables for URLs
    var homepageUrl = "";
    var youtubeUrl = "";
    var discogsUrl = "";
    var lastfmUrl = "";
    var instagramUrl = ""
    var facebookUrl = "";

    // Set social media icons
    switch (global_Background) {
        // Skindark
        case "#222222":
            var homepageIcon = "./graphics/socialmedia/homepage_white.png";
            var bandcampIcon = "./graphics/socialmedia/bandcamp_white.png";
            var facebookIcon = "./graphics/socialmedia/facebook_blue.png";
            var instagramIcon = "./graphics/socialmedia/instagram_white.png";
            var discogsIcon = "./graphics/socialmedia/discogs_white.png";
            var youtubeIcon = "./graphics/socialmedia/youtube_red.png";
            var lastfmIcon = "./graphics/socialmedia/lastfm_red.png";
            break;
        // Skinlight
        case "#eeeeee":
            var homepageIcon = "./graphics/socialmedia/homepage_black.png";
            var bandcampIcon = "./graphics/socialmedia/bandcamp_black.png";
            var facebookIcon = "./graphics/socialmedia/facebook_blue.png";
            var instagramIcon = "./graphics/socialmedia/instagram_black.png";
            var discogsIcon = "./graphics/socialmedia/discogs_black.png";
            var youtubeIcon = "./graphics/socialmedia/youtube_red.png";
            var lastfmIcon = "./graphics/socialmedia/lastfm_red.png";
            break;
        // Skinblue
        case "#0c4586":
            var homepageIcon = "./graphics/socialmedia/homepage_white.png";
            var bandcampIcon = "./graphics/socialmedia/bandcamp_white.png";
            var facebookIcon = "./graphics/socialmedia/facebook_blue.png";
            var instagramIcon = "./graphics/socialmedia/instagram_white.png";
            var discogsIcon = "./graphics/socialmedia/discogs_white.png";
            var youtubeIcon = "./graphics/socialmedia/youtube_red.png";
            var lastfmIcon = "./graphics/socialmedia/lastfm_red.png";
    }

    // Variable for links list
    $('#ulLinks').empty();
    var ul = $('#ulLinks');
    $('#bioArtistLink').empty();
    $("#bioArtistLink").append(artist + " Links")
    $("#linksCredits").empty();
    $("#linksCredits").text("Data supplied by MusicBrainz.org")
    $("#linksMusicBrainzLogo").attr('src', './graphics/metaBrainz_logo.png');

    // Loop through each relation in xml
    $(xml).find('relation').each(function () {
        var $link = $(this);
        var linkType = $link.attr('type')

        if (linkType == "official homepage" && homepageUrl == "") {
            homepageUrl = $link.find('target').text();
            var li = $('<li><a><img><span></span></a></li>');
            li.find('img').attr('src', homepageIcon);
            li.find('a').attr('href', homepageUrl);
            li.find('a').attr('target', '_blank');
            li.find('span').append('<br>Homepage<br>');
            li.appendTo(ul);
        }
        if (linkType == "youtube" && youtubeUrl == "") {
            youtubeUrl = $link.find('target').text();
            var li = $('<li><a><img><span></span></a></li>');
            li.find('img').attr('src', youtubeIcon);
            li.find('a').attr('href', youtubeUrl);
            li.find('a').attr('target', '_blank');
            li.find('span').append('<br>YouTube<br>');
            li.appendTo(ul);
        }
        if (linkType == "discogs" && discogsUrl == "") {
            discogsUrl = $link.find('target').text();
            var li = $('<li><a><img><span></span></a></li>');
            li.find('img').attr('src', discogsIcon);
            li.find('a').attr('href', discogsUrl);
            li.find('a').attr('target', '_blank');
            li.find('span').append('<br>Discogs<br>');
            li.appendTo(ul);
        }
        if (linkType == "last.fm" && lastfmUrl == "") {
            lastfmUrl = $link.find('target').text();
            var li = $('<li><a><img><span></span></a></li>');
            li.find('img').attr('src', lastfmIcon);
            li.find('a').attr('href', lastfmUrl);
            li.find('a').attr('target', '_blank');
            li.find('span').append('<br>Last FM<br>');
            li.appendTo(ul);
        }
        if (linkType == "bandcamp" && lastfmUrl == "") {
            lastfmUrl = $link.find('target').text();
            var li = $('<li><a><img><span></span></a></li>');
            li.find('img').attr('src', bandcampIcon);
            li.find('a').attr('href', lastfmUrl);
            li.find('a').attr('target', '_blank');
            li.find('span').append('<br>Bandcamp<br>');
            li.appendTo(ul);
        }
        if (linkType == "social network") {
            var checkUrl = $link.find('target').text();
            if (checkUrl.includes("instagram") && instagramUrl == "") {
                instagramUrl = checkUrl;
                var li = $('<li><a><img><span></span></a></li>');
                li.find('img').attr('src', instagramIcon);
                li.find('a').attr('href', instagramUrl);
                li.find('a').attr('target', '_blank');
                li.find('span').append('<br>Instagram<br>');
                li.appendTo(ul);
            }
            if (checkUrl.includes("facebook") && facebookUrl == "") {
                facebookUrl = checkUrl;
                var li = $('<li><a><img><span></span></a></li>');
                li.find('img').attr('src', facebookIcon);
                li.find('a').attr('href', facebookUrl);
                li.find('a').attr('target', '_blank');
                li.find('span').append('<br>Facebook<br>');
                li.appendTo(ul);
            }
        }
    });
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