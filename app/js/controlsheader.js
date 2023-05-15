// Underline Home in menu on startup
$("#menuHome").css('textDecoration', 'underline');

//#######################################
// Click events from menu in main process
//#######################################
ipcRenderer.on('Previous Track', (event) => {
    btnPreviousClick()
});

ipcRenderer.on('Rewind', (event) => {
    $("#audio1").prop("currentTime", $("#audio1").prop("currentTime") - 5);
});

ipcRenderer.on('Play/Stop', (event) => {
    btnPlayClick()
});

ipcRenderer.on('Pause', (event) => {
    btnPauseClick()
});

ipcRenderer.on('Fast Forward', (event) => {
    $("#audio1").prop("currentTime", $("#audio1").prop("currentTime") + 5);
});

ipcRenderer.on('Next Track', (event) => {
    btnNextClick()
});

ipcRenderer.on('Shuffle', (event) => {
    btnShuffleClick()
});

ipcRenderer.on('New Music Releases', (event) => {
    btnNewReleases()
});

// Pi-Player Menu
ipcRenderer.on('Pi-Player Settings', (event) => {
    $("#divTrackListing").css("display", "none");
    $("#divContent").css("width", "auto");
    $('#divContent').load('./html/settings.html#piPlayerSettings', function () {
        $('html, body').animate({ scrollTop: $("#piPlayerSettings").offset().top - 70 }, "slow");
    });
});

//global_piIpAddress
//global_piUserName
//global_piPassword

// Reboot Pi-Player
ipcRenderer.on('Reboot Pi-Player', (event) => {
    // Display modal box; reboot yes, no?
    $('#okModal').css('display', 'block');
    $('.modalHeader').empty();
    $('#okModalText').empty();
    $(".modalFooter").empty();
    $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
    $('#okModalText').append("<div class='modalIcon'><img src='./graphics/question.png'></div><p>&nbsp<br>Are you sure you want to reboot your Raspberry Pi?<br>&nbsp<br>&nbsp</p >");
    var buttons = $("<button class='btnContent' id='btnRebootPi'>Yes</button> <button class='btnContent' id='btnCancelModal'>No</button>");
    $('.modalFooter').append(buttons);
    $("#btnRebootPi").focus();
    $('.background').css('filter', 'blur(5px)');
});

$(document).on('click', '#btnRebootPi', function () {
    $('#okModal').css('display', 'none');
    $('.background').css('filter', 'blur(0px)');
    ipcRenderer.send("shell_command", ['sudo reboot\n', global_piIpAddress, global_piUserName, global_piPassword]);
})

// Shutdown Pi-Player
ipcRenderer.on('Shutdown Pi-Player', (event) => {
    // Display modal box; shutdown yes, no?
    $('#okModal').css('display', 'block');
    $('.modalHeader').empty();
    $('#okModalText').empty();
    $(".modalFooter").empty();
    $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
    $('#okModalText').append("<div class='modalIcon'><img src='./graphics/question.png'></div><p>&nbsp<br>Are you sure you want to shutdown your Raspberry Pi?<br>&nbsp<br>&nbsp</p >");
    var buttons = $("<button class='btnContent' id='btnShutdownPi'>Yes</button> <button class='btnContent' id='btnCancelModal'>No</button>");
    $('.modalFooter').append(buttons);
    $("#btnShutdownPi").focus();
    $('.background').css('filter', 'blur(5px)');
});

$(document).on('click', '#btnShutdownPi', function () {
    $('#okModal').css('display', 'none');
    $('.background').css('filter', 'blur(0px)');
    ipcRenderer.send("shell_command", ['sudo shutdown now\n', global_piIpAddress, global_piUserName, global_piPassword]);
})

// Open Pi-Player
ipcRenderer.on('Open Pi-Player', (event) => {
    $('#okModal').css('display', 'block');
    $(".modalFooter").empty();
    $('.modalHeader').empty();
    $('#okModalText').empty();
    $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
    $('#okModalText').append("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br>Opening Peerless-Pi-Player<br>&nbsp<br>&nbsp</p >");
    var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
    $('.modalFooter').append(buttons);
    $("#btnOkModal").focus();
    $('.background').css('filter', 'blur(5px)');

    ipcRenderer.send("shell_command", ['DISPLAY=:0 chromium-browser -start-fullscreen --app=http://localhost:8000/\n', global_piIpAddress, global_piUserName, global_piPassword]);

});

