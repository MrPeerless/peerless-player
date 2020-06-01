$(document).ready(function () {
    // Declare artist variable
    var artist;
    var artistID = "";

    // Get artist name from hidden field
    artist = $("#hiddenArtistName").text();

    // Display heading with artist name
    $("#discographyArtistName").append("Discography of Albums by " + artist);

    // variable for Discog table
    var table = $("#tblDiscog")

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
            url: encodedUrl
        });
    }

    // Function to process data from received xml file searching for artistID
    function processDataArtistID(xml) {
        var discographyDetails = "";
        var $artist = $(this);
        var matchScore = $artist.attr('ns2:score')

        // Get the first artist in xml and check it is match score = 100
        var $artist = $(xml).find('artist').eq(0);
        var matchScore = $artist.attr('ns2:score')

        // Find the 100% artist match
        if (matchScore == "100") {
            var artistName = $artist.find('name').eq(0).text();
            artistID = $artist.attr("id");
            var type = $artist.attr('type')
            var begin = $artist.find('begin').text();
            var end = $artist.find('end').text();

            // Check if artist name is in xml result
            var checkArtist = artist.replace(/\W/g, '');
            checkArtist = checkArtist.toLowerCase();
            var checkArtistName = artistName.replace(/\W/g, '');
            checkArtistName = checkArtistName.toLowerCase();

            // Check if artist name appears in the xml artist name retrieved
            var checkResult = checkArtistName.includes(checkArtist);
            // If checkResult is false exit
            if (checkResult == false) {
                noResult();
                return;
            }

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
                    discographyDetails = "";
                }
                $("#discographyDetails").append(discographyDetails);
            }
        }         

        // Check if at musicbrainz ID has been found
        if (artistID != "") {
            // Call ajax function artistIDQuery
            artistReleaseQuery(artistID).done(processDataRelease);

            // Function to send ajax xml query to Musicbrainz server
            function artistReleaseQuery(query) {
                console.log(query)
                var queryArtistID = query;
                // Artist serach url
                var url = musicbrainzUrl + "release-group?artist=" + queryArtistID + "&limit=100&type=album"
                return $.ajax({
                    url: url
                });
            }

            // Function to process data from received xml file searching for artistID
            function processDataRelease(xml) {
                // Get number of releases from xml file
                var $releaseCount = $(xml).find('release-group-list');
                var count = $releaseCount.attr('count')
                var checkCount = parseInt(count)
                if (checkCount > 100) {
                    count = "100";
                }

                // Dsiplay number of albums found
                $("#discographyCount").append(count + " albums found. Click album name to search for more details.");

                // Check if any albums found
                if (count != "0") {
                    // Loop through each release-group and get data
                    $(xml).find('release-group').each(function () {
                        var $release = $(this);
                        var type = $release.attr('type')
                        var title = $release.find('title').text();
                        var date = $release.find('first-release-date').text();
                        // If type is Album link to Napster for samples
                        if (type == "Album") {
                            var albumLink = napsterUrl + artist + "+" + title;
                        }
                        // Anything else link to Google for a search result
                        else {
                            var albumLink = googleUrl + artist + "+" + title;
                        }
                        var encodedUrl = encodeURI(albumLink);

                        // Create table row
                        var tableRow = $("<tr><td><a href='" + encodedUrl + "' target='_blank'>" + title + "</a></td><td>" + date + "</td><td>" + type + "</td>");
                        // Append row to table
                        tableRow.appendTo(table);
                    });
                }
                else {
                    noResult();
                    return;
                }
            }
            // Artist Links
            $("#bioArtistLink").append(artist + " Links")

            // Call ajax function artistLinksQuery
            artistLinksQuery(artistID).done(processLinksQuery);

            // Function to send ajax xml query to Musicbrainz server to get URLs
            function artistLinksQuery(query) {
                var queryArtist = query;
                var url = musicbrainzUrl + "artist/" + queryArtist + "?inc=url-rels"
                // Send ajax request to musicbrainz
                return $.ajax({
                    url: url
                });
            }

            // Process response from Musicbrainz of URLs
            function processLinksQuery(xml) {
                console.log(xml)
                // Declare variables for URLs
                var homepageUrl = "";
                var youtubeUrl = "";
                var discogsUrl = "";
                var lastfmUrl = "";
                var twitterUrl = ""
                var instagramUrl = ""
                var facebookUrl = "";

                // Set social media icons
                switch (global_Background) {
                    // Skindark
                    case "#111111":
                        var homepageIcon = "./graphics/socialmedia/homepage_white.png";
                        var bandcampIcon = "./graphics/socialmedia/bandcamp_white.png";
                        var facebookIcon = "./graphics/socialmedia/facebook_blue.png";
                        var twitterIcon = "./graphics/socialmedia/twitter_blue.png";
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
                        var twitterIcon = "./graphics/socialmedia/twitter_blue.png";
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
                        var twitterIcon = "./graphics/socialmedia/twitter_blue.png";
                        var instagramIcon = "./graphics/socialmedia/instagram_white.png";
                        var discogsIcon = "./graphics/socialmedia/discogs_white.png";
                        var youtubeIcon = "./graphics/socialmedia/youtube_red.png";
                        var lastfmIcon = "./graphics/socialmedia/lastfm_red.png";
                }

                // Variable for links list
                var ul = $('#ulLinks');

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
                        if (checkUrl.includes("twitter") && twitterUrl == "") {
                            twitterUrl = checkUrl;
                            var li = $('<li><a><img><span></span></a></li>');
                            li.find('img').attr('src', twitterIcon);
                            li.find('a').attr('href', twitterUrl);
                            li.find('a').attr('target', '_blank');
                            li.find('span').append('<br>Twitter<br>');
                            li.appendTo(ul);
                        }
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
        }
        else {
            noResult();
            return;
        }
    }
    function noResult() {
        // Display modal box if no artistID found in Musicbrainz database
        $('#okModal').css('display', 'block');
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br><b>" + artist + "</b> not found in discography database.<br>&nbsp</p>");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        // Hide discography page and go back
        $("#divTrackListing").css("display", "none");
        $("#divContent").css("width", "auto");
        window.history.back();
    }

    backgroundChange();

});