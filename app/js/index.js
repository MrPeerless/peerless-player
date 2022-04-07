// Declare global varibales here
// App variables
var global_AppName;
var global_SrnWidth;
var global_SrnHeight;
var global_playingHeight;
var global_playingDivClicked;

// Expand/Collapse DIVs
var global_AddedExpand = false;
var global_DatabaseExpand = false;
var global_GenreExpand = false;
var global_LibraryExpand = true;
var global_MostPlayedExpand = false;
var global_MoodExpand = false;
var global_PlayedExpand = false;
var global_PlayerExpand = false;
var global_BioTextExpand = false;

// Settings variables
var global_ArtIconSize;
var global_ArtIconShape;
var global_Zoom = 1;
var global_ZoomFactor = 0;
var global_notifications;
var global_Background;
var global_Version;

// Player variables
var global_Playing = false;
var global_Paused = false;
var global_Queued = false;
var global_TrackListing = false; // Used for the shuffle function
var global_Backcover = false;

// Menu variables
var global_AlbumID;
var global_ArtistID;
var global_GenreID = "";
var global_PlaylistID;
var global_ShuffleTracks = [];
var global_AlbumSort = "a2z";
var global_TrackSort = "a2z";
var global_SubGenre = "";
var global_TrackID;
var global_TrackName;
var global_Tracks = [];
var global_TrackSelected;
var global_YearID;

// URLs
var musicbrainzUrl = "https://musicbrainz.org/ws/2/";
var wikiQueryUrl = "https://en.wikipedia.org/w/api.php?"
var napsterUrl = "https://us.napster.com/search?query="
var googleUrl = "https://www.google.co.uk/search?q="

// CONSTANT VARIABLES
// Path to users music directory
var MUSIC_PATH;

// Get app_path and sqlite script from query string in index.html
var queryString = global.location.search
var splitString = queryString.split("=");
// App path
const app_path = splitString[1];
// Sqlite script path
const dBase = require(splitString[3]);

// Path to database file
//const DB_PATH = app_path + "/peerless-player-TEST.db";
const DB_PATH = app_path + "/peerless-player-database.db";

// JQuery
window.$ = window.jQuery = require('jquery')
// Below requires to be removed once preload.js enabled
const { ipcRenderer } = require('electron')
const jqueryValidation = require('jquery-validation'); // Used for validating form input
const { webFrame } = require('electron') // For setting zoom level; webframe can't be used in main.js
const sanitizeHtml = require('sanitize-html'); // For screening html content retrieved from Wikipedia

// START HERE WITH OPENING THE DATABASE
openDatabase("start")

// OPEN DATABASE
async function openDatabase(query) {
    var option = query;

    // If app is starting open database connection
    if (option == "start") {
        await dBase.open(DB_PATH);

        // Create database tables if they do not exist; runs first time after installing to create the database
        // Album table
        var albumTable = "CREATE TABLE IF NOT EXISTS album (albumID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, genreID	INTEGER NOT NULL, artistID INTEGER NOT NULL, albumName TEXT NOT NULL, releaseDate TEXT, albumTime TEXT, albumCount NUMERIC, dateAdd DATETIME, albumLastPlay DATETIME);"
        var create = await dBase.run(albumTable);
        // Artist table
        var artistTable = "CREATE TABLE IF NOT EXISTS artist (artistID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, artistName TEXT NOT NULL, origin	TEXT);"
        var create = await dBase.run(artistTable);
        // Genre table
        var genreTable = "CREATE TABLE IF NOT EXISTS genre (genreID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, genreName TEXT NOT NULL);"
        var create = await dBase.run(genreTable);
        // Playlists table
        var playlistsTable = "CREATE TABLE IF NOT EXISTS playlists (playlistID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, playlistName TEXT NOT NULL, trackList TEXT NOT NULL, dateCreated DATETIME NOT NULL);"
        var create = await dBase.run(playlistsTable);
        // Settings table
        var settingsTable = "CREATE TABLE IF NOT EXISTS settings (settingsID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, appName TEXT  NOT NULL, musicDirectory TEXT, artSize TEXT, artShape TEXT, userID TEXT, zoom NUMERIC, notifications BOOLEAN, theme TEXT);"
        var create = await dBase.run(settingsTable);
        // Track table
        var trackTable = "CREATE TABLE IF NOT EXISTS track (trackID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, genreID INTEGER NOT NULL, artistID INTEGER NOT NULL, albumID INTEGER NOT NULL, trackName TEXT NOT NULL, fileName TEXT NOT NULL, playTime TEXT, count INTEGER, mood1 TEXT, mood2 TEXT, tempo1 TEXT, tempo2 TEXT, genre2 TEXT, genre3 TEXT, favourite BIT, lastPlay DATETIME, vector TEXT, magnitude NUMERIC);"
        var create = await dBase.run(trackTable);

        // Check if settings table is empty therefore just created
        var sql = "SELECT settingsID FROM settings";
        var rows = await dBase.all(sql)

        // If settings table is empty insert default settings values
        if (rows.length == 0) {
            var entry = `"${'Peerless'}","${'large'}","${'square'}","${'1'}","${'1'}","${'skinlight'}"`;
            var sql = "INSERT INTO settings (appName, artSize, artShape, zoom, notifications, theme) " + "VALUES (" + entry + ")";
            var insert = await dBase.run(sql);
        }
    }

    // Get User Settings
    var settingsID = 1;
    var sql = "SELECT * FROM settings WHERE settingsID=?";
    var row = await dBase.get(sql, settingsID)

    // Get App settings
    global_AppName = row.appName + " Player";
    global_ArtIconSize = row.artSize;
    global_ArtIconShape = row.artShape;
    global_notifications = row.notifications;
    MUSIC_PATH = row.musicDirectory;

    // Set App zoom level
    global_SrnWidth = $(window).width();
    global_ZoomFactor = row.zoom;
    global_Zoom = 1 - (1 - global_ZoomFactor) * global_Zoom;
    global_SrnWidth = global_SrnWidth / global_Zoom;
    webFrame.setZoomFactor(global_Zoom);

    // Set variable for global_Background
    switch (row.theme) {
        case "skindark":
            global_Background = "#111111";
            break;
        case "skinlight":
            global_Background = "#eeeeee";
            break;
        case "skinblue":
            global_Background = "#0c4586";
    }

    // Set CSS file for theme
    $('#skin').replaceWith('<link id="skin" rel="stylesheet" type="text/css" href="./css/' + row.theme + '.css"/>')

    //$('#skin').replaceWith('<link id="skin" rel="stylesheet" type="text/css" href="./css/skincool.css"/>')

    // If app is starting load content into divs
    if (option == "start") {
        // Load pages and scripts into divs
        // Scripts are loaded here instead from the html page because this is an async function and loading scripts from html page is a synchronous XMLHttpRequest, which throws a deprecation warning in the console.
        $("#divControlsHeader").load("./html/controlsheader.html");
        $.getScript("./js/controlsheader.js")
        $("#divPlaying").load("./html/playing.html");
        $.getScript("./js/playing.js")
        $("#divContent").load("./html/home.html");
        $.getScript("./js/home.js")
    }

    // Send message to main to check for playlists directory in music folder
    ipcRenderer.send("check_playlists", [MUSIC_PATH, "Playlists/"])
}

// This function prevents eval() running in app for security purposes.
window.eval = global.eval = function () {
    throw new Error(`window.eval not supported`)
}

//#####################
// AUTO UPDATES EVENTS
//#####################
// Get Version number from package.json file
ipcRenderer.send('app_version');
ipcRenderer.on('app_version', (event, arg) => {
    ipcRenderer.removeAllListeners('app_version');
    global_Version = arg.version;
    console.log("Peerless Player Version: " + arg.version);
});

