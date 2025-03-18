$(function () {
    // Declare artist variable
    var artistID = "";
    var wikiID;

    // Set expanded text to false
    global_BioTextExpand = false;

    // Get artist name from hidden field
    var artist = $("#hiddenArtistName").text();

    // Display modal box checking wikipedia database
    $('#okModal').css('display', 'block');
    $('.modalHeader').empty();
    $('#okModalText').empty();
    $(".modalFooter").empty();
    $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
    $('#okModalText').append("<div class='modalIcon'><img src='./graphics/record.gif'></div><p>&nbsp<br>Retrieving information from wikidata.org. Please wait.<br>&nbsp<br>&nbsp</p >");
    var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
    $('.modalFooter').append(buttons);
    $("#btnOkModal")[0].focus();
    $('.background').css('filter', 'blur(5px)');

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
                ajaxError(textStatus.statusText, textStatus.status, url)
            }
        });
    }

    // Function to process data from received xml file searching for artistID
    function processDataArtistID(xml) {
        var biographyDetails = "";
        var artistFound = false;
        $(xml).find('artist').each(function () {
            var $artist = $(this);
            var matchScore = Number($artist.attr('ns2:score'))
            if (matchScore >= "90") {
                var artistName = $artist.find('name').eq(0).text();
                artistID = $artist.attr("id");

                // Check if artist name is in xml result
                var checkArtist = artist.replace(/\W/g, '');
                checkArtist = checkArtist.toLowerCase();
                var checkArtistName = artistName.replace(/\W/g, '');
                checkArtistName = checkArtistName.toLowerCase();

                // Check if artist names match
                if (checkArtistName == checkArtist) {
                    artistFound = true;
                    global_TrackListing = false;
                    var artistName = $artist.find('name').eq(0).text();
                    artistID = $artist.attr("id");
                    var type = $artist.attr('type')
                    var begin = $artist.find('begin').text();
                    var end = $artist.find('end').text();

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
                                biographyDetails = "Alive from " + begin + " to " + end + ". Aged " + age + ".";
                            }
                            else {
                                biographyDetails = "Alive from " + begin + " to " + end + ".";
                            }
                        }
                        // Details if type is group
                        else if (type == "Group") {
                            biographyDetails = "Recording from " + begin + " to " + end + ".";
                        }
                        // Details if no type
                        else {
                            biographyDetails = " * ";
                        }
                        $("#bioArtistDetails").append(biographyDetails);

                        if (artistID != "") {
                            // Call ajax function artistLinksQuery
                            artistLinksQuery(artistID).done(processLinksQuery);
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
                                var wikidata = "";
                                // Loop through each relation in xml
                                $(xml).find('relation').each(function () {
                                    var $link = $(this);
                                    var linkType = $link.attr('type')
                                    if (linkType == "wikidata") {
                                        wikidata = $link.find('target').text();
                                    }
                                });
                                wikidata = wikidata.split("wiki/");
                                wikiID = wikidata[1];
                                // Call ajax function wikiUrlQuery
                                wikiUrlQuery(wikiID).done(processWikiUrlQuery);

                                // Function to send ajax xml query to Wikidata server to get URLs
                                function wikiUrlQuery(query) {
                                    var queryWikiID = query;
                                    var url = 'https://www.wikidata.org/w/api.php?'
                                    // Send ajax query to wikipedia
                                    return $.ajax({
                                        url: url,
                                        data: {
                                            action: 'wbgetentities',
                                            format: 'xml',
                                            props: 'sitelinks/urls',
                                            sitefilter: 'enwiki',
                                            ids: queryWikiID
                                        },
                                        error: function (textStatus) {
                                            ajaxError(textStatus.statusText, textStatus.status, url)
                                        }
                                    });
                                }

                                function processWikiUrlQuery(xml) {
                                    var $pageTitle = $(xml).find('sitelink');
                                    var wikiTitle = $pageTitle.attr('title');

                                    // Search wikipedia for summary text of artist
                                    wikiText(wikiTitle).done(processWikiText);

                                    // Function to send ajax xml query to Wikipedia server to get wiki page summary for artist
                                    function wikiText(query) {
                                        // Send ajax query to wikipedia
                                        return $.ajax({
                                            url: wikiQueryUrl,
                                            data: {
                                                format: 'xml',
                                                action: 'query',
                                                prop: 'extracts',
                                                //exintro: '', use this option to just get opening summary paragraph
                                                redirects: '1',
                                                titles: query,
                                            },
                                            error: function (textStatus) {
                                                ajaxError(textStatus.statusText, textStatus.status, wikiQueryUrl)
                                            }
                                        });
                                    }

                                    function processWikiText(xml) {
                                        // Get summary extract from xml
                                        var wikiSummary = $(xml).find('extract').text();
                                        var wikiPageid = $(xml).find('page').attr('pageid');
                                        var wikiTitle = $(xml).find('page').attr('title');
                                        // Populate title and add href to wiki link
                                        $("#bioArtistName").append("Biography for " + wikiTitle);

                                        // If nothing found for artist in wikipedia exit
                                        if (wikiTitle == undefined) {
                                            noResult(wikiTitle);
                                            return;
                                        }

                                        // Split the text at end of summmary
                                        var splitExtract1 = wikiSummary.substr(0, wikiSummary.indexOf('<h2'));
                                        var splitExtract2 = wikiSummary.substr(wikiSummary.indexOf('<h2'));
                                        // Split off from Discography
                                        var splitExtractHidden = splitExtract2.split('<h2 id="Discography');
                                        // If the second half of the split is empty try looking for the H3 tag instead
                                        if (splitExtractHidden[1] == "") {
                                            splitExtractHidden = splitExtract2.split('<h3 id="Discography');
                                        }
                                        $("#bioText").append(splitExtract1);
                                        // If no hidden text hide the Read More button
                                        if (splitExtractHidden[0] == "") {
                                            $("#bioReadMore").css("display", "none");
                                        }
                                        $("#bioTextHidden").append(splitExtractHidden[0]);

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
                                                    prop: 'pageprops|pageterms',
                                                    format: 'xml'
                                                },
                                                error: function (textStatus) {
                                                    ajaxError(textStatus.statusText, textStatus.status, wikiQueryUrl)
                                                }
                                            });
                                        }

                                        function processWikiImage(xml) {
                                            // Get file name of main image  
                                            var wikiImageFile = $(xml).find('pageprops').attr('page_image_free')
                                            // Get artist description
                                            var wikiDescription = $(xml).find('description').text();
                                            // Capitalise first letter of wikiDescription string
                                            if (wikiDescription) {
                                                var description = wikiDescription[0].toUpperCase() + wikiDescription.slice(1);
                                                $("#bioDescription").append(description)
                                            }

                                            if (wikiImageFile == undefined) {
                                                wikiImageFile = $(xml).find('pageprops').attr('page_image')
                                                if (wikiImageFile == undefined) {
                                                    $("#imgBioArtwork").css("display", "none");
                                                    return;
                                                }
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
                                                    },
                                                    error: function (textStatus) {
                                                        ajaxError(textStatus.statusText, textStatus.status, wikiQueryUrl)
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

                                                // Check if url for thumb image exists by calling function
                                                urlExists(wikiThumbImage, function (exists) {
                                                    if (exists == true) {
                                                        // Use the thumbnailed image as it exists
                                                        // Display image in page
                                                        $("#imgBioArtwork").attr('src', wikiThumbImage);
                                                        // Populate hidden element with URL to use to enlarge image
                                                        $("#bioArtworkUrl").text(wikiThumbImage);
                                                    }
                                                    else {
                                                        // No thumbnailed image so use original size image
                                                        $("#imgBioArtwork").attr('src', wikiImage);
                                                        // Populate hidden element with URL to use to enlarge image
                                                        $("#bioArtworkUrl").text(wikiImage);
                                                    }
                                                });
                                            }
                                        }
                                    }
                                    // Hide modal box
                                    $('#okModal').css('display', 'none');
                                    $('.background').css('filter', 'blur(0px)');
                                    // Display WikiData logo depending on which skin is selected
                                    if (global_Background == "#eeeeee") {
                                        $(".wikiDataLogo").attr('src', './graphics/wikiData_black.png');
                                    }
                                    else {
                                        $(".wikiDataLogo").attr('src', './graphics/wikiData_white.png');
                                    }
                                    // Append X to close button here so that its position adjusts to scrollbars
                                    $("#btnClose").empty();
                                    $("#btnClose").append("&times;");
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
                                    $("#divBio").css("width", winWidth - (divSidemenu + divContentWidth)); 
                                }
                            }
                        }
                    }
                    // No information found on Musicbrainz
                    else {
                        noResult();
                    }
                    return false;
                }
            }
        });
        if (artistFound == false) {
            noResult();
        }
    }

    function noResult(query) { 
        // Hide modal box
        $('#okModal').css('display', 'none');
        $('.background').css('filter', 'blur(0px)');
        // Display modal box if no artistID found in Musicbrainz database
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br><b>" + artist + "</b> not found in wikidata database.<br>&nbsp<br>&nbsp</p>");
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