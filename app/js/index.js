// Gracenote Client ID: <CLIENT>12398848-977A13ABAD0F2E143D38E61AF28B78DB</CLIENT>
// Gracenote User ID Geoff: <USER>262426348528170930-5841932202A3C37AF922C859220E4E3F</USER>
// Spare User ID: 51049424051760460-5041AA75A7C8D23DFDF13F83A2F70A07

// Declare global varibales here
// App variables
var global_AppName;
var global_SrnWidth;

// Expand/Collapse DIVs
var global_AddedExpand = false;
var global_DatabaseExpand = false;
var global_GenreExpand = false;
var global_LibraryExpand = true;
var global_MostPlayedExpand = false;
var global_MoodExpand = false;
var global_PlayedExpand = false;
var global_PlayerExpand = false;

// Settings variables
var global_ArtIconSize;
var global_ArtIconShape;
var global_Zoom = 1;
var global_ZoomFactor = 0;
var global_notifications;
var global_Background;
var global_Version;

// Player variables
var global_ImportMode = "";
var global_UserID = null;
var global_Playing = false;
var global_Paused = false;
var global_Queued = false;
var global_TrackListing = false; // Used for the shuffle function

// Menu variables
var global_AlbumID;
var global_ArtistID;
var global_GenreID = "";
var global_PlaylistID;
var global_ShuffleTracks = [];
var global_AlbumSort = "a2z";
var global_TrackSort = "a2z";
var global_GenreSort = "a2z";
var global_SubGenre = "";
var global_TrackID;
var global_TrackName;
var global_Tracks = [];
var global_TrackSelected;
var global_YearID;

// URLs
var gracenoteUrl = "https://c12398848.web.cddbp.net/webapi/xml/1.0/";
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
//const DB_PATH = app_path + "/peerless-player-music_test.db";

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

    // Get Gracenote User ID
    var settingsID = 1;
    var sql = "SELECT * FROM settings WHERE settingsID=?";
    var row = await dBase.get(sql, settingsID)

    // Get and log Gracenote User ID
    global_UserID = row.userID;
    console.log("GN User ID: " + global_UserID)

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
        // Load pages into divs
        $("#divControlsHeader").load("./html/controlsheader.html");
        $("#divPlaying").load("./html/playing.html");
        $("#divContent").load("./html/home.html");
    }

    // Send message to main to check for playlists directory in music folder
    ipcRenderer.send("check_playlists", [MUSIC_PATH, "Playlists/"])
}

// This function prevents eval() running in app for security purposes.
window.eval = global.eval = function () {
    throw new Error(`window.eval not supported`)
}

