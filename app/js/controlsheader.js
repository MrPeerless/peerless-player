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

    //######################
    //Player button controls
    //######################
    // Previous button
    $(document).on('click', '#btnPrevious', function () {
        btnPreviousClick()
    });

    function btnPreviousClick() {
        if (global_Playing == true) {
            //stopPlaying();
            var currentTrack = $("#nowPlayingTrackID").text();
            //var position = global_Tracks.findIndex(i => i == currentTrack);
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
    $(document).on('click', '#btnPlay', function () {
        btnPlayClick()
    });

    function btnPlayClick() {
        // Get all tracksIDs for album from track listing table hidden last column
        global_Tracks = $('.tblTrackTable tr').find('td:last').map(function () {
            return $(this).text()
        }).get()
        playTrack();
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
            var currentTrack = $("#nowPlayingTrackID").text();
            //var position = global_Tracks.findIndex(i => i == currentTrack);
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

    async function moodShuffle() {
        var mood = $('#sltMood').val();
        // Select all artist's albums from the database
        var sql = "SELECT trackID FROM track WHERE mood1=?";
        var rows = await dBase.all(sql, mood);
        rows.forEach((row) => {
            global_Tracks.push(row.trackID)
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
        $('#divContent').load("./html/subgenrealbums.html");
        // Enable btnSync
        $("#btnSync").prop("disabled", false);
    });

    // Button click code to display fabvourite songs    
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
        $(document).ajaxComplete(function () {
            $(document).scrollTop(0);
            global_TrackListing = false;
        });
    });

    //Artists
    $(document).on('click', '#menuArtists', function (event) {
        event.preventDefault();
        $("#divTrackListing").css("display", "none");
        $("#divContent").css("width", "auto");
        $('#spnAtoZmenu').css('display', 'inline')
        var link = $(this).attr('href');
        $('#divContent').load(link);
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
        $("#divTrackListing").css("display", "none");
        $("#divContent").css("width", "auto");
        $('#spnAtoZmenu').css('display', 'inline')
        var link = $(this).attr('href');
        $('#divContent').load(link);
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
        // Reset global_SubGenre and global_YearID for favourite songs 
        global_SubGenre = "";
        global_YearID = "";
        $("#divTrackListing").css("display", "none");
        $("#divContent").css("width", "auto");
        $('#spnAtoZmenu').css('display', 'inline')
        var link = $(this).attr('href');
        $('#divContent').load(link);
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
        // Reset global_SubGenre and global_GenreID for favourite songs 
        global_SubGenre = "";
        global_GenreID = "";
        $("#divTrackListing").css("display", "none");
        $("#divContent").css("width", "auto");
        $('#spnAtoZmenu').css('display', 'inline')
        var link = $(this).attr('href');
        $('#divContent').load(link);
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
        $("#divTrackListing").css("display", "none");
        var srnWidth = $(window).width();
        var width = (srnWidth - 240);
        $("#divContent").css("width", width);
        $('#spnAtoZmenu').css('display', 'inline')
        $(".divLayout").css("height", "auto");
        $('#divContent').load($(this).attr('href'));
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
        $("#divTrackListing").css("display", "none");
        var srnWidth = $(window).width();
        var width = (srnWidth - 240);
        $("#divContent").css("width", width);
        $('#spnAtoZmenu').css('display', 'inline')
        $('#divContent').load($(this).attr('href'));
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
        btnSearchClick()
    });

    // Search box focused enter keyup
    $("#ipnSearch").keyup(function (event) {
        if (event.which == 13) {
            btnSearchClick()
        }
    });

    // Display search results
    function btnSearchClick(){
        event.preventDefault();
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
    $(document).on('change', "#sltAlbumSort", function (e) {
        global_AlbumSort = $("#sltAlbumSort option:selected").val();
        event.preventDefault();
        $("#divTrackListing").css("display", "none");
        $("#divContent").css("width", "auto");
        $('#spnAtoZmenu').css('display', 'inline')
        var link = "./html/albums.html";
        $('#divContent').load(link);
        // Enable btnSync
        $("#btnSync").prop("disabled", false);
        $(document).ajaxComplete(function () {
            $(document).scrollTop(0);
            global_TrackListing = false;
        });
    });

    //#######################
    // Change Genre Sort 
    //#######################
    $(document).on('change', "#sltGenreSort", function (e) {
        global_GenreSort = $("#sltGenreSort option:selected").val();
        event.preventDefault();
        $("#divTrackListing").css("display", "none");
        $("#divContent").css("width", "auto");
        $('#spnAtoZmenu').css('display', 'inline')
        var link = "./html/genrealbums.html";
        $('#divContent').load(link);
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
    $(document).on('change', "#sltTrackSort", function (e) {
        global_TrackSort = $("#sltTrackSort option:selected").val();
        event.preventDefault();
        $("#divTrackListing").css("display", "none");
        var srnWidth = $(window).width();
        var width = (srnWidth - 240);
        $("#divContent").css("width", width);
        $('#spnAtoZmenu').css('display', 'inline')
        $(".divLayout").css("height", "auto");
        var link = "./html/songs.html";
        $('#divContent').load(link);
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
    $('#audio1').on('timeupdate', function () {
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
        // Function to remove highlighten track playing
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
    }
};

async function displayTrack(position) {
    // Query database for track details
    var sql = "SELECT track.artistID, track.albumID, track.trackName, track.fileName, track.playTime, track.count, artist.artistName, album.albumName FROM track INNER JOIN artist ON track.artistID=artist.artistID INNER JOIN album ON track.albumID=album.albumID WHERE track.trackID=?";
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
        var sourceFile = MUSIC_PATH + row.artistName + "/" + row.albumName + "/folder.jpg";
        // Find folder.jpg last modified date
        var modifiedDate = fs.statSync(sourceFile).mtime;
        var artworkSource = MUSIC_PATH + row.artistName + "/" + row.albumName + "/folder.jpg?modified=" + modifiedDate;
        $("#imgNowPlaying").attr('src', artworkSource);

        // Set link from album artwork to display album
        $('#playingAlbum').attr('href', './html/displayalbum.html?artist=' + row.artistID + "&album=" + row.albumID);

        // Get track count
        var count = row.count

        // Display track details
        var trackDetails = "Now Playing:<br><h1>" + row.artistName + "</h1><h2>" + row.albumName + "</h2><br><p>" + row.trackName + "</p>";
        $('#trackDetails').html(trackDetails);

        // Display notification of next track to play
        if (global_notifications != 0) {
            let myNotification = new Notification(row.albumName, {
                body: row.trackName,
                icon: './graphics/peerless_player.ico',
                silent: true
            })
        }

        // Populate hidden p with selected track ID
        $('#nowPlayingTrackID').text(global_TrackSelected);
        $('#nowPlayingTrackIndex').text(position);

        // Populate playtime
        $('#playTime').html(row.playTime);

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

    }).fail(function () {
        // Audio file DOES NOT exist
        global_Playing = false;
        // Hide and show defaultPlaying and nowPlaying DIV classes in player.html
        $(".defaultPlaying").css("display", "block");
        $(".nowPlaying").css("display", "none");

        // Display modal box error message
        $('#okModal').css('display', 'block');
        $(".modalFooter").empty();
        $('.modalHeader').html('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').html("<div class='modalIcon'><img src='./graphics/warning.png'></div><p><b>ERROR - Audio file: </b>" + row.fileName + "<b> not found!</b><br>Please check your music directory.<br>&nbsp</p >");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
    })
}