// Re-Send Track Data to Pi-Player
ipcRenderer.on('Re-Send Pi-Player', (event) => {
    $('#okModal').css('display', 'block');
    $(".modalFooter").empty();
    $('.modalHeader').empty();
    $('#okModalText').empty();
    $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
    $('#okModalText').append("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br>Sending track data to Peerless-Pi-Player<br>&nbsp<br>&nbsp</p >");
    var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
    $('.modalFooter').append(buttons);
    $("#btnOkModal").focus();
    $('.background').css('filter', 'blur(5px)');

    resendData();
});

async function resendData() {
    // Query database for track details
    var sql = "SELECT track.artistID, track.albumID, track.trackName, track.fileName, track.playTime, track.count, track.favourite, artist.artistName, album.albumName FROM track INNER JOIN artist ON track.artistID=artist.artistID INNER JOIN album ON track.albumID=album.albumID WHERE track.trackID=?";
    var row = await dBase.get(sql, global_TrackSelected);

    // Send message to main.js to SSH with large artworkfile
    var artworkLarge = MUSIC_PATH + row.artistName + "/" + row.albumName + "/AlbumArtXLarge.jpg";
    var artworkFolder = MUSIC_PATH + row.artistName + "/" + row.albumName + "/folder.jpg";
    ipcRenderer.send("ssh_artworkfile", [artworkLarge, artworkFolder, row.artistName, row.albumName, row.trackName, row.playTime, row.favourite, global_piIpAddress, global_piUserName, global_piPassword]);
};


// Close Pi-Player
ipcRenderer.on('Close Pi-Player', (event) => {
    // Display modal box; shutdown yes, no?
    $('#okModal').css('display', 'block');
    $('.modalHeader').empty();
    $('#okModalText').empty();
    $(".modalFooter").empty();
    $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
    $('#okModalText').append("<div class='modalIcon'><img src='./graphics/question.png'></div><p>&nbsp<br>Are you sure you want to close Peerless-Pi-Player?<br>&nbsp<br>&nbsp</p >");
    var buttons = $("<button class='btnContent' id='btnClosePi'>Yes</button> <button class='btnContent' id='btnCancelModal'>No</button>");
    $('.modalFooter').append(buttons);
    $("#btnClosePi").focus();
    $('.background').css('filter', 'blur(5px)');
});

$(document).on('click', '#btnClosePi', function () {
    $('#okModal').css('display', 'none');
    $('.background').css('filter', 'blur(0px)');
    ipcRenderer.send("shell_command", ['pkill chromium\n', global_piIpAddress, global_piUserName, global_piPassword]);
})

//######################
//Player button controls
//######################
// Previous button
$(document).on('click', '#btnPrevious', function () {
    btnPreviousClick()
});

function btnPreviousClick() {
    if (global_Playing == true) {
        var position = $('#nowPlayingTrackIndex').text();
        position = parseInt(position);
        if (position == 0) {
            position = -1;
        }
        else {
            position -= 2;
        }
        nextTrack(position);
    }
}

// Play track selected when play button is clicked
$(document).on('click', '#btnPlay', function (event) {
    event.preventDefault();
    btnPlayClick()
});

function btnPlayClick() {
    // Get all tracksIDs for album from track listing table hidden last column
    global_Tracks = $('.tblTrackTable tr').find('td:last').map(function () {
        return $(this).text()
    }).get()
    // Check that a track has been selected
    if (global_TrackSelected) {
        playTrack();
    }
}

// Pause button
$(document).on('click', '#btnPause', function () {
    btnPauseClick()
});

function btnPauseClick() {
    if (global_Playing) {
        if (!global_Paused) {
            global_Paused = true;
            $("#audio1").trigger("pause");
                // Grey out the album art cover
            $("#imgNowPlaying").css({ opacity: 0.75, filter: "grayscale(100%)", '-moz-filter': "grayscale(100%)" });
        }
        else {
            global_Paused = false;
            $("#audio1").trigger("play");
            // Change album art cover back from grey scale
            $("#imgNowPlaying").css({ opacity: 1, filter: "grayscale(0)", '-moz-filter': "grayscale(0)" });
        }
    }
}

// Next button
$(document).on('click', '#btnNext', function () {
    btnNextClick()
});

function btnNextClick() {
    if (global_Playing == true) {
        var position = $('#nowPlayingTrackIndex').text();
        position = parseInt(position);
        nextTrack(position);
    }
}