// Display message box that update is available and downloading
ipcRenderer.on('update_available', () => {
    ipcRenderer.removeAllListeners('update_available');
    // Display modal box update available
    $('#okModal').css('display', 'block');
    $('.modalHeader').empty();
    $('#okModalText').empty();
    $(".modalFooter").empty();
    $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>Peerless Player</h2>');
    $('#okModalText').append("<div class='modalIcon'><img src='./graphics/update.png'></div><p>&nbsp<br>A new update is available. Downloading now....<br>&nbsp<br>&nbsp</p >");
    var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
    $('.modalFooter').append(buttons);
    $("#btnOkModal").focus();
    $('.background').css('filter', 'blur(5px)');
});

// Display message box that download complete; restart now?
ipcRenderer.on('update_downloaded', () => {
    ipcRenderer.removeAllListeners('update_downloaded');
    // Display modal box; restart yes, no?
    $('#okModal').css('display', 'block');
    $('.modalHeader').empty();
    $('#okModalText').empty();
    $(".modalFooter").empty();
    $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
    $('#okModalText').append("<div class='modalIcon'><img src='./graphics/question.png'></div><p>&nbsp<br>Update Downloaded. It will be installed on restart. Do you want to restart now?<br>&nbsp</p >");
    var buttons = $("<button class='btnContent' id='btnRestartApp'>Yes</button> <button class='btnContent' id='btnCancelModal'>No</button>");
    $('.modalFooter').append(buttons);
    $("#btnRestartApp").focus();
    $('.background').css('filter', 'blur(5px)');
});

// Button click to restart app
$(document).on('click', '#btnRestartApp', function () {
    ipcRenderer.send('restart_app');
})

//#######################################
// CLICK EVENTS FROM MENU IN MAIN PROCESS
//#######################################
ipcRenderer.on('Sync Database', (event) => {
    btnSyncClick()
});

ipcRenderer.on('Sync Directory', (event) => {
    btnSyncDirClick()
});

ipcRenderer.on('View Exported Playlists', (event) => {
    btnExportedPlaylistsClick()
});

ipcRenderer.on('Queue Track', (event) => {
    btnQueueClicked()
});

ipcRenderer.on('Clear Queued Music', (event) => {
    btnClearQueuedClicked()
});

ipcRenderer.on('Settings', (event) => {
    $("#divTrackListing").css("display", "none");
    $("#divContent").css("width", "auto");
    $('#divContent').load('./html/settings.html');
    // Enable btnSync
    $("#btnSync").prop("disabled", false);
});

// Display About from Help menu
ipcRenderer.on('Help About', (event) => {
    $('#okModal').css('display', 'none');
    // Display modal box
    $('#okModal').css('display', 'block');
    $('.modalHeader').empty();
    $('#okModalText').empty();
    $(".modalFooter").empty();
    var currentDate = new Date();
    var currentYear = currentDate.getFullYear();
    $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>About Peerless Player</h2>');
    $('#okModalText').append("<div class='modalIcon'><img src='./graphics/peerless_player_thumb.png'></div><p><b>Author:</b> Geoff Peerless &copy " + currentYear + "<br><b>Version:</b> " + global_Version + "<br><b>URL:</b><a id='githubLink' href='https://peerlessplayer.rocks' target='_blank'> peerlessplayer.rocks</a><br><b>Email:</b> contact@peerlessplayer.rocks<br><b>License:</b> ISC&nbsp<br>&nbsp</p >");
    var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
    $('.modalFooter').append(buttons);
    $("#btnOkModal").focus();
    $('.background').css('filter', 'blur(5px)');
});

// Display License from Help menu
ipcRenderer.on('License', (event) => {
    $('#okModal').css('display', 'none');
    // Display modal box
    $('#okModal').css('display', 'block');
    $('.modalHeader').empty();
    $('#okModalText').empty();
    $(".modalFooter").empty();
    var currentDate = new Date();
    var currentYear = currentDate.getFullYear();
    $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>Peerless Player License</h2>');
    $('#okModalText').append("<div class='modalIcon'><img src='./graphics/peerless_player_thumb.png'></div><p><b>ISC License</b> Copywrite &copy " + currentYear + " Geoff Peerless<br><br>Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.<br><br>THE SOFTWARE IS PROVIDED 'AS IS' AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS.IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.</p >");
    var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
    $('.modalFooter').append(buttons);
    $("#btnOkModal").focus();
    $('.background').css('filter', 'blur(5px)');
});

// Display Release Notes from Help menu
ipcRenderer.on('Help Release', (event) => {
    $('#okModal').css('display', 'none');
    // Display modal box updating directory
    $('#okModal').css('display', 'block');
    $('.modalHeader').empty();
    $('#okModalText').empty();
    $(".modalFooter").empty();
    $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>Release Notes Version: ' + global_Version + '</h2>');
    $('#okModalText').append("<div class='modalIcon'><img src='./graphics/peerless_player_thumb.png'></div><p>1. Music recommendations added to artist page.<br>2. New music releases function added to player menu.<br>3. Back To Top button added to all pages once scrolled.<br>4. Error handling added to ajax remote server requests.<br>5. Smooth srcolling added to A - Z menu.<br>6. Animation added when displaying large album artwork.<br>7. Minor bug fixes in playlist and search functions.<br></p >");//<br> &nbsp
    var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
    $('.modalFooter').append(buttons);
    $("#btnOkModal").focus();
    $('.background').css('filter', 'blur(5px)');
});

// Display Keyboard Shortcuts from Help menu
ipcRenderer.on('Help Shortcuts', (event) => {
    $("#divTrackListing").css("display", "none");
    $("#divContent").css("width", "auto");
    $('#divContent').load('./html/keyboardshortcuts.html');
    // Enable btnSync
    $("#btnSync").prop("disabled", false);
});

// Display User Guide from Help menu
ipcRenderer.on('Help Guide', (event) => {
    $("#divTrackListing").css("display", "none");
    $("#divContent").css("width", "auto");
    $('#divContent').load('./html/userguide.html');
    // Enable btnSync
    $("#btnSync").prop("disabled", false);
});

// Show Back To Top link when scrolling
$(window).scroll(function () {
    if ($(this).scrollTop() == 0) {
        $('.divBackToTop').fadeOut();
    }
    else {
        $('.divBackToTop').css('position', 'fixed');
        $('.divBackToTop').fadeIn();
    }
});

// Scroll back to top when link clicked
$(document).on('click', '#btnBackToTop', function (event) {
    $('html, body').animate({ scrollTop: $(".divLayout").offset().top - 70 }, "slow");
});