// FUNCTION TO GET NEW GRAVENOTE USER ID
function newUser() {
    console.log("Register new userID")
    // Send xml query to Gracenote to register new user
    var queryRegister = "<?xml version='1.0' encoding='UTF-8'?><QUERIES><QUERY CMD='REGISTER'><CLIENT>12398848-977A13ABAD0F2E143D38E61AF28B78DB</CLIENT></QUERY></QUERIES>";

    // Call ajax function albumQuery
    registerQuery(queryRegister).done(registerUser);

    // Function to send ajax xml query to Gracenote server
    function registerQuery(query) {
        var queryRegister = query;
        return $.ajax({
            url: gracenoteUrl,
            data: queryRegister,
            type: "POST",
            datatype: "xml"
        });
    }

    // Function to process response of ajax xml query for new user
    async function registerUser(response) {
        console.log(response)
        // Get userID from XML response
        var userID = $(response).find("USER").text();
        var settingsID = 1;
        console.log("New User ID = " + userID)

        // Add userID to settings table in database
        var sql = "UPDATE settings SET userID='" + userID + "' WHERE settingsID=" + settingsID;
        var update = await dBase.run(sql);
        global_UserID = userID;
    }
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

ipcRenderer.on('Help About', (event) => {
    $('#okModal').css('display', 'none');
    // Display modal box updating directory
    $('#okModal').css('display', 'block');
    $('.modalHeader').empty();
    $('#okModalText').empty();
    $(".modalFooter").empty();
    var currentDate = new Date();
    var currentYear = currentDate.getFullYear();
    $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>About Peerless Player</h2>');
    $('#okModalText').append("<div class='modalIcon'><img src='./graphics/peerless_player_thumb.png'></div><p><b>Author:</b> Geoff Peerless &copy " + currentYear + "<br><b>Version:</b> " + global_Version + "<br><b>URL:</b> github.com/MrPeerless/peerless-player<br><b>Email:</b> geoffpeerless@hotmail.com<br><b>License:</b> ISC&nbsp<br>&nbsp</p >");
    var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
    $('.modalFooter').append(buttons);
    $("#btnOkModal").focus();
    $('.background').css('filter', 'blur(5px)');
});

ipcRenderer.on('Help Release', (event) => {
    $('#okModal').css('display', 'none');
    // Display modal box updating directory
    $('#okModal').css('display', 'block');
    $('.modalHeader').empty();
    $('#okModalText').empty();
    $(".modalFooter").empty();
    $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>Release Notes Version: ' + global_Version + '</h2>');
    $('#okModalText').append("<div class='modalIcon'><img src='./graphics/peerless_player_thumb.png'></div><p>1. Removed import /export.js db files.<br>2. Moved shell operations to main.js<br>3. Moved image operations to main.js<br>4. Moved fs operations to main.js<br>5. Added blur effect to modal background.<br>6. Updated to Electron ^ 8.2.3.<br>7. Disabled remote module.<br>8. Installed sanitize-html 1.25.0.<br>9. Screened user input.<br>10. Enabled Content Security Policy.<br>11. Minor bug fixes.<br> &nbsp</p >");
    var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
    $('.modalFooter').append(buttons);
    $("#btnOkModal").focus();
    $('.background').css('filter', 'blur(5px)');
});

ipcRenderer.on('Help Shortcuts', (event) => {
    $("#divTrackListing").css("display", "none");
    $("#divContent").css("width", "auto");
    $('#divContent').load('./html/keyboardshortcuts.html');
    // Enable btnSync
    $("#btnSync").prop("disabled", false);
});

ipcRenderer.on('Help Guide', (event) => {
    $("#divTrackListing").css("display", "none");
    $("#divContent").css("width", "auto");
    $('#divContent').load('./html/userguide.html');
    // Enable btnSync
    $("#btnSync").prop("disabled", false);
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

}

// Close button on display album tracks
$(document).on('click', '#btnClose', function (event) {
    event.preventDefault();
    $("body").css("background", global_Background);
    $("#divTrackListing").css("display", "none");
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
            //$("#divTrackListing").css("min-height", height);
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
            //$("#divTrackListing").css("min-height", height);
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
            //$("#divTrackListing").css("min-height", height);
            $("#divTrackListing").load("./html/recommends.html");
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

    // Open external web link from discography page
    $(document).on('click', '#tblDiscog tr a', function (event) {
        ipcRenderer.send('open_external', this.href)
    });

    // Open external wikipedia link from biography page
    $(document).on('click', '#bioWikiLink', function () {
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

    // Highlight album in Gracenote table when clicked on
    $(document).on('click', '#tblGracenote tr.tracks', function () {
        // Highlight track clicked on
        var selected = $(this).hasClass("highlight");
        $("#tblGracenote tr").removeClass("highlight");
        // Disable buttons in edit album
        $("#btnGetGracenote").prop("disabled", true);
        //$("#btnManual").prop("disabled", true);
        $("#btnArtworkAlbum").prop("disabled", true);
        $("#btnSearchGracenote").prop("disabled", true);
        $("#btnDownloadGracenote").prop("disabled", true);        
        if (!selected) {
            $(this).addClass("highlight");
            // Enable buttons in edit album  btnManual
            $("#btnGetGracenote").prop("disabled", false);
            //$("#btnManual").prop("disabled", false);
            $("#btnArtworkAlbum").prop("disabled", false);
            $("#btnSearchGracenote").prop("disabled", false);
            $("#btnDownloadGracenote").prop("disabled", false);
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

        // Get AlbumArtXLarge.jpg file path
        //try {
        var modifiedDate = Date().toLocaleString();
        var artworkSource = MUSIC_PATH + artist + "/" + album + "/AlbumArtXLarge.jpg?modified=" + modifiedDate;
        //}

        colour()

        async function colour() {
            const { canvas, context } = await drawImage(artworkSource);
            const result = await calculateResult(canvas, context);
            var domColour = result

            domColour = domColour.slice(0, -1)
            domColour = domColour + ",0.75)";

            // Display large artwork modal box
            $('.background').css('filter', 'blur(5px)');
            $('.artModal').css('display', 'block');
            $("#artModalImage").attr('src', artworkSource);
            $('.artModal').css('background-color', domColour);
        };
    });

    // Click event on artist image in biography
    $(document).on('click', '#displayBioArtwork', async function (event) {
        event.preventDefault();
        var artworkSource = $("#bioArtworkUrl").text();

        colour()

        async function colour() {
            const { canvas, context } = await drawImage(artworkSource);
            const result = await calculateResult(canvas, context);
            var domColour = result

            domColour = domColour.slice(0, -1)
            domColour = domColour + ",0.75)";

            // Display large artwork modal box
            $('.background').css('filter', 'blur(5px)');
            $('.bioArtModal').css('display', 'block');
            $("#bioArtModalImage").attr('src', artworkSource);
            $('.bioArtModal').css('background-color', domColour);
        };
    });

    //##################
    // Expand and Collapse player functions
    //##################
    // Library display
    $(document).on('click', '#btnLibraryExpand', function () {
        if (global_LibraryExpand == false) {
            $("button#btnLibraryExpand").css("background", "url(./graphics/collapse.png) no-repeat");
            $("#divMusicLibrary").slideToggle("slow");
            global_LibraryExpand = true;
        }
        else {
            $("button#btnLibraryExpand").css("background", "url(./graphics/expand.png) no-repeat");
            $("#divMusicLibrary").slideToggle("slow");
            global_LibraryExpand = false;
        }
    });
    // Mood Select
    $(document).on('click', '#btnMoodExpand', function () {
        event.preventDefault();
        if (global_MoodExpand == false) {
            $("button#btnMoodExpand").css("background", "url(./graphics/collapse.png) no-repeat");
            $("#divMoodSelect").slideToggle("slow");
            global_MoodExpand = true;
        }
        else {
            $("button#btnMoodExpand").css("background", "url(./graphics/expand.png) no-repeat");
            $("#divMoodSelect").slideToggle("slow");
            global_MoodExpand = false;
        }
    });

    // Genre Select
    $(document).on('click', '#btnGenreExpand', function () {
        if (global_GenreExpand == false) {
            $("button#btnGenreExpand").css("background", "url(./graphics/collapse.png) no-repeat");
            $("#divGenreSelect").slideToggle("slow");
            global_GenreExpand = true;
        }
        else {
            $("button#btnGenreExpand").css("background", "url(./graphics/expand.png) no-repeat");
            $("#divGenreSelect").slideToggle("slow");
            global_GenreExpand = false;
        }
    });

    // Database Functions
    $(document).on('click', '#btnDatabaseExpand', function () {
        if (global_DatabaseExpand == false) {
            $("button#btnDatabaseExpand").css("background", "url(./graphics/collapse.png) no-repeat");
            $("#divDatabaseFunctions").slideToggle("slow");
            global_DatabaseExpand = true;
        }
        else {
            $("button#btnDatabaseExpand").css("background", "url(./graphics/expand.png) no-repeat");
            $("#divDatabaseFunctions").slideToggle("slow");
            global_DatabaseExpand = false;
        }
    });

    // Player Functions
    $(document).on('click', '#btnPlayerExpand', function () {
        if (global_PlayerExpand == false) {
            $("button#btnPlayerExpand").css("background", "url(./graphics/collapse.png) no-repeat");
            $("#divPlayerFunctions").slideToggle("slow");
            global_PlayerExpand = true;
        }
        else {
            $("button#btnPlayerExpand").css("background", "url(./graphics/expand.png) no-repeat");
            $("#divPlayerFunctions").slideToggle("slow");
            global_PlayerExpand = false;
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

    $(document).on('click', '#artModalImage', function () {
        $('#artModal').css('display', 'none');
        $('.background').css('filter', 'blur(0px)');
    })

    $(document).on('click', '#bioArtModalImage', function () {
        $('#bioArtModal').css('display', 'none');
        $('.background').css('filter', 'blur(0px)');
    })

    // Button click to cancel modal box
    $(document).on('click', '#btnCancelModal', function () {
        $('#okModal').css('display', 'none');
        $('.background').css('filter', 'blur(0px)');
    })
});