// Shuffle button
$(document).on('click', '#btnShuffle', function () {
    btnShuffleClick()
});

function btnShuffleClick() {
    if (!global_Playing) {
        // Use global_ShuffleTracks for more than 1 album
        if (global_TrackListing == false) {
            global_Tracks = global_ShuffleTracks;
        }
            // Use the tblTracks last td if table tracks displayed
        else {
            global_Tracks = $('#tblTracks tr').find('td:last').map(function () {
                return $(this).text()
            }).get()
        }

        // Shuffle globalTracks array
        for (var i = global_Tracks.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = global_Tracks[i];
            global_Tracks[i] = global_Tracks[j];
            global_Tracks[j] = temp;
        }
        global_TrackSelected = global_Tracks[0];
        playTrack();
    }
}

// Mute button
$(document).on('click', '#btnMute', function () {
    $("#audio1").prop("muted", !$("#audio1").prop("muted"));
    // Toggle button image
    if ($("#audio1").prop("muted")) {
        $("button#btnMute").css("background", "url(./graphics/mute_on.png) no-repeat");
    }
    else {
        $("button#btnMute").css("background", "url(./graphics/mute_off.png) no-repeat");
    }
});

// Fast Forward button
$(document).on('click', '#btnFastForward', function () {
    $("#audio1").prop("currentTime", $("#audio1").prop("currentTime") + 5);
});

// Rewind button
$(document).on('click', '#btnRewind', function () {
    $("#audio1").prop("currentTime", $("#audio1").prop("currentTime") - 5);
});

// Function to perform when mood button clicked on
$(document).on('click', '#btnMood', function () {
    moodShuffle()
});

$(document).on('click', '#btnNewReleases', function () {
    btnNewReleases()
});

// Function to perform when Show New Releases button clicked on
function btnNewReleases() {
    // Check if online
    var connection = navigator.onLine;
    if (connection) {
        $('#ulMenu a').css("textDecoration", "none");
        $("#divTrackListing").css("display", "none");
        $("#divContent").css("width", "auto");
        $('#spnAtoZmenu').css('display', 'inline')
        $('#divContent').load("./html/newreleases.html");
        $(document).ajaxComplete(function () {
            $(document).scrollTop(0);
        });
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
        $("#btnOkModal").focus();
        $('.background').css('filter', 'blur(5px)');
        return
    }
}

async function moodShuffle() {
    var mood = $('#sltMood').val();
    // Select all artist's albums from the database
    var sql = "SELECT trackID, mood1 FROM track WHERE mood1=?";
    var rows = await dBase.all(sql, mood);
    rows.forEach((row) => {
        global_Tracks.push(row.trackID)
        console.log(row.mood1)
    });

    // Shuffle globalTracks array
    for (var i = global_Tracks.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = global_Tracks[i];
        global_Tracks[i] = global_Tracks[j];
        global_Tracks[j] = temp;
    }
    global_TrackSelected = global_Tracks[0];
    playTrack();
}

// Function to perform when sub genre button clicked on
$(document).on('click', '#btnGenre', function () {
    // Reset global_GenreID and global_YearID for favourite songs 
    global_YearID = "";
    global_GenreID = "";
    global_SubGenre = $('#sltGenre').val();
    $("body").css("background", global_Background);
    $("#divTrackListing").css("display", "none");
    var srnWidth = $(window).width();
    var width = (srnWidth - 240);
    $("#divContent").css("width", width);
    $('#spnAtoZmenu').css('display', 'inline')
    $('#ulMenu a').css("textDecoration", "none");
    $("#menuAlbums").css('textDecoration', 'underline');
    $('#divContent').load("./html/subgenrealbums.html");
    // Enable btnSync
    $("#btnSync").prop("disabled", false);
});

// Button click code to display favourite songs    
$(document).on('click', '#favouriteSongs', function () {
    event.preventDefault();
    // Load link
    $("#divContent").css("width", "475px");
    $("#divTrackListing").css("display", "block");
    $("#divTrackListing").load($(this).attr("href"));
    $(document).ajaxComplete(function () {
        $(document).scrollTop(0);
        global_TrackListing = true;
    });
});

