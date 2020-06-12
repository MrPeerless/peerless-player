$(document).ready(function () {
    // Declare artist variable
    var artistID = "";

    // Get artist name from hidden field
    artist = $("#hiddenArtistName").text();

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

    // Get Musicbrainz artist ID
    function processDataArtistID(xml) {
        // Get the first artist in xml and check it is match score = 100
        var $artist = $(xml).find('artist').eq(0);
        var matchScore = $artist.attr('ns2:score')

        // Find the 100% artist match
        if (matchScore == "100") {
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
                    discographyDetails = "";
                }
                $("#bioArtistDetails").append(discographyDetails);
            }

            // Search wikipedia for artist page using Musicbrainz ID
            wikiQuery(artistID).done(processWiki);

            // Function to send ajax xml query to Wikipedia server to get wiki page details for artist
            function wikiQuery(query) {
                var queryArtist = query;
                // Send ajax query to wikipedia
                return $.ajax({
                    url: wikiQueryUrl,
                    data: {
                        action: 'query',
                        origin: '*',
                        format: 'xml',
                        generator: 'search',
                        gsrnamespace: '0',
                        gsrlimit: '5',
                        prop: 'info',
                        inprop: 'url',
                        gsrsearch: queryArtist
                    }
                });
            }

            function processWiki(xml) {
                var wikiUrl = $(xml).find('page').attr('fullurl');
                var wikiTitle = $(xml).find('page').attr('title');
                var wikiPageid = $(xml).find('page').attr('pageid');

                // Populate title and add href to wiki link
                $("#bioArtistName").append("Biography for " + wikiTitle);
                $("#bioWikiLink").attr('href', wikiUrl);

                // If nothing found for artist in wikipedia exit
                if (wikiTitle == undefined) {
                    noResult(wikiTitle);
                    return;
                }

                // Remove non alphanumeric characters in artist name variables to check
                var checkArtist = artist.replace(/\W/g, '');
                checkArtist = checkArtist.toLowerCase();
                var checkWikiTitle = wikiTitle.replace(/\W/g, '');
                checkWikiTitle = checkWikiTitle.toLowerCase();

                // Check if artist name appears in the wikiTitle retrieved
                var checkResult = checkWikiTitle.includes(checkArtist);
                if (checkResult == true) {
                    // Search wikipedia for summary text of artist
                    wikiText(wikiTitle).done(processWikiText);

                    // Function to send ajax xml query to Wikipedia server to get wiki page summary for artist
                    function wikiText(query) {
                        var queryTitle = query.replace('&', 'and');
                        var queryTitle = query.replace(' ', '_');

                        // Send ajax query to wikipedia
                        return $.ajax({
                            url: wikiQueryUrl,
                            data: {
                                format: 'xml',
                                action: 'query',
                                prop: 'extracts',
                                exintro: '',
                                redirects: '1',
                                titles: queryTitle
                            }
                        });
                    }

                    function processWikiText(xml) {
                        // Get summary extract from xml
                        var wikiSummaryRaw = $(xml).find('extract').text();
                        var wikiSummary = sanitizeHtml(wikiSummaryRaw);
                        $("#bioText").append(wikiSummary);

                        // Search wikipedia for main image of artist
                        wikiImage(wikiPageid).done(processWikiImage);

                        // Function to send ajax xml query to Wikipedia server to get wiki main image artist
                        function wikiImage(query) {
                            var queryPageid = query;

                            // Send ajax query to wikipedia
                            return $.ajax({
                                url: wikiQueryUrl,
                                data: {
                                    action: 'query',
                                    pageids: queryPageid,
                                    prop: 'pageprops',
                                    format: 'xml'
                                }
                            });
                        }

                        function processWikiImage(xml) {
                            // Get file name of main image
                            var wikiImageFile = $(xml).find('pageprops').attr('page_image_free')
                            if (wikiImageFile == undefined) {
                                $("#imgBioArtwork").css("display", "none");
                                return;
                            }

                            // Search wikipedia for full image url
                            wikiImageUrl(wikiImageFile).done(displayWikiImage);

                            // Function to send ajax xml query to Wikipedia server to get full url of main image
                            function wikiImageUrl(query) {
                                var queryImageUrl = query;

                                // Send ajax request to wikipedia
                                return $.ajax({
                                    url: wikiQueryUrl,
                                    data: {
                                        action: 'query',
                                        titles: 'Image:' + queryImageUrl,
                                        prop: 'imageinfo',
                                        iiprop: 'url',
                                        format: 'xml'
                                    }
                                });
                            }

                            function displayWikiImage(xml) {
                                // Get image url from xml file
                                var wikiImage = $(xml).find('ii').attr('url');
                                // Split the file name off the end of the URL
                                var splitFilename = wikiImage.split("/");
                                var imageFilename = splitFilename[splitFilename.length - 1];
                                // Add thumb/ into URL
                                wikiThumbImage = [wikiImage.slice(0, 47), "thumb/", wikiImage.slice(47)].join('');
                                // Add thumbnail size and filename at end of URL
                                wikiThumbImage = wikiThumbImage + "/600px-" + imageFilename
                                // Display image in page
                                $("#imgBioArtwork").attr('src', wikiThumbImage);
                                // Populate hidden element with URL to use to enlarge image
                                $("#bioArtworkUrl").text(wikiThumbImage);
                            }
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
                    noResult(wikiTitle);
                }
            }
        }
    }

    function noResult(query) {
        // Display modal box if no artistID found in Musicbrainz database
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br><b>" + artist + "</b> not found in biography database.<br>&nbsp</p>");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        $('.background').css('filter', 'blur(5px)');
        // Hide discography page and go back
        $("#divTrackListing").css("display", "none");
        $("#divContent").css("width", "auto");
        console.log("wikiTitle = " + query)        
        return;
    }

    backgroundChange();
});


/*
 Link to get all URLs of images on wiki page to create artist gallery
 REQUEST URL:
 https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&generator=images&format=xml&titles=adele
 EXAMPLE IMAGE URL RETURNED:
 https://upload.wikimedia.org/wikipedia/commons/4/42/ADELE_LIVE_2017_at_ADELAIDE_OVAL_-_Sweet_Devotion.jpg
 EXAMPLE GET 600px THUMBNAIL OF IMAGE:
 https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/ADELE_LIVE_2017_at_ADELAIDE_OVAL_-_Sweet_Devotion.jpg/600px-ADELE_LIVE_2017_at_ADELAIDE_OVAL_-_Sweet_Devotion.jpg

 Add /thumb after /commons and after filename of image /600px-repeat filename
 */