//#########################
// FUNCTIONS
//#########################
// Function to convert numbers to #,### format
function numberWithCommas(number) {
    var parts = number.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

// Function to parse query strings in URL
function parseQuery(queryString) {
    var vars = {};
    var parts = queryString.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}

// These date conversions are needed after migrating database from Server Compact to SQlite
// Function to format date strings when retrieved from database to DD-MM-YYYY format
function formatDate(d) {
    if (d != null) {
        var dd = d.split(/[\sT]/);
        var ddd = dd[0].split(/[-|.]/);
        var albumDate = (ddd[2] + "-" + ddd[1] + "-" + ddd[0]);
        return albumDate;
    }
    return null;
}

// Function to format date strings when input to database to DD-MM-YYYY format
function convertDate(d) {
    if (d != null) {
        dd = d.toJSON()
        dd = dd.replace("T", " ");
        dd = dd.replace(/-/g, ".");
        dd = dd.slice(0, -1);
        return dd;
    }
    return null;
}

// groupBy custom function to split artists into groups by first letter
Array.prototype.groupBy = function (prop) {
    return this.reduce(function (groups, item) {
        var char = item.charAt(0)
        const val = char.toUpperCase()
        groups[val] = groups[val] || []
        groups[val].push(item)
        return groups
    }, {})
}

// Sort array ignoring case
function sorted(array) {
    var sorted = array.sort(function (a, b) {
        // Storing case insensitive comparison 
        var comparison = a.toLowerCase().localeCompare(b.toLowerCase());
        // If strings are equal in case insensitive comparison 
        if (comparison === 0) {
            // Return case sensitive comparison instead 
            return a.localeCompare(b);
        }
        // Otherwise return result 
        return comparison;
    });
    return sorted;
}

// Function to change the background colour when displaying track listing
function backgroundChange() {
    var trackHeight = 0;
    var contentHeight = 0;
    trackHeight = parseInt($("#divTrackListing").css("height"));
    contentHeight = parseInt($("#divContent").css("height"));
    var winHeight = $(window).height();
    var height = (winHeight - 60);
    var margin = 0;

    $("#divContent").css("min-height", height);
    $("#divTrackListing").css("min-height", height);
    // Calculate the difference in height between divs
    if (trackHeight > 0 && trackHeight < contentHeight) {
        margin = contentHeight - trackHeight
    }

    //console.log("height = " + height)
    //console.log("contentHeight = " + contentHeight)
    //console.log("trackHeight = " + trackHeight)
    //console.log("margin = " + margin)

    // Add a margin to the bottom of divTrackListing to give appearance of equal heights
    if (margin > 0) {
        $("#divTrackListing").css("padding-bottom", margin);
    }
    else {
        $("#divTrackListing").css("padding-bottom", 0);
    }
    return;
}

// Close button on display album tracks
$(document).on('click', '#btnClose', function (event) {
    event.preventDefault();
    $("body").css("background", global_Background);
    $("#divTrackListing").css("display", "none");
    global_TrackListing = false;
    var srnWidth = $(window).width();
    var width = (srnWidth - 240);
    $("#divContent").css("width", width);
    // Show A to Z menu
    $('#spnAtoZmenu').css('display', 'inline')
    // Show Artist and Album column of Songs table
    $("#tblSongs td:nth-child(2)").css("display", "table-cell");
    $("#tblSongs th:nth-child(2)").css("display", "table-cell");
    $("#tblSongs td:nth-child(3)").css("display", "table-cell");
    $("#tblSongs th:nth-child(3)").css("display", "table-cell");
    // Enable btnSync
    $("#btnSync").prop("disabled", false);
});

// Close button on display album info
$(document).on('click', '#btnInfoAlbumTracks', function (event) {
    event.preventDefault();
    // Display album track listing
    $("body").css("background", global_Background);
    $('#divTrackListing').load("./html/displayalbum.html");
});

// Function to highlight track playing in track list
function nowPlaying() {
    var trackID = $("#nowPlayingTrackID").text();
    $("#tblTracks tr").each(function () {
        // Select colour of speaker icon depending on background colour
        if (!$(this).hasClass("highlight") && (global_Background == "#eeeeee")) {
            var img = "<img id='speaker' style='vertical-align:middle' src='./graphics/speaker_black.png' />";
        }
        else {
            var img = "<img id='speaker' style='vertical-align:middle' src='./graphics/speaker_white.png' />";
        }
        var ID = $(this).find("td:last").text();
        var trackName = $(this).find("td").eq(0).text();
        $(this).find("td").eq(0).removeClass("playing");
        $(this).find("td").eq(0).text(trackName);
        if (ID == trackID) {
            $(this).find("td").eq(0).addClass("playing");
            $(this).find("td").eq(0).html(trackName + " " + img);
        }
    });
    return;
}

// Function to remove track playing highlight in track list when player is stopped
function stopPlaying() {
    var trackID = $("#nowPlayingTrackID").text();
    $("#tblTracks tr").each(function () {
        var trackName = $(this).find("td").eq(0).text();
        $(this).find("td").eq(0).removeClass("playing");
        $(this).find("td").eq(0).text(trackName);
    });
}

// Append all trackIDs to shuffle array
function shuffleArray(rows) {
    global_ShuffleTracks = [];
    rows.forEach((row) => {
        global_ShuffleTracks.push(row.trackID)
    });
    return;
}

// Function to calculate height of playing div
function playingHeight() {
    global_SrnHeight = $(window).height();
    var totalHeight = 60;
    var moodHeight = 0;
    var genreHeight = 0;
    var playerHeight = 0;
    var databaseHeight = 0;
    var appMainHeadingHeight = $('.appMainHeading').height();

    totalHeight += appMainHeadingHeight;

    // Calculate height of all Playing Divs
    $('.divDefaultPlayingText').each(function () {
        var $this = $(this);
        var divDefaultPlayingText = $this.height();
        totalHeight += divDefaultPlayingText
    });

    $('.divPlayingText').each(function () {
        var $this = $(this);
        var divHeight = $this.height();
        totalHeight += divHeight;
    });

    // height difference between screen height and total of Playing Divs
    var heightDiff = global_SrnHeight - totalHeight;

    // If difference is less than 0 close all other playing divs
    if (heightDiff < 0) {
        if (global_playingDivClicked === "btnMoodExpand") {
            $("button#btnGenreExpand").css("background", "url(./graphics/expand.png) no-repeat");
            $("#divGenreSelect").hide();
            global_GenreExpand = false; 

            $("button#btnPlayerExpand").css("background", "url(./graphics/expand.png) no-repeat");
            $("#divPlayerFunctions").hide();
            global_PlayerExpand = false;

            $("button#btnDatabaseExpand").css("background", "url(./graphics/expand.png) no-repeat");
            $("#divDatabaseFunctions").hide();
            global_DatabaseExpand = false; 
        }

        else if (global_playingDivClicked === "btnGenreExpand") {
            $("button#btnMoodExpand").css("background", "url(./graphics/expand.png) no-repeat");
            $("#divMoodSelect").hide();
            global_MoodExpand = false;

            $("button#btnPlayerExpand").css("background", "url(./graphics/expand.png) no-repeat");
            $("#divPlayerFunctions").hide();
            global_PlayerExpand = false;

            $("button#btnDatabaseExpand").css("background", "url(./graphics/expand.png) no-repeat");
            $("#divDatabaseFunctions").hide();
            global_DatabaseExpand = false; 
        }
        else if (global_playingDivClicked === "btnPlayerExpand") {
            $("button#btnMoodExpand").css("background", "url(./graphics/expand.png) no-repeat");
            $("#divMoodSelect").hide();
            global_MoodExpand = false;

            $("button#btnGenreExpand").css("background", "url(./graphics/expand.png) no-repeat");
            $("#divGenreSelect").hide();
            global_GenreExpand = false; 

            $("button#btnDatabaseExpand").css("background", "url(./graphics/expand.png) no-repeat");
            $("#divDatabaseFunctions").hide();
            global_DatabaseExpand = false; 
        }
        else if (global_playingDivClicked === "btnDatabaseExpand") {
            $("button#btnMoodExpand").css("background", "url(./graphics/expand.png) no-repeat");
            $("#divMoodSelect").hide();
            global_MoodExpand = false;

            $("button#btnGenreExpand").css("background", "url(./graphics/expand.png) no-repeat");
            $("#divGenreSelect").hide();
            global_GenreExpand = false; 

            $("button#btnPlayerExpand").css("background", "url(./graphics/expand.png) no-repeat");
            $("#divPlayerFunctions").hide();
            global_PlayerExpand = false;
        }
    }
}

//######################
// UPDATE LIBRARY STATS
//######################
async function libraryStats() {
    // Query database number of genres
    var sql = "SELECT DISTINCT genreID FROM track";
    var rows = await dBase.all(sql);
    // Call function in index.js to format number #,###
    var genres = numberWithCommas(rows.length);
    $("#genreCount").text(" " + genres);

    // Query database number of years
    var sql = "SELECT DISTINCT releaseDate FROM album";
    var rows = await dBase.all(sql);
    // Call function in index.js to format number #,###
    var years = numberWithCommas(rows.length);
    $("#yearCount").text(" " + years);

    // Query database number of artists
    var sql = "SELECT artistID FROM artist";
    var rows = await dBase.all(sql);
    // Call function in index.js to format number #,###
    var artists = numberWithCommas(rows.length);
    $("#artistCount").text(" " + artists);

    // Query database number of albums
    var sql = "SELECT albumID FROM album";
    var rows = await dBase.all(sql);
    // Call function in index.js to format number #,###
    var albums = numberWithCommas(rows.length);
    $("#albumCount").text(" " + albums);

    // Query database number of songs
    var sql = "SELECT trackID FROM track";
    var rows = await dBase.all(sql);
    // Call function in index.js to format number #,###
    var tracks = numberWithCommas(rows.length);
    $("#trackCount").text(" " + tracks);

    // Query database number of playlists
    var sql = "SELECT playlistID FROM playlists";
    var rows = await dBase.all(sql);
    // Call function in index.js to format number #,###
    var playlists = numberWithCommas(rows.length);
    $("#playlistCount").text(" " + playlists);

    // Calculate total playing time of database
    var sql = "SELECT albumTime FROM album";
    var rows = await dBase.all(sql);

    var totalMins = 0;
    var totalSecs = 0;
    rows.forEach((row) => {
        var time = row.albumTime.split(":");
        var tick = parseInt(time[0]);
        totalMins += tick;
        var tock = parseInt(time[1]);
        totalSecs += tock;
    });
    // Calculate seconds
    var seconds = totalSecs % 60;
    var secMins = totalSecs / 60;
    // Calculate minuntes
    var mins = secMins + totalMins;
    var minutes = parseInt(mins % 60);
    // Calcualte hours
    var hrs = mins / 60;
    var hours = parseInt(hrs % 24);
    // Calculate days
    var days = parseInt(hrs / 24);
    $("#playingTime").empty();
    $("#playingTime").append("Total playing time:<br />" + days + " days " + hours + " hrs " + minutes + " mins " + seconds + " secs");

    // Update album count
    var sql = "SELECT album.albumID, SUM(track.count) AS trackCount FROM track LEFT JOIN album ON track.albumID = album.albumID GROUP BY album.albumID"
    var rows = await dBase.all(sql);
    rows.forEach((row) => {
        // call async function to update album table
        albumCount(row.albumID, row.trackCount)
    });
}

// Function to update album count in album table
async function albumCount(albumID, count) {
    var sql = "UPDATE album SET albumCount=" + count + " WHERE albumID=" + albumID;
    var update = await dBase.run(sql);
}

//#################
// FAVOURITES 
//#################
$(document).on('click', '.favourite', function () {
    var favourite = $(this).attr('alt');
    var trackID = $(this).attr('id');
    if (favourite == "N") {
        $('img[id="' + trackID + '"]').attr('src', "./graphics/favourite_red.png");
        $('img[id="' + trackID + '"]').attr('alt', "Y");
        var favourite = true;
        fav(favourite, trackID)
    }
    else {
        $('img[id="' + trackID + '"]').attr('src', "./graphics/favourite_black.png");
        $('img[id="' + trackID + '"]').attr('alt', "N");
        var favourite = false;
        fav(favourite, trackID)
    }
});

async function fav(favourite, trackID) {
    var sql = "UPDATE track SET favourite=" + favourite + " WHERE trackID=" + trackID;
    var update = await dBase.run(sql);
}

//###################
// SAVE APP SETTINGS
//###################
// Click event for settings close button
$(document).on('click', '#btnSettingsClose', function (event) {
    event.preventDefault();
    $("#divContent").load("./html/home.html");
    $.getScript("./js/home.js")
});

// Click event for settimgs browse button
$(document).on('click', '#btnMusicDirectory', function (event) {
    event.preventDefault();
    // Send message to main.js to open dialog box
    ipcRenderer.send("open_folder_dialog", ["music_directory", "Select Your Music Directory", "C:\\", "Select Folder", "openDirectory"]);
});

// Click event for settings save button
$(document).on('click', '#btnSettingsSave', function (event) {
    event.preventDefault();
    var settingsID = 1;
    var appName = $("#ipnAppName").val();
    var musicDirectory = $("#ipnMusicDirectory").val();
    var artSize = $("input[name='artSize']:checked").val();
    var artShape = $("input[name='artShape']:checked").val();
    var theme = $("input[name='theme']:checked").val();
    var global_ZoomFactor = $('#sltZoom').val();
    var notifications = $("input[name='notifications']:checked").val();

    // Regex to only allow alphanumeric characters and apostrophe in appName input
    appName = appName.replace(/[^a-z0-9']+/gi, "");

    updateSettings()

    async function updateSettings() {
        try {
            // Update settings table
            var sql = 'UPDATE settings SET appName="' + appName + '", musicDirectory="' + musicDirectory + '", artSize="' + artSize + '", artShape="' + artShape + '", zoom="' + global_ZoomFactor + '", notifications="' + notifications + '", theme="' + theme + '" WHERE settingsID=' + settingsID;
            var update = await dBase.run(sql);

            // Reload CSS file for theme
            $('#skin').replaceWith('<link id="skin" rel="stylesheet" type="text/css" href="./css/' + theme + '.css"/>')

            // Reset variable for global_Background
            switch (theme) {
                case "skindark":
                    global_Background = "#111111";
                    break;
                case "skinlight":
                    global_Background = "#eeeeee";
                    break;
                case "skinblue":
                    global_Background = "#0c4586";
            }

            // Update global variables
            global_AppName = appName + " Player";
            global_ArtIconSize = artSize;
            global_ArtIconShape = artShape;
            global_notifications = notifications;
            MUSIC_PATH = musicDirectory;

            // Show modal box confirmation
            $('#okModal').css('display', 'block');
            $(".modalFooter").empty();
            $('.modalHeader').empty();
            $('#okModalText').empty();
            $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
            $('#okModalText').append("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br>Settings have been updated in the database.<br>&nbsp<br>&nbsp</p >");
            var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
            $('.modalFooter').append(buttons);
            $("#btnOkModal").focus();
            $('.background').css('filter', 'blur(5px)');

            // Update placeholder in search box
            $("#ipnSearch").attr("placeholder", "Search " + global_AppName);

            // Reload app name in playing div
            $("#appName").text(global_AppName);
         
            // Dynamically set App zoom level
            global_Zoom = 1 - (1 - global_ZoomFactor) / global_Zoom;
            webFrame.setZoomFactor(global_Zoom);
            
            // Reload home page
            $("body").css("background", global_Background);
            $("#divContent").load("./html/home.html");
            $.getScript("./js/home.js")
        }
        catch (err){
            console.log(err)
        }
    }
});

//###################
// SYNC DIRECTORY
//###################
// Click event for Database Functions Sync Directory button
$(document).on('click', '#btnSyncDir', function (event) {
    event.preventDefault();
    btnSyncDirClick()
});

function btnSyncDirClick() {
    // Clear any previous selected directory
    $("#selectedDir").text("");
    // Send message to main.js to open dialog box
    ipcRenderer.send("open_folder_dialog", ["sync_directory", "Select Music Directory to Sync to Database", "C:\\", "Select Folder", "openDirectory"]);
}

// Cancel button on sync directory page
$(document).on('click', '#btnSyncCancel', function (event) {
    event.preventDefault();
    $("#divTrackListing").css("display", "none");
    $('#spnAtoZmenu').css('display', 'inline');
    $("#divContent").css("width", "auto");
    window.history.back();
});

// Change event when syncDirCheckAll is checked
$(document).on('click', '#cbxSyncDirAll', function () {
    // If select all checkbox is selected
    if (this.checked == true) {
        // Check all checkboxes
        $('.cbxSyncDir').each(function () { 
            this.checked = true;
        });
    }
    // If select all checkbox is unselected
    else {
        // Uncheck all checkboxes
        $('.cbxSyncDir').each(function () {
            this.checked = false;
        });
    }
});

// Click event for syncdirectory Sync button
$(document).on('click', '#btnSyncChecked', function () {
    event.preventDefault();

    // Display modal box updating directory
    $('#okModal').css('display', 'block');
    $('.modalHeader').empty();
    $('#okModalText').empty();
    $(".modalFooter").empty();
    $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
    $('#okModalText').append("<div class='modalIcon'><img src='./graphics/record.gif'></div><p>&nbsp<br>Updating external directory with selected albums.<br>&nbsp<br>&nbsp</p >");
    var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
    $('.modalFooter').append(buttons);
    $("#btnOkModal").focus();
    $('.background').css('filter', 'blur(5px)');

    // Sync functions
    syncDirectory();
});

function syncDirectory() {
    var musicDir = $("#selectedDir").text();
    // Get name of artist and album from table with checked checkboxes
    $("#tblSyncDirectory input[type=checkbox]:checked").each(function () {
        var row = $(this).closest("tr")[0];
        var artist = row.cells[1].innerText;
        var album = row.cells[2].innerText;
        // Replace encoded &amp with &
        artist = artist.replace(/&amp;/g, '&');
        album = album.replace(/&amp;/g, '&');
        ipcRenderer.send("sync_external_directory", [musicDir, MUSIC_PATH, artist, album])
    });
    $('#okModal').css('display', 'none');

    // Load home page
    // Display modal box update complete
    $('#okModal').css('display', 'block');
    $('.modalHeader').empty();
    $('#okModalText').empty();
    $(".modalFooter").empty();
    $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
    $('#okModalText').append("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br>Syncing directory.<br>&nbsp<br>&nbsp</p >");
    var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
    $('.modalFooter').append(buttons);
    $("#btnOkModal").focus();
    $('.background').css('filter', 'blur(5px)');
    // Load home page and return
    $("#divTrackListing").css("display", "none");
    $('#spnAtoZmenu').css('display', 'inline');
    $("#divContent").css("width", "auto");
    window.history.back();
}

// Function to check if URL for images exists, returns boolean value
function urlExists(url, callback) {
    $.ajax({
        type: 'HEAD',
        url: url,
        success: function () {
            callback(true);
        },
        error: function () {
            callback(false);
        }
    });
}

//##################
// EVENT LOOP
//##################
$(document).ready(function () {
    // Update smart data results
    updateSmartData("startup")

    //##################
    // In page navigation click events
    //##################
    // Click event to display artists albums
    $(document).on('click', '#ulArtists a', function (event) {
        event.preventDefault();
        // Get artistID from href
        var link = $(this).attr('href');
        var queryArtist = parseQuery(link)["artist"];
        global_ArtistID = queryArtist;
        // Load link
        $('#divContent').load(link);
        $(document).ajaxComplete(function () {
            $(document).scrollTop(0);
            global_TrackListing = false;
        });
    });

    // Display album tracks from lists wrapped in the jointClick class div
    $(document).on('click', '.divJointClick a', function (event) {
        event.preventDefault();
        // Get artistID from href
        var link = $(this).attr("href");
        var queryArtist = parseQuery(link)["artist"];
        global_ArtistID = queryArtist;
        var queryAlbum = parseQuery(link)["album"];
        global_AlbumID = queryAlbum;
        // Get window width
        var winWidth = $(window).width();
        // Get window height
        //var winHeight = $(window).height();
        //var height = (winHeight - 60);
        //var body = document.body;
        //var html = document.documentElement;

        // If screen is less than 1215px wide reset divTracklisting margin-left effectively hiding content div
        if (winWidth < 1215) {
            $("#divTrackListing").css("margin-left", "240px");
        }
        else {
            $("#divTrackListing").css("margin-left", "715px");
        }
        // Load link 
        $("#divContent").empty();
        $('#spnAtoZmenu').css('display', 'none')
        $("#divContent").css("width", "475px");
        $("#divContent").load("./html/artistalbums.html");
        $("#divTrackListing").css("display", "block");
        //$("#divTrackListing").css("min-height", height);
        $("#divTrackListing").load($(this).attr("href"));
        $(document).ajaxComplete(function () {
            $(document).scrollTop(0);
            global_TrackListing = true;
        });
    });

    // Click event to display genre albums
    $(document).on('click', '#ulAllGenres a', function (event) {
        event.preventDefault();
        // Get genreID from href
        var link = $(this).attr('href');
        var queryGenre = parseQuery(link)["genre"];
        global_GenreID = queryGenre;
        // Load link
        $('#divContent').load(link);
        $(document).ajaxComplete(function () {
            $(document).scrollTop(0);
            global_TrackListing = false;
        });
    });

    // Click event to display year albums
    $(document).on('click', '#ulAllYears a', function (event) {
        event.preventDefault();
        // Get genreID from href
        var link = $(this).attr('href');
        var queryYear = parseQuery(link)["year"];
        global_YearID = queryYear;
        // Load link
        $('#divContent').load(link);
        $(document).ajaxComplete(function () {
            $(document).scrollTop(0);
            global_TrackListing = false;
        });
    });

    // Click event to display playlist
    $(document).on('click', '#ulPlaylists a', function (event) {
        event.preventDefault();
        // Get genreID from href
        var link = $(this).attr('href');
        var queryPlaylist = parseQuery(link)["playlist"];
        global_PlaylistID = queryPlaylist;
        // Load link
        $("#divContent").css("width", "475px");
        $('#spnAtoZmenu').css('display', 'none')
        $("#divTrackListing").css("display", "block");
        //$("#divTrackListing").css("visibility", "visible");
        $("#divTrackListing").load($(this).attr("href"));
        $(document).ajaxComplete(function () {
            $(document).scrollTop(0);
            global_TrackListing = true;
        });
    });

    // Double click event on track table to play track
    $(document).on('dblclick', '#tblTracks tr.tracks', function () {
        // Highlight track clicked on
        var selected = $(this).hasClass("highlight");
        $("#tblTracks tr").removeClass("highlight");
        if (!selected) {
            $(this).addClass("highlight");
        }
        // Get track name clicked on
        global_TrackSelected = $(this).find("td:last").text();
        global_TrackName = $(this).find("td:first").text();
        // Update album artowrk
        var artist = $(this).find("td").eq(5).text();
        var album = $(this).find("td").eq(6).text();
        var artworkSource = MUSIC_PATH + artist + "/" + album + "/folder.jpg";
        $("#artwork").attr('src', artworkSource);

        // Get all tracksIDs for album from track listing table hidden last column
        global_Tracks = $('.tblTrackTable tr').find('td:last').map(function () {
            return $(this).text()
        }).get()

        playTrack()
    });

    // Double click event on search table to play track
    $(document).on('dblclick', '#tblSearch tr.tracks', function () {
        // Highlight track clicked on
        var selected = $(this).hasClass("highlight");
        $("#tblSearch tr").removeClass("highlight");
        if (!selected) {
            $(this).addClass("highlight");
        }
        // Get track name clicked on
        global_TrackSelected = $(this).find("td:last").text();
        global_TrackName = $(this).find("td").eq(3).text();
        // Update album artowrk
        var artist = $(this).find("td").eq(1).text();
        var album = $(this).find("td").eq(2).text();
        var artworkSource = MUSIC_PATH + artist + "/" + album + "/folder.jpg";
        $("#artwork").attr('src', artworkSource);

        // Get all tracksIDs for album from track listing table hidden last column
        global_Tracks = $('#tblSearch tr').find('td:last').map(function () {
            return $(this).text()
        }).get()
        playTrack()
    });

    // Click event on Biography button
    $(document).on('click', '#btnBiography', function () {
        event.preventDefault();
        // Check if online
        var connection = navigator.onLine;
        // If connected to internet
        if (connection) {
            // Get window width
            var winWidth = $(window).width();
            // Get window height
            var winHeight = $(window).height();
            var height = (winHeight - 60);

            // If screen is less than 1215px wide reset divTracklisting margin-left effectively hiding content div
            if (winWidth < 1215) {
                $("#divTrackListing").css("margin-left", "240px");
            }
            else {
                $("#divTrackListing").css("margin-left", "715px");
            }
            // Load link 
            $("#divContent").css("width", "475px");
            $("#divTrackListing").css("display", "block");
            $("#divTrackListing").load("./html/biography.html");
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
    });

    // Click event on Discography button
    $(document).on('click', '#btnDiscography', function () {
        event.preventDefault();
        // Check if online
        var connection = navigator.onLine;
        // If connected to internet
        if (connection) {
            // Get window width
            var winWidth = $(window).width();
            // Get window height
            var winHeight = $(window).height();
            var height = (winHeight - 60);

            // If screen is less than 1215px wide reset divTracklisting margin-left effectively hiding content div
            if (winWidth < 1215) {
                $("#divTrackListing").css("margin-left", "240px");
            }
            else {
                $("#divTrackListing").css("margin-left", "715px");
            }
            // Load link 
            $("#divContent").css("width", "475px");
            $("#divTrackListing").css("display", "block");
            $("#divTrackListing").load("./html/discography.html");
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
    });

    // Click event on Recommends button
    $(document).on('click', '#btnRecommends', function () {
        event.preventDefault();
        // Check if online
        var connection = navigator.onLine;
        if (connection) {
            // Get window width
            var winWidth = $(window).width();
            // Get window height
            var winHeight = $(window).height();
            var height = (winHeight - 60);

            // If screen is less than 1215px wide reset divTracklisting margin-left effectively hiding content div
            if (winWidth < 1215) {
                $("#divTrackListing").css("margin-left", "240px");
            }
            else {
                $("#divTrackListing").css("margin-left", "715px");
            }
            // Load link 
            $("#divContent").css("width", "475px");
            $("#divTrackListing").css("display", "block");
            $("#divTrackListing").load("./html/recommendations.html");
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
    });


    // Click event for album info
    $(document).on('click', '#btnInfoAlbum', function () {
        event.preventDefault();
        // Check if online
        var connection = navigator.onLine;
        // If connected to internet
        if (connection) {
            // Load link 
            $("#divTrackListing").load("./html/albuminfo.html");
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
    });

    // Open external web link from recommendations page
    $(document).on('click', '.divRecommends a', function (event) {
        ipcRenderer.send('open_external', this.href)
    });

    // Open external web link from new releases page
    $(document).on('click', '.divNewReleases a', function (event) {
        ipcRenderer.send('open_external', this.href)
    });

    // Open external web link from discography page
    $(document).on('click', '#tblDiscog tr a', function (event) {
        ipcRenderer.send('open_external', this.href)
    });

    // Open external github link from about modal
    $(document).on('click', '#githubLink', function () {
        ipcRenderer.send('open_external', this.href)
    });

    // Open external web link from biography page
    $(document).on('click', '#ulLinks li a', function (event) {
        ipcRenderer.send('open_external', this.href)
    });

    // Highlight track in display album when clicked on
    $(document).on('click', '#tblTracks tr.tracks', function () {
        // Change speaker icon source to black if light colour theme
        if (global_Background == '#eeeeee') {
            $('#speaker').attr('src', './graphics/speaker_black.png');
        }  
        // Highlight track clicked on
        var selected = $(this).hasClass("highlight");
        $("#tblTracks tr").removeClass("highlight");
    
        if (!selected) {
            $(this).addClass("highlight");
            // Change speaker icon to white when highlighted 
            if ($(this).find("td").eq(0).hasClass("playing")) {
                $('#speaker').attr('src', './graphics/speaker_white.png');
            }
        }
        // Get track name clicked on
        global_TrackSelected = $(this).find("td:last").text();
        global_TrackName = $(this).find("td:first").text();
        // Update album artowrk
        var artist = $(this).find("td").eq(5).text();
        var album = $(this).find("td").eq(6).text();
        var artworkSource = MUSIC_PATH + artist + "/" + album + "/folder.jpg";
        $("#artwork").attr('src', artworkSource);
    });

    // Highlight track in Songs table when clicked on
    $(document).on('click', '#tblSongs tr.tracks', function () {
        // Highlight track clicked on
        var selected = $(this).hasClass("highlight");
        $("#tblSongs tr").removeClass("highlight");
        if (!selected) {
            $(this).addClass("highlight");
        }
        // Get track name clicked on
        global_TrackSelected = $(this).find("td:last").text();
        global_TrackName = $(this).find("td:first").text();
    });

    // Highlight track in Search table when clicked on
    $(document).on('click', '#tblSearch tr.tracks', function () {
        // Highlight track clicked on
        var selected = $(this).hasClass("highlight");
        $("#tblSearch tr").removeClass("highlight");
        if (!selected) {
            $(this).addClass("highlight");
        }
        // Get track name clicked on
        global_TrackSelected = $(this).find("td:last").text();
        global_TrackName = $(this).find("td:first").text();
    });

    // Highlight album in Import Music table when clicked on
    $(document).on('click', '#tblImportMusic tr.tracks', function () {
        // Highlight track clicked on
        var selected = $(this).hasClass("highlight");
        $("#tblImportMusic tr").removeClass("highlight");
        // Disable buttons in edit album
        $("#btnArtworkAlbum").prop("disabled", true);       
        if (!selected) {
            $(this).addClass("highlight");
            // Enable buttons in edit album
            $("#btnArtworkAlbum").prop("disabled", false);
        }
    });

    // Click event on artwork on displayalbum page to display large artwork
    $(document).on('click', '#displayAlbumArtwork', async function (event) {
        event.preventDefault();
        // Get artist and album name from database
        var sql = "SELECT artist.artistName, album.albumName FROM artist INNER JOIN album ON artist.artistID=album.artistID WHERE album.albumID=?";
        var row = await dBase.get(sql, global_AlbumID)
        var artist = row.artistName;
        var album = row.albumName;
        var backCoverSource = MUSIC_PATH + artist + "/" + album + "/backcover.jpg";

        // Remove image title on mouseover
        $("#artModalImage").prop('title', '');
        ipcRenderer.send("check_backcover", [backCoverSource])

        // Get AlbumArtXLarge.jpg file path
        var modifiedDate = Date().toLocaleString();
        var artworkSource = MUSIC_PATH + artist + "/" + album + "/AlbumArtXLarge.jpg?modified=" + modifiedDate;

        colour()

        async function colour() {
            const { canvas, context } = await drawImage(artworkSource);
            const result = await calculateResult(canvas, context);
            var domColour = result

            domColour = domColour.slice(0, -1)
            domColour = domColour + ",0.75)";

            // Display large artwork modal box            
            // Find artModalTop = screen height - 600 (artModal height) - 14 (menu bar height) / 2
            var screenHeight = $(window).height();
            var artModalTop = (screenHeight - 614) / 2;
            $('#frontArtModal').css('padding-top', artModalTop + 'px');
            $('#artFrontModalContent').css('height', 608);
            $('.background').css('filter', 'blur(5px)');
            $("#artModalImage").attr('src', artworkSource);
            $('#frontArtModal').css('display', 'block');
            $('#artModalImage').css('display', 'block');
            $('#frontArtModal').css('background-color', domColour);
        };
    });

    // Add backcover filepath to backcover image src.
    ipcRenderer.on('from_check_backcover', (event, data) => {
        var backcoverSource = data[0];
        // Add title to image on mouseover
        $("#artModalImage").prop('title', 'Click for back cover');
        $("#artModalImage").css('cursor', 'pointer');
        $("#backcoverImage").attr('src', backcoverSource);
        global_Backcover = true;
    });

    // Switch from front to back cover when image clicked
    $(document).on('click', '#artModalImage', function () {
        if (global_Backcover == true) {
            $('#backcoverImage').css('display', 'block');
            var backcoverSource = $('#backcoverImage').attr('src');

            colour()

            async function colour() {
                const { canvas, context } = await drawImage(backcoverSource);
                const result = await calculateResult(canvas, context);
                var domColour = result

                domColour = domColour.slice(0, -1)
                domColour = domColour + ",0.75)";

                var screenHeight = $(window).height();
                var artModalTop = (screenHeight - 614) / 2;
                $('#backArtModal').css('padding-top', artModalTop + 'px');
                $('#backArtModal').css('background-color', domColour);
                $("#frontArtModal").fadeOut('slow');
                $("#backArtModal").fadeIn('slow');
                var backcoverHeight = $('#backcoverImage').height();
                $('#artBackModalContent').css('height', backcoverHeight + 8);
            };
        }
    });

    // Switch from back to front cover when image clicked
    $(document).on('click', '#backcoverImage', function () {
        if (global_Backcover == true) {
            var artworkSource = $('#artModalImage').attr('src');

            colour()

            async function colour() {
                const { canvas, context } = await drawImage(artworkSource);
                const result = await calculateResult(canvas, context);
                var domColour = result

                domColour = domColour.slice(0, -1)
                domColour = domColour + ",0.75)";
                $('#frontArtModal').css('background-color', domColour);
                $("#frontArtModal").fadeIn('slow');
                $("#backArtModal").fadeOut('slow');
            };
        }
    });

    // Close when clicked outside art modal boxes
    // Album Art
    $(document).on('click', '.artModal', function (event) {
        // Ignore if images are clicked
        if (event.target.id == "artModalImage" || event.target.id == "backcoverImage") {
            return false;
        }
        else {
            // Close art modal box
            $(".artModal").fadeOut("slow")
            $('.background').css('filter', 'blur(0px)');
            $("#artModalImage").css('cursor', 'default');
            global_Backcover = false;
        }
    });
   
    // Close when clicked Wiki Biography Image
    $(document).on('click', '#bioArtModal', function (event) {
        if (event.target.id != "bioArtModalImage") {
            // Close wiki bio art modal box
            $("#bioArtModal").fadeOut("slow", function () {
                // Animation complete.
                $('#bioArtModal').css('display', 'none');
            });
            $('.background').css('filter', 'blur(0px)');
        }
    });

    // Click event on artist image in biography
    $(document).on('click', '#displayBioArtwork', async function (event) {
        event.preventDefault();
        var artworkSource = $("#bioArtworkUrl").text();

        colour()

        async function colour() {
            // Function to find dominant colour of image
            const { canvas, context } = await drawImage(artworkSource);
            const result = await calculateResult(canvas, context);
            var domColour = result
            domColour = domColour.slice(0, -1)
            domColour = domColour + ",0.75)";

            // Get width and height of screen and image
            var screenHeight = $(window).height();
            var imageHeight = canvas.height;
            var imageWidth = canvas.width;

            if (imageWidth < 600) {
                // Vertcally position image in centre of screen if image is less than 600px width
                var bioArtModalTop = (screenHeight - (imageHeight - 14)) / 2;
                if (bioArtModalTop < 12) {
                    bioArtModalTop = 12;
                }
                // Set css styling for modal image
                $('.bioArtModal').css('padding-top', bioArtModalTop + 'px');
                $('#bioArtModalImage').css('width', imageWidth);
                $('.bioArtModalContent').css('width', imageWidth + 8);
                $('.bioArtModalClose').css('left', imageWidth - 15);
            }
            else {
                // Calcualte ratio to resize image to 600px width to resize image height
                var imageRatio = 600 / imageWidth
                imageHeight = imageHeight * imageRatio
                // Vertcally position image in centre of screen if image is more than 600px width
                var bioArtModalTop = (screenHeight - (imageHeight - 14)) / 2;
                if (bioArtModalTop < 12) {
                    bioArtModalTop = 12;
                }
                // Set css styling for modal image
                $('.bioArtModal').css('padding-top', bioArtModalTop + 'px');
                $('#bioArtModalImage').css('width', '600px');
                $('.bioArtModalContent').css('width', '608px');
                $('.bioArtModalClose').css('left', '585px');
            }
            
            // Display large artwork modal box
            $('.background').css('filter', 'blur(5px)');            
            $("#bioArtModalImage").attr('src', artworkSource);
            $('.bioArtModal').css('display', 'block');
            $('.bioArtModal').css('background-color', domColour);
        };
    });

    //##################
    // Expand and Collapse player functions
    //##################
    // Library display
    $(document).on('click', '#btnLibraryExpand', function () {
        global_playingDivClicked = "btnLibraryExpand";
        if (global_LibraryExpand == false) {
            $("button#btnLibraryExpand").css("background", "url(./graphics/collapse.png) no-repeat");
            $("#divMusicLibrary").slideToggle(500);
            global_LibraryExpand = true;
            // Call playingHeight function after div slide animation complete
            const timeOut = setTimeout(playingHeight, 600);
        }
        else {
            $("button#btnLibraryExpand").css("background", "url(./graphics/expand.png) no-repeat");
            $("#divMusicLibrary").slideToggle(500);
            global_LibraryExpand = false;           
            // Call playingHeight function after div slide animation complete
            const timeOut = setTimeout(playingHeight, 600);
        }
    });

    // Mood Select
    $(document).on('click', '#btnMoodExpand', function () {
        event.preventDefault();
        global_playingDivClicked = "btnMoodExpand";
        if (global_MoodExpand == false) {
            $("button#btnMoodExpand").css("background", "url(./graphics/collapse.png) no-repeat");
            $("#divMoodSelect").slideToggle(500);
            global_MoodExpand = true;
            // Call playingHeight function after div slide animation complete
            const timeOut = setTimeout(playingHeight, 600);
        }
        else {           
            $("button#btnMoodExpand").css("background", "url(./graphics/expand.png) no-repeat");
            $("#divMoodSelect").slideToggle(500);
            global_MoodExpand = false;           
            // Call playingHeight function after div slide animation complete
            const timeOut = setTimeout(playingHeight, 600);
        }
    });

    // Genre Select
    $(document).on('click', '#btnGenreExpand', function () {
        event.preventDefault();
        global_playingDivClicked = "btnGenreExpand";
        if (global_GenreExpand == false) {
            $("button#btnGenreExpand").css("background", "url(./graphics/collapse.png) no-repeat");
            $("#divGenreSelect").slideToggle(500);
            global_GenreExpand = true;
            // Call playingHeight function after div slide animation complete
            const timeOut = setTimeout(playingHeight, 600);
        }
        else {           
            $("button#btnGenreExpand").css("background", "url(./graphics/expand.png) no-repeat");
            $("#divGenreSelect").slideToggle(500);
            global_GenreExpand = false;            
            // Call playingHeight function after div slide animation complete
            const timeOut = setTimeout(playingHeight, 600);
        }
    });

    // Player Functions
    $(document).on('click', '#btnPlayerExpand', function () {
        event.preventDefault();
        global_playingDivClicked = "btnPlayerExpand";
        if (global_PlayerExpand == false) {
            $("button#btnPlayerExpand").css("background", "url(./graphics/collapse.png) no-repeat");
            $("#divPlayerFunctions").slideToggle(500);
            global_PlayerExpand = true;
            // Call playingHeight function after div slide animation complete
            const timeOut = setTimeout(playingHeight, 600);
        }
        else {
            $("button#btnPlayerExpand").css("background", "url(./graphics/expand.png) no-repeat");
            $("#divPlayerFunctions").slideToggle(500);
            global_PlayerExpand = false;
            // Call playingHeight function after div slide animation complete
            const timeOut = setTimeout(playingHeight, 600);
        }
    });

    // Database Functions
    $(document).on('click', '#btnDatabaseExpand', function () {
        event.preventDefault();
        global_playingDivClicked = "btnDatabaseExpand";
        if (global_DatabaseExpand == false) {
            $("button#btnDatabaseExpand").css("background", "url(./graphics/collapse.png) no-repeat");
            $("#divDatabaseFunctions").slideToggle(500);
            global_DatabaseExpand = true;
            // Call playingHeight function after div slide animation complete
            const timeOut = setTimeout(playingHeight, 600);
        }
        else {            
            $("button#btnDatabaseExpand").css("background", "url(./graphics/expand.png) no-repeat");
            $("#divDatabaseFunctions").slideToggle(500);
            global_DatabaseExpand = false;           
            // Call playingHeight function after div slide animation complete
            const timeOut = setTimeout(playingHeight, 600);
        }
    });

    //#################################
    // Home page buttons show more/less
    //#################################
    // Recently added albums
    $(document).on('click', '#btnAddedShow', function () {
        if (global_AddedExpand == false) {
            if (global_ArtIconSize == "small") {
                $(".albumDisplay li.addedHidden").slideToggle("slow");
            }
            else {
                $(".albumDisplayLarge li.addedHidden").slideToggle("slow");
            }
            $("button#btnAddedShow").css("background", "url(./graphics/collapse_large.png) no-repeat");
            global_AddedExpand = true;
        }
        else {
            if (global_ArtIconSize == "small") {
                $(".albumDisplay li.addedHidden").slideToggle("slow");
            }
            else {
                $(".albumDisplayLarge li.addedHidden").slideToggle("slow");
            }
            $("button#btnAddedShow").css("background", "url(./graphics/expand_large.png) no-repeat");
            global_AddedExpand = false;
        }
    });

    // Recently played albums
    $(document).on('click', '#btnPlayedShow', function () {
        if (global_PlayedExpand == false) {
            if (global_ArtIconSize == "small") {
                $(".albumDisplay li.playedHidden").slideToggle("slow");
            }
            else {
                $(".albumDisplayLarge li.playedHidden").slideToggle("slow");
            }
            $("button#btnPlayedShow").css("background", "url(./graphics/collapse_large.png) no-repeat");
            global_PlayedExpand = true;
        }
        else {
            if (global_ArtIconSize == "small") {
                $(".albumDisplay li.playedHidden").slideToggle("slow");
            }
            else {
                $(".albumDisplayLarge li.playedHidden").slideToggle("slow");
            }
            $("button#btnPlayedShow").css("background", "url(./graphics/expand_large.png) no-repeat");
            global_PlayedExpand = false;
        }
    });

    // Most played albums
    $(document).on('click', '#btnMostPlayedShow', function () {
        if (global_MostPlayedExpand == false) {
            if (global_ArtIconSize == "small") {
                $(".albumDisplay li.mostPlayedHidden").slideToggle("slow");
            }
            else {
                $(".albumDisplayLarge li.mostPlayedHidden").slideToggle("slow");
            }
            $("button#btnMostPlayedShow").css("background", "url(./graphics/collapse_large.png) no-repeat");
            global_MostPlayedExpand = true;
        }
        else {
            if (global_ArtIconSize == "small") {
                $(".albumDisplay li.mostPlayedHidden").slideToggle("slow");
            }
            else {
                $(".albumDisplayLarge li.mostPlayedHidden").slideToggle("slow");
            }
            $("button#btnMostPlayedShow").css("background", "url(./graphics/expand_large.png) no-repeat");
            global_MostPlayedExpand = false;
        }
    });

    // Biography page button show more/less
    $(document).on('click', '#btnBioTextShow', function () {
        if (global_BioTextExpand == false) {
            $("#bioTextHidden").slideToggle("slow");
            $("button#btnBioTextShow").css("background", "url(./graphics/collapse_large.png) no-repeat");
            $("#bioButtonHeading").text(" Read Less");
            global_BioTextExpand = true;
        }
        else {
            $("#bioTextHidden").slideToggle("slow");
            $("button#btnBioTextShow").css("background", "url(./graphics/expand_large.png) no-repeat");
            $("#bioButtonHeading").text(" Read More");
            global_BioTextExpand = false;
        }
    });

    // Click event for queued music
    $(document).on('click', '#btnQueue', function () {
        btnQueueClicked();
    });

    // Click event for queue album
    $(document).on('click', '#btnQueueAlbum', function () {
        btnQueueAlbumClicked();
    });

    // Click event for Clear Queued music
    $(document).on('click', '#btnClearQueued', function () {
        btnClearQueuedClicked();
    });

    // Button click to close modal box
    $(document).on('click', '#btnOkModal', function () {
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('#okModal').css('display', 'none');
        $('.background').css('filter', 'blur(0px)');
    })

    // Button click to close modal box from import to database
    $(document).on('click', '#btnOkImport', function () {
        $('#okModal').css('display', 'none');
        // Load home page
        $("#divContent").load("./html/home.html");
        $.getScript("./js/home.js")
        // Update library stats in playing div
        libraryStats()
        $('.background').css('filter', 'blur(0px)');
    })

    // Button click to close modal box from edit to database
    $(document).on('click', '#btnOkEdit', function () {
        $('#okModal').css('display', 'none');
        // Load artist page
        $("#divContent").load("./html/artistalbums.html?artist=" + global_ArtistID);
        // Update library stats in playing div
        libraryStats()
        $('.background').css('filter', 'blur(0px)');
    })

    // Close OK modal box on X in header
    $(document).on('click', '#btnXModal', function () {
        $('#okModal').css('display', 'none');
        $('.background').css('filter', 'blur(0px)');       
    })

    $(document).on('click', '#artModalClose', function () {
        $("#artModal").fadeOut("slow");
        $('.background').css('filter', 'blur(0px)');
        global_Backcover = false;
        $("#artModalImage").css('cursor', 'default');
    })

    $(document).on('click', '#bioArtModalClose', function () {
        $("#bioArtModal").fadeOut("slow", function () {
            // Animation complete.
            $('#bioArtModal').css('display', 'none');
        });
        $('.background').css('filter', 'blur(0px)');
    })

    // Button click to cancel modal box
    $(document).on('click', '#btnCancelModal', function () {
        $('#okModal').css('display', 'none');
        $('.background').css('filter', 'blur(0px)');
    })
});