//###############
//Menu navigation
//###############
//Home  
$(document).on('click', '#menuHome', function (event) {
    event.preventDefault();

    $('#ulMenu a').css("textDecoration", "none");
    $(this).css('textDecoration', 'underline');

    $("#divTrackListing").css("display", "none");
    $("#divContent").css("width", "auto");
    $('#spnAtoZmenu').css('display', 'inline')
    var link = $(this).attr('href');
    global_SrnWidth = $(window).width();
    // Reset drop down arrow graphic buttons and global variable
    $("button#btnAddedShow").css("background", "url(./graphics/expand_large.png) no-repeat");
    global_AddedExpand = false;
    $("button#btnPlayedShow").css("background", "url(./graphics/expand_large.png) no-repeat");
    global_PlayedExpand = false;
    $("button#btnmostplayedshow").css("background", "url(./graphics/expand_large.png) no-repeat");
    global_MostPlayedExpand = false;
    // Enable btnSync
    $("#btnSync").prop("disabled", false);
    // Load home page
    $("#divContent").load(link);
    $.getScript("./js/home.js")
    $(document).ajaxComplete(function () {
        $(document).scrollTop(0);
        global_TrackListing = false;
    });
});

//Artists
$(document).on('click', '#menuArtists', function (event) {
    event.preventDefault();

    $('#ulMenu a').css("textDecoration", "none");
    $(this).css('textDecoration', 'underline');

    $("#divTrackListing").css("display", "none");
    $("#divContent").css("width", "auto");
    $('#spnAtoZmenu').css('display', 'inline')
    var link = $(this).attr('href');
    $('#divContent').load(link);
    $.getScript("./js/artists.js")
    // Enable btnSync
    $("#btnSync").prop("disabled", false);
    $(document).ajaxComplete(function () {
        $(document).scrollTop(0);
        global_TrackListing = false;
    });
});

//Albums
$(document).on('click', '#menuAlbums', function (event) {
    event.preventDefault();

    $('#ulMenu a').css("textDecoration", "none");
    $(this).css('textDecoration', 'underline');

    $("#divTrackListing").css("display", "none");
    $("#divContent").css("width", "auto");
    $('#spnAtoZmenu').css('display', 'inline')
    var link = $(this).attr('href');
    $('#divContent').load(link);
    $.getScript("./js/albums.js")
    // Enable btnSync
    $("#btnSync").prop("disabled", false);
    $(document).ajaxComplete(function () {
        $(document).scrollTop(0);
        global_TrackListing = false;
    });
});

//Genres
$(document).on('click', '#menuGenres', function (event) {
    event.preventDefault();

    $('#ulMenu a').css("textDecoration", "none");
    $(this).css('textDecoration', 'underline');

    // Reset global_SubGenre and global_YearID for favourite songs 
    global_SubGenre = "";
    global_YearID = "";
    $("#divTrackListing").css("display", "none");
    $("#divContent").css("width", "auto");
    $('#spnAtoZmenu').css('display', 'inline')
    var link = $(this).attr('href');
    $('#divContent').load(link);
    $.getScript("./js/genres.js")
    // Enable btnSync
    $("#btnSync").prop("disabled", false);
    $(document).ajaxComplete(function () {
        $(document).scrollTop(0);
        global_TrackListing = false;
    });
});

//Years
$(document).on('click', '#menuYears', function (event) {
    event.preventDefault();

    $('#ulMenu a').css("textDecoration", "none");
    $(this).css('textDecoration', 'underline');

    // Reset global_SubGenre and global_GenreID for favourite songs 
    global_SubGenre = "";

    global_GenreID = "";
    $("#divTrackListing").css("display", "none");
    $("#divContent").css("width", "auto");
    $('#spnAtoZmenu').css('display', 'inline')
    var link = $(this).attr('href');
    $('#divContent').load(link);
    $.getScript("./js/years.js")
    // Enable btnSync
    $("#btnSync").prop("disabled", false);
    $(document).ajaxComplete(function () {
        $(document).scrollTop(0);
        global_TrackListing = false;
    });
});

//Songs
$(document).on('click', '#menuSongs', function (event) {
    event.preventDefault();

    $('#ulMenu a').css("textDecoration", "none");
    $(this).css('textDecoration', 'underline');

    $("#divTrackListing").css("display", "none");
    var srnWidth = $(window).width();
    var width = (srnWidth - 240);
    $("#divContent").css("width", width);
    $('#spnAtoZmenu').css('display', 'inline')
    $(".divLayout").css("height", "auto");
    $('#divContent').load($(this).attr('href'));
    $.getScript("./js/songs.js")
    // Enable btnSync
    $("#btnSync").prop("disabled", false);
    $(document).ajaxComplete(function () {
        $(document).scrollTop(0);
        global_TrackListing = false;
    });
});

//Playlists
$(document).on('click', '#menuPlaylists', function (event) {
    event.preventDefault();

    $('#ulMenu a').css("textDecoration", "none");
    $(this).css('textDecoration', 'underline');

    $("#divTrackListing").css("display", "none");
    var srnWidth = $(window).width();
    var width = (srnWidth - 240);
    $("#divContent").css("width", width);
    $('#spnAtoZmenu').css('display', 'inline')
    $('#divContent').load($(this).attr('href'));
    $.getScript("./js/playlists.js")
    // Enable btnSync
    $("#btnSync").prop("disabled", false);
    $(document).ajaxComplete(function () {
        $(document).scrollTop(0);
        global_TrackListing = false;
    });
});

// Add placeholder to search box
$("#ipnSearch").attr("placeholder", "Search " + global_AppName);

// Search
// Search button click
$(document).on('click', '#btnSearch', function (event) {
    event.preventDefault();
    btnSearchClick()
});

// Search box focused enter keyup
$("#ipnSearch").keyup(function (event) {
    event.preventDefault();
    if (event.which == 13) {
        btnSearchClick()
    }
});

// Display search results
function btnSearchClick() {
    var searchTerm = $('#ipnSearch').val();
    if (searchTerm != "") {
        $("#divTrackListing").css("display", "none");
        var srnWidth = $(window).width();
        var width = (srnWidth - 240);
        $("#divContent").css("width", width);
        $('#spnAtoZmenu').css('display', 'inline')
        $('#divContent').load("./html/search.html");
        // Enable btnSync
        $("#btnSync").prop("disabled", false);
        $(document).ajaxComplete(function () {
            $(document).scrollTop(0);
            global_TrackListing = false;
        });
    }
}

//#######################
// Change Album Sort 
//#######################
$(document).on('change', "#sltAlbumSort", function (event) {
    event.preventDefault();
    global_AlbumSort = $("#sltAlbumSort option:selected").val();       
    // Enable btnSync
    $("#btnSync").prop("disabled", false);
    $(document).ajaxComplete(function () {
        $(document).scrollTop(0);
        global_TrackListing = false;
    });
});

//#######################
// Change Track Sort 
//#######################
$(document).on('change', "#sltTrackSort", function (event) {
    event.preventDefault();
    global_TrackSort = $("#sltTrackSort option:selected").val();   
    $("#divTrackListing").css("display", "none");
    var srnWidth = $(window).width();
    var width = (srnWidth - 240);
    $("#divContent").css("width", width);
    $('#spnAtoZmenu').css('display', 'inline')
    $(".divLayout").css("height", "auto");
    var link = "./html/songs.html";
    $('#divContent').load(link);
    $.getScript("./js/songs.js");
    // Enable btnSync
    $("#btnSync").prop("disabled", false);
    $(document).ajaxComplete(function () {
        $(document).scrollTop(0);
        global_TrackListing = false;
    });
});

//#########################
// Change Artist Track Sort 
//#########################
$(document).on('change', "#sltArtistTrackSort", function (event) {
    event.preventDefault();
    global_ArtistTrackSort = $("#sltArtistTrackSort option:selected").val();
    $("#divTrackListing").empty();
    // Load link 
    $("#divContent").css("width", "475px");
    $("#divTrackListing").css("display", "block");
    $("#divTrackListing").load("./html/displaytracks.html");
    // Enable btnSync
    $("#btnSync").prop("disabled", false);
    $(document).ajaxComplete(function () {
        $(document).scrollTop(0);
        global_TrackListing = false;
    });
});

//########################################################
// Function to perform when audio ended event is triggered
//########################################################
$("#audio1").on('ended', function (event) {
    event.preventDefault();
    var position = $('#nowPlayingTrackIndex').text();
    position = parseInt(position);
    nextTrack(position);
});

// Function to select and play next track
function nextTrack(p) {
    var position = (p);
    if (position >= (global_Tracks.length - 1)) {
        // If last track reached stop player
        global_Playing = false;
        global_Queued = false;
        // Remove selected track ID from hidden p
        $('#nowPlayingTrackID').text("");
        $('#nowPlayingTrackIndex').text("");
        // If track is paused when stopped reset imgNowPlaying greyscale back to zero
        if (global_Paused == true) {
            global_Paused = false;
            $("#imgNowPlaying").css({ opacity: 1, filter: "grayscale(0)", '-moz-filter': "grayscale(0)" });
        }
        stopPlaying();
        $("#audio1").trigger('pause');
        $("#audio1").prop('currentTime', 0);
        $("button#btnPlay").css("background", "url(./graphics/play1.png) no-repeat");
        $(".defaultPlaying").css("display", "block");
        $(".nowPlaying").css("display", "none");
        $('#appName').empty();
        $('#appName').append(global_AppName);
        // Send message to main.js to SSH with large PPlogo artworkfile
        var artworkLarge = "./graphics/peerless_player_blue.jpg";
        ipcRenderer.send("ssh_artworkfile", [artworkLarge, "", "Peerless-Pi-Player", "It's Music To Your Ears", "", "", "", global_piIpAddress, global_piUserName, global_piPassword]);
    }
    else {
        // Else load and play the next track
        // If track is paused when stopped reset imgNowPlaying greyscale back to zero
        if (global_Paused == true) {
            global_Paused = false;
            $("#imgNowPlaying").css({ opacity: 1, filter: "grayscale(0)", '-moz-filter': "grayscale(0)" });
        }
        stopPlaying();
        position += 1;
        global_TrackSelected = global_Tracks[position];
        // Stop current track playing
        $("#audio1").trigger('pause');
        $("#audio1").prop('currentTime', 0);
        $("button#btnPlay").css("background", "url(./graphics/play1.png) no-repeat");
        // Load next track to play
        displayTrack(position)
    }
};

// Functions to perform on the time update event
$('#audio1').on('timeupdate', function (event) {
    event.preventDefault();
    // Update progress bar
    $('#seekbar').attr("value", this.currentTime / this.duration);
    // Display current time playing
    var seconds = (this.currentTime);
    var minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    seconds = (seconds >= 10) ? seconds : "0" + seconds;
    $("#time").text(minutes + ":" + seconds);
});

function playTrack() {
    // If nothing is playing load track and play
    if (!global_Playing) {
        global_Playing = true;
        // Hide and show defaultPlaying and nowPlaying DIV classes in player.html
        $(".defaultPlaying").css("display", "none");
        $(".nowPlaying").css("display", "block");
        displayTrack()
        // Populate hidden p with selected track ID and array index
        $('#nowPlayingTrackID').text(global_TrackSelected);
        var position = global_Tracks.findIndex(i => i == global_TrackSelected);
        $('#nowPlayingTrackIndex').text(position);


    }
    else {
        // If a track is playing then stop
        global_Playing = false;
        global_Queued = false;
        // Remove selected track ID and array index from hidden p
        $('#nowPlayingTrackID').text("");
        $('#nowPlayingTrackIndex').text("");
        // If track is paused when stopped reset imgNowPlaying greyscale back to zero
        if (global_Paused == true) {
            global_Paused = false;
            $("#imgNowPlaying").css({ opacity: 1, filter: "grayscale(0)", '-moz-filter': "grayscale(0)" });
        }
        // Function to remove highlighted track playing
        stopPlaying();
        // Function to update stats
        libraryStats();
        // Pause and reset audio track
        $("#audio1").trigger('pause');
        $("#audio1").prop('currentTime', 0);
        // Change stop button to play button
        $("button#btnPlay").css("background", "url(./graphics/play1.png) no-repeat");
        // Hide and show defaultPlaying and nowPlaying DIV classes in player.html
        $(".defaultPlaying").css("display", "block");
        $(".nowPlaying").css("display", "none");
        $('#appName').empty();
        $('#appName').append(global_AppName);

        // Send message to main.js to SSH with large PPlogo artworkfile
        var artworkLarge = "./graphics/peerless_player_blue.jpg";
        ipcRenderer.send("ssh_artworkfile", [artworkLarge, "", "Peerless-Pi-Player", "It's Music To Your Ears", "", "", "", global_piIpAddress, global_piUserName, global_piPassword]);
    }
};

async function displayTrack(position) {
    // Log scroll position to reset at end as somewhere in this function forces page to scroll to top
    var tempScrollTop = $(window).scrollTop();

    // Query database for track details
    var sql = "SELECT track.artistID, track.albumID, track.trackName, track.fileName, track.playTime, track.count, track.favourite, artist.artistName, album.albumName FROM track INNER JOIN artist ON track.artistID=artist.artistID INNER JOIN album ON track.albumID=album.albumID WHERE track.trackID=?";
    var row = await dBase.get(sql, global_TrackSelected);

    // Create link to audio file
    var audioSource = MUSIC_PATH + encodeURIComponent(row.artistName) + "/" + encodeURIComponent(row.albumName) + "/" + encodeURIComponent(row.fileName);

    // Check to see if audio file exists
    $.get(audioSource).done(async function () {
        // Audio file exists
        // Load audio source and play 
        $("#audio1").attr("src", audioSource);
        $("#audio1").trigger("play");

        // Display album artwork
        // Get folder.jpg file path
        var artworkSource = MUSIC_PATH + row.artistName + "/" + row.albumName + "/folder.jpg";
        $("#imgNowPlaying").attr('src', artworkSource);

        // Set link from album artwork to display album
        $('#playingAlbum').attr('href', './html/displayalbum.html?artist=' + row.artistID + "&album=" + row.albumID);

        // Get track count
        var count = row.count

        // Display track details
        var trackDetails = "<h1>" + row.artistName + "</h1><h2>" + row.albumName + "</h2><br><p>" + row.trackName + "</p>";
        $('#trackDetails').empty();
        $('#trackDetails').append(trackDetails);
        $('#appName').empty();
        $('#appName').append("Now Playing:");

        // Send message to main.js to SSH with large artworkfile
        var artworkLarge = MUSIC_PATH + row.artistName + "/" + row.albumName + "/AlbumArtXLarge.jpg";
        var artworkFolder = MUSIC_PATH + row.artistName + "/" + row.albumName + "/folder.jpg";
        ipcRenderer.send("ssh_artworkfile", [artworkLarge, artworkFolder, row.artistName, row.albumName, row.trackName, row.playTime, row.favourite, global_piIpAddress, global_piUserName, global_piPassword]);


        // Display notification of next track to play
        if (global_notifications != 0) {
            let myNotification = new Notification(row.artistName + "\r" + row.albumName, {
                body: row.trackName,
                icon: './graphics/peerless_player.ico',
                silent: true
            })
        }

        // Populate hidden p with selected track ID
        $('#nowPlayingTrackID').text(global_TrackSelected);
        $('#nowPlayingTrackIndex').text(position);

        // Populate playtime
        $('#playTime').text(row.playTime);

        // Change play button to stop button
        $("button#btnPlay").css("background", "url(./graphics/stop1.png) no-repeat");

        // Call queue playlist function to update queue playlist in database
        queuePlaylist();

        // Highlight track in table as playing
        nowPlaying()

        // Update play count and last played date in track table
        count += 1
        var todayDate = new Date()
        var lastPlayed = convertDate(todayDate)

        // Update count and lastPlayed in track table
        var sql = "UPDATE track SET count=" + count + ", lastPlay='" + lastPlayed + "' WHERE trackID=" + global_TrackSelected;
        var update = await dBase.run(sql);

        // Update last play in album table
        var sql = "UPDATE album SET albumLastPlay='" + lastPlayed + "' WHERE albumID=" + row.albumID;
        var update = await dBase.run(sql);
        // Restore scroll position of page
        $(window).scrollTop(tempScrollTop);

    }).fail(function () {
        // Audio file DOES NOT exist
        global_Playing = false;
        // Hide and show defaultPlaying and nowPlaying DIV classes in player.html
        $(".defaultPlaying").css("display", "block");
        $(".nowPlaying").css("display", "none");
        $('#appName').empty();
        $('#appName').append(global_AppName);

        // Display modal box error message
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/warning.png'></div><p><b>ERROR - Audio file not found: </b><br>" + row.fileName + "<br>Please check your music directory.<br>&nbsp</p >");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $('.background').css('filter', 'blur(5px)');
        $("#btnOkModal").focus();

        // Send message to main.js to SSH with large PPlogo artworkfile
        var artworkLarge = "./graphics/peerless_player_blue.jpg";
        ipcRenderer.send("ssh_artworkfile", [artworkLarge, "", "Peerless-Pi-Player", "It's Music To Your Ears", "", "", "", global_piIpAddress, global_piUserName, global_piPassword]);

        // Function to remove highlighted track playing
        stopPlaying();
        $(window).scrollTop(tempScrollTop);
    });   
}
