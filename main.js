//'use strict';
// SET VARIABLES
//---------------
process.title = "Peerless Player"
const { electron, app, BrowserWindow, ipcMain, dialog } = require('electron');// Require electron modules
const { autoUpdater } = require('electron-updater');// Require electron-updater for auto updates
const shell = require('electron').shell;// Require shell to open external websites in default browser
const path = require('path');// Require Path module
const fs = require("fs");// Require FS module
const { readFileSync } = require('fs'); // To read json files

//var request = require('request'); // Used for saving images
var request = require('request').defaults({ strictSSL: false }); // defaults as downloading art images throws 'certificate expired' error message

// Get local app data path
var data_path = app.getPath('userData')
//console.log("userData :: " + app.getPath('userData'));

var Jimp = require('jimp');// Require Jimp for resizing images
var jsmediatags = require("jsmediatags"); // To read ID3 tages in audio files

// Read variables from resources file in root dir.
var resources = JSON.parse(readFileSync('./resources/data.json'));
// Get spotify api keys
var client_id = resources.clientID;
var client_secret = resources.client_secret;

// Create pi_json data file in userData path
var jsonData = '{"artist":"Peerless-Pi-Player", "album":"It\'s Music To Your Ears", "track":"Version 0.1.0", "playTime":"", "favourite":"", "timeStamp":"1"}';
fs.writeFileSync(data_path + "/pi_data.json", jsonData)

//#######################
// CREATE RENDERER WINDOW
//------------------------
// Global reference of the window object
let win

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1000,
        height: 600,
        icon: (path.join(__dirname, './app/graphics/peerless_player.ico')),
        backgroundColor: '#ffffff',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: false,
            //nodeIntegration: false,
            //contextIsolation: true,
            //enableRemoteModule: false,
            //preload: path.join(__dirname, './app/js/preload.js'),
        },
    });

    // Maximise window once created
    win.maximize()
    // Get path to sqlite script
    var data_base = path.resolve(__dirname + "/app/js/sqlite_async")
    // Load index.html into window with app path in query string
    win.loadURL(`file://${__dirname}/app/index.html?path=${data_path}=data=${data_base}`);
    // Show window once all contents loaded
    win.once('ready-to-show', () => {
        win.show();
        // Check for updates
        autoUpdater.checkForUpdatesAndNotify();
    })

    // Open the DevTools.
    //win.webContents.openDevTools()

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object
        win = null
    })

    //Show menu
    require('./app/js/mainmenu.js') 
}

//##############
// APP FUNCTIONS
//---------------
// Once electron has initialised create browser window
app.on('ready', () => {
    // Loading non-context-aware native module in renderer flag: for Sqlite3
    app.allowRendererProcessReuse = false;
    // Create app window
    createWindow();
    // Set App Name for notifications
    app.setAppUserModelId("Peerless Player");
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// Mac code to fire creeateWindow function
app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

// Prevent any new windows being created.
app.on("web-contents-created", (event, contents) => {
    contents.on("new-window", async (event, navigationUrl) => {
        // Log and prevent opening up a new window
        console.error(`The app tried to open a new window at the following address: '${navigationUrl}'. This attempt was blocked.`);
        event.preventDefault();
        return;
    });
});

// Uncaught Exception Errors - send message to ipcreply.js
process.on('uncaughtException', function (error) {
    win.webContents.send("from_main_error", error);
});

//################
// OTHER FUNCTIONS
//-----------------
// Function to open dialog box to select directory
function openFolderDialog(message) {
    // Data to return message to renderer
    var data = [];
    // Options to display on dialog box
    var options = { title: message[1], defaultPath: message[2], buttonLabel: message[3], properties: [message[4]] }

    // Open dialog box to browse directory
    dialog.showOpenDialog(win, options).then(result => {
        // Set message data to return to renderer
        data[0] = message[0];
        data[1] = result.filePaths;
        // Send message back to renderer with data result
        win.webContents.send(data[0], data[1]);
    }).catch(err => {
        console.log(err)
    });
} 

// Function to open dialog box to select file
function openFileDialog(message) {
    // Data to return message to renderer
    var data = [];
    // Options to display on dialog box
    var options = { title: message[1], defaultPath: message[2], buttonLabel: message[3], filters: message[4], properties: [message[5]] }
    // Open dialog box to browse directory
    dialog.showOpenDialog(win, options).then(result => {
        // Set message data to retun to renderer
        data[0] = message[0];
        data[1] = result.filePaths;
        // Send message back to renderer with data result
        win.webContents.send(data[0], data[1]);
    }).catch(err => {
        console.log(err)
    });
} 

//###################################
// RECEIVE IPC MESSAGES FROM RENDERER
//------------------------------------
// Open external websites in default browser
ipcMain.on('open_external', (event, url) => {
    shell.openExternal(url);
});

// Open dialog box to select folder
ipcMain.on('open_folder_dialog', (event, message) => {
    openFolderDialog(message);
});

// Open dialog box to select file
ipcMain.on('open_file_dialog', (event, message) => {
    openFileDialog(message);
});

// Restart app after download
ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});

// Reads the app version specified in package.json and sends it to the main window
ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
});

//########################
// IPC DIRECTORY FUNCTIONS
//------------------------
// Read files from album directory
ipcMain.on('read_album_directory', (event, message) => {
    var sender = message[0];
    var dirPath = message[1];
    var artist = message[2];
    var album = message[3];
    var fnames = [];
    var counter = 0;

    // Read all files from album directory
    var files = fs.readdirSync(dirPath + artist + "/" + album + "/");

    // Loop through all files and find find audio files
    for (var i = 0; i < files.length; i++) {
        var ext = (path.extname(dirPath + artist + "/" + album + "/" + files[i]));
        if ((ext == '.mp3') || (ext == '.m4a') || (ext == '.flac') || (ext == '.wav')) {
            fnames[counter] = path.basename(dirPath + artist + "/" + album + "/" + files[i]);
            counter += 1;
        }
    }
    win.webContents.send("files_album_directory", [sender, fnames, artist, album]);
});

//#######################
// IPC RENAME DIRECTORIES
//-----------------------
ipcMain.on('rename_directory', (event, data) => {
    var musicPath = data[0];
    var originalArtistName = data[1];
    var originalAlbumName = data[2];
    var artist = data[3];
    var album = data[4];
    var edit = data[5];

    // First check if album name has been changed and if so update directory name
    var dirAlbumName = path.basename(musicPath + originalArtistName + "/" + originalAlbumName);
    var dirPath = path.dirname(musicPath + originalArtistName + "/" + originalAlbumName);
    if (album != dirAlbumName) {
        fs.rename(dirPath + "/" + dirAlbumName, dirPath + "/" + album, (error) => {
            if (error) throw error;
        });
    }

    // Check if artist name has been changed and if so update directory name
    var dirArtistName = path.basename(musicPath + originalArtistName);
    var dirPath = path.dirname(musicPath + originalArtistName);
    // Rename artist directory name if it doesn't match original
    if (artist != dirArtistName) {
        // If the new artist name directory doesn't exist create it
        if (!fs.existsSync(dirPath + "/" + artist)) {
            // Create new directory for artist
            fs.mkdirSync(dirPath + "/" + artist);
            // Rename old artist directory to new artist directory
            fs.rename(dirPath + "/" + dirArtistName + "/" + album, dirPath + "/" + artist + "/" + album, (error) => {
                if (error) throw error;
                // Check if directory is now empty
                fs.readdir(dirPath + "/" + dirArtistName, (error, files) => {
                    // Delete directory
                    if (files.length == 0) {
                        fs.rmdirSync(dirPath + "/" + dirArtistName);
                    }
                });
            });
        }
        else {
            // The new artist directory exists so rename old artist directory to new artist directory
            fs.rename(dirPath + "/" + dirArtistName + "/" + album, dirPath + "/" + artist + "/" + album, (error) => {
                if (error) throw error;
                // Check if directory is empty
                fs.readdir(dirPath + "/" + dirArtistName, (error, files) => {
                    // Delete directory
                    if (files.length == 0) {
                        fs.rmdirSync(dirPath + "/" + dirArtistName);
                    }
                });
            });
        }
    }

    // Send message back to renderer to complete database operations
    if (edit == "edit") {
        win.webContents.send("renamed_artist_directory", [originalArtistName]);
    }
});

//#######################
// IPC PLAYLIST FUNCTIONS
//-----------------------
// Check if directory exists, if not create directory
ipcMain.on('check_playlists', (event, data) => {
    var dir = data[0] + data[1];
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
});

// Open/Create file in Playlists folder for writing
ipcMain.on('open_playlists', (event, data) => {
    var musicPath = data[0];
    var fileName = data[1];
    fs.open(musicPath + "Playlists/" + fileName, 'w', function (err, file) {
        if (err) throw err;
        fs.close(file, function () {
        });
    });
});

// Append data to playlists file
ipcMain.on('append_playlists', (event, data) => {
    var musicPath = data[0];
    var fileName = data[1];
    var dataPath = data[2];
    fs.appendFile(musicPath + "Playlists/" + fileName, dataPath, function (err) {
        if (err) {
            console.log("ERROR = " + err)
        }
    })
});

// Delete playlist file
ipcMain.on('delete_playlists', (event, data) => {
    var dir = data[0];
    var playlist = data[1];
    var file = path.join(dir, playlist);
    fs.unlinkSync(file);
});    

// Get playlist files
ipcMain.on('get_playlists', (event, data) => {
    var musicPath = data[0];
    var directoryPlaylists = [];
    directoryPlaylists = fs.readdirSync(musicPath + "Playlists")
    win.webContents.send("from_get_playlists", directoryPlaylists);
}); 

//####################
// IPC IMAGE FUNCTIONS
//--------------------
// Save temp album artwork from add to database
ipcMain.on('save_temp_artwork', (event, message) => {
    var artFilePath = message[0];
    var coverArtUrl = message[1];

    // Delete tempArt.jpg if it exists from cancelled imports
    if (fs.existsSync(artFilePath)) {
        fs.unlinkSync(artFilePath);
    }

    // Function to save art image
    var saveImage = function (url, fileName, callback) {
        request(url).pipe(fs.createWriteStream(fileName)).on('close', callback);
    }

    // Call function to save art image
    // If there is cover art found on server

    if (coverArtUrl != "") {
        try {
            saveImage(coverArtUrl, artFilePath, function () {
                // save image
                Jimp.read(artFilePath).then(tpl => (tpl.clone().write(artFilePath)))
                // For future reference
                // Use Jimp to copy and resize art file from URL
                //Jimp.read(urlPath).then(tpl => (tpl.clone().resize(250, 250).write(resizedFilePath)))
            });
        }
        catch{
            console.log("Error saving temp image.")
        }
    }
});

// Save AlbumArtXLarge from file
ipcMain.on('save_artXlarge_file', (event, message) => {
    var tempArtPath = message[0];
    var artFilePath = message[1];

    if (fs.existsSync(tempArtPath)) {
        // Check size of image tempArt file to check it downloaded
        var stats = fs.statSync(tempArtPath)
        var fileSizeInBytes = stats.size;
        if (fileSizeInBytes > 1000) {
            try {
                Jimp.read(tempArtPath, function (err, image) {
                    //if (err) throw err;
                    image.write(artFilePath);
                });
            }
            catch{
                console.log("Error saving artXlarge image.")
            }
        }
    }
});

// Save back Cover Art from URL
ipcMain.on('save_backCover_art', (event, message) => {
    var artFilePath = message[0];
    var coverArtUrl = message[1];
    // Delete backCover.jpg if it exists from cancelled imports
    if (fs.existsSync(artFilePath)) {
        fs.unlinkSync(artFilePath);
    }
    // Function to save art image
    var saveImage = function (url, fileName, callback) {
        request(url).pipe(fs.createWriteStream(fileName)).on('close', callback);
    }
    // Call function to save art image
    // If there is cover art found on server
    if (coverArtUrl != "") {
        try {
            saveImage(coverArtUrl, artFilePath, function () {
                // save image
                Jimp.read(artFilePath).then(tpl => (tpl.clone().write(artFilePath)))
            });
        }
        catch{
            console.log("Error saving back image.")
        }
    }
});

// Resize and save folder.jpg from file from edit database
ipcMain.on('save_folder_file', (event, message) => {
    var tempArtPath = message[0];
    var resizedFilePath = message[1];
    // Resize and save folder.jpg
    if (fs.existsSync(tempArtPath)) {
        // Check size of image tempArt file to check it downloaded
        var stats = fs.statSync(tempArtPath)
        var fileSizeInBytes = stats.size;
        if (fileSizeInBytes > 1000) {
            try {
                Jimp.read(tempArtPath, function (err, image) {
                    if (err) throw err;
                    // Delete folder.jpg if it exists because Windows Media Player rips files as hidden system files, which don't overwrite.
                    if (fs.existsSync(resizedFilePath)) {
                        fs.unlinkSync(resizedFilePath);
                    }
                    image.resize(250, 250).write(resizedFilePath);
                });
            }
            catch{
                console.log("Error saving folder image.")
            }
        }
    }
});

//##########################
// IPC NEW MUSIC IN DATABASE
//--------------------------
// Create array of all artists/albums in music directory
ipcMain.on('dir_artists', (event, data) => {
    // Read all artists from MUSIC_PATH directory
    var musicPath = data[0];
    var databaseAlbums = data[1];
    var directoryAlbums = [];

    var directoryArtists = fs.readdirSync(musicPath)

    // Read all albums for each artist
    directoryArtists.forEach((artist) => {
        var albums = [];
        // Check that artist is a directory
        if (fs.lstatSync(musicPath + artist).isDirectory()) {
            albums = fs.readdirSync(musicPath + artist)
            // If is directory add to directoryAlbums array
            albums.forEach((album) => {
                if (fs.lstatSync(musicPath + artist + "/" + album).isDirectory()) {
                    /*
                    // Count tracks
                    var tracks = fs.readdirSync(musicPath + artist + "/" + album + "/");
                    // Loop through files in album directory and count music files
                    var trackCount = 0;
                    var i;
                    for (i = 0; i < tracks.length; i++) {
                        var ext = (path.extname(musicPath + artist + "/" + album + "/" + tracks[i]));
                        // If file is a music file add to trackCount
                        if ((ext == '.mp3') || (ext == '.m4a') || (ext == '.wav')) {
                            trackCount += 1;
                        }
                    }
                    */
                    //directoryAlbums.push(artist + "|" + album + "|" + trackCount)
                    directoryAlbums.push(artist + "|" + album)
                }
            });
        }
    });
    // Send array of directoryAlbums back
    win.webContents.send("from_dir_artists", [directoryAlbums, databaseAlbums]);
});

ipcMain.on('count_tracks', (event, data) => {
    var musicPath = data[0];
    var artist = data[1];
    var album = data[2];

    var tracks = fs.readdirSync(musicPath + artist + "/" + album + "/");
    // Loop through files in album directory and count music files
    var trackCount = 0;
    var i;
    for (i = 0; i < tracks.length; i++) {
        var ext = (path.extname(musicPath + artist + "/" + album + "/" + tracks[i]));
        // If file is a music file add to trackCount
        if ((ext == '.mp3') || (ext == '.m4a') || (ext == '.flac') || (ext == '.wav')) {
            trackCount += 1;
        }
    }
    win.webContents.send("from_count_tracks", [trackCount]);
});

// IPC Check if BackCover Art file exists
ipcMain.on('check_backcover', (event, data) => {
    var filePath = data[0];
    // Check if filepath to backcover exists
    if (fs.existsSync(filePath)) {
        win.webContents.send("from_check_backcover", [filePath]);
    }
});

//###################
// IPC SYNC DIRECTORY
//-------------------
// Sync directory
ipcMain.on('sync_external_directory', (event, message) => {
    var musicDir = message[0]
    var MUSIC_PATH = message[1];
    var artist = message[2];
    var album = message[3];

    // Check if Playlists selected
    if (artist == "Exported Playlists") {
        // Delete all playlist files from external playlist folder
        var dir = musicDir + "Playlists/";
        var files = fs.readdirSync(dir);
        files.forEach(file => {
            var playlistFile = path.join(dir, file);
            fs.unlinkSync(playlistFile);
        });

        // Delete birthdates.txt file if it exists
        var birthdateFile = musicDir + "Playlists/birthdates.txt"
        if (fs.existsSync(birthdateFile)) {
            fs.unlinkSync(birthdateFile);
        }

        // Read all files from Playlists directory
        var playlistFiles = [];
        playlistFiles = fs.readdirSync(MUSIC_PATH + "Playlists/");

        // Sync exported playlists
        // Loop through each file and copy
        playlistFiles.forEach(function (playlistFile) {
            // Get birthtime of playlist file
            var stats = fs.statSync(MUSIC_PATH + "Playlists/" + playlistFile);
            // Write file birthtime to file
            var data = stats.mtimeMs + "\n";
            fs.appendFile(birthdateFile, data, function (err) {
                if (err) {
                    console.log("ERROR = " + err)
                }
            })
            var sourceFile = MUSIC_PATH + "Playlists/" + playlistFile;
            var destFile = musicDir + "Playlists/" + playlistFile;

            // Copy playlist file from MUSIC directory to External directory
            fs.copyFile(sourceFile, destFile, (err) => {
                if (err) {
                    // Log error
                    console.log(err)
                    return;
                }
            });
        });
        return;
    }

    // Sync albums
    // Check if artist already exists in directory if not create artist folder
    var artistDir = musicDir + artist;
    var albumDir = musicDir + artist + "/" + album
    var files = [];
    // Check if table header
    if (artist != "Artist") {
        // Make artist directory
        fs.mkdirSync(artistDir, { recursive: true });

        // Create album directory in artist folder
        fs.mkdirSync(albumDir, { recursive: true });

        // Read all files from album directory
        files = fs.readdirSync(MUSIC_PATH + artist + "/" + album + "/");

        // Loop through each file and copy
        files.forEach(function (file) {
            var sourceFile = MUSIC_PATH + artist + "/" + album + "/" + file;
            var destFile = musicDir + artist + "/" + album + "/" + file;
            fs.copyFile(sourceFile, destFile, (err) => {
                if (err) {
                    console.log(err)
                    return;
                }
            });
        });
    }
});

//####################
// IPC SYNC TO SD CARD
//--------------------
// Create array of all artists/albums in music directory
ipcMain.on('sync_external', (event, data) => {
    // Read all artists from MUSIC_PATH directory
    var musicPath = data[0];
    var musicDir = data[1];
    var databaseAlbums = data[2];
    var directoryAlbums = [];
    var playlistsBirthtime = [];

    var directoryArtists = fs.readdirSync(musicDir)

    // Read all albums for each artist
    directoryArtists.forEach((artist) => {
        var albums = [];
        // Check that artist is a directory
        if (fs.lstatSync(musicDir + artist).isDirectory()) {
            albums = fs.readdirSync(musicDir + artist)
            // If is directory add to directoryAlbums array
            albums.forEach((album) => {
                if (fs.lstatSync(musicDir + artist + "/" + album).isDirectory()) {
                    directoryAlbums.push(artist + "|" + album)
                }
            });
        }
    });

    // Check if Playlists directory exists on SD Card, if not create directory
    var dir = musicDir + "Playlists/";
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    // Get all playlist files from MUSIC_PATH
    directoryPlaylists = fs.readdirSync(musicPath + "Playlists")
    // Loop through each playlist file
    directoryPlaylists.forEach((playlist) => {
        if (fs.statSync(musicPath + "Playlists/" + playlist).isFile()) {
            // Get birthtime of playlist file
            var stats = fs.statSync(musicPath + "Playlists/" + playlist);
            playlistsBirthtime.push(stats.mtimeMs.toString())
        }
    });

    // Check if Playlists directory exists on SD Card, if not create directory
    var dir = musicDir + "Playlists/";
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    // Get all playlist file birthtimes from birthdates.txt on SD Card
    var birthdateFile = musicDir + "Playlists/birthdates.txt";
    var fileBirthtime;
    var externalBirthtime;

    // Read birthdates.txt and split into externalBirthtime array
    try {
        fileBirthtime = fs.readFileSync(birthdateFile, 'utf-8')
            .split('\n')
            .filter(Boolean);
        fileBirthtime = fileBirthtime.toString();
        externalBirthtime = fileBirthtime.split(",")
    }
    catch{
        externalBirthtime = [];
    }

    // Send array of directoryAlbums back
    win.webContents.send("from_sync_external", [directoryAlbums, playlistsBirthtime, externalBirthtime, databaseAlbums]);
});

//###############
// IPC AUTOUPDATE
//---------------
// Add autoUpdate event listeners
autoUpdater.on('update-available', () => {
    win.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update_downloaded');
});

//#############
// SPOTIFY CODE
//-------------
// Authorisation request to get api token
var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
        'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
    },
    form: {
        grant_type: 'client_credentials'
    },
    json: true
};

// Search Album, Artist query
ipcMain.on('spotify_search', (event, data) => {
    var query = data[0];
    var album = data[1];
    var artist = data[2];
    var sourceFunction = data[3];

    // Remove following characters '& from album/artist query to avoid escaping
    query = query.replace(/[']/g, "")
    query = query.replace(" &", "")
    query = query + "&type=album";
    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            // Encode URL
            var url = 'https://api.spotify.com/v1/search?q=' + query;
            var encodedUrl = encodeURI(url);

            // Use the access token to access the Spotify Web API
            var token = body.access_token;
            var options = {
                url: encodedUrl,
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                json: true
            };
            request.get(options, function (error, response, body) {
                if (sourceFunction == "add") {
                    // If successful
                    if (!error && response.statusCode === 200) {
                        win.webContents.send("from_spotify_search_add", [body, album, artist]);
                    }
                    // On error
                    else {
                        win.webContents.send("spotify_error", error);
                    }   
                }
                if (sourceFunction == "artwork") {
                    // If successful
                    if (!error && response.statusCode === 200) {
                        win.webContents.send("from_spotify_search_artwork", [body, album, artist]);
                    }
                    // On error
                    else {
                        win.webContents.send("spotify_error", error);
                    }  
                }
                if (sourceFunction == "edit") {
                    // If successful
                    if (!error && response.statusCode === 200) {
                        win.webContents.send("from_spotify_search_edit", [body, album, artist]);
                    }
                    // On error
                    else {
                        win.webContents.send("spotify_error", error);
                    }     
                }
            });
        }
    });
});

// Get artist details in order to get artist genres
ipcMain.on('spotify_getArtist', (event, data) => {
    var query = data[0];
    var artist = data[1];
    console.log("query: " + query)
    console.log("artist: " + artist)
    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            // Encode URL
            var url = 'https://api.spotify.com/v1/search?q=' + query;
            var encodedUrl = encodeURI(url);
            // Use the access token to access the Spotify Web API
            var token = body.access_token;
            var options = {
                url: encodedUrl,
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                json: true
            };
            request.get(options, function (error, response, body) {
                // If successful
                if (!error && response.statusCode === 200) {
                    win.webContents.send("from_spotify_getArtist", [body, artist]);
                }
                // On error
                else {
                    win.webContents.send("spotify_error", error);
                }
            });
        }
    });
});

// Get tracks from album
ipcMain.on('spotify_getTracks', (event, data) => {
    var query = data[0];
    console.log("get tracks")
    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            // Encode URL
            var url = 'https://api.spotify.com/v1/albums/' + query;
            var encodedUrl = encodeURI(url);
            // Use the access token to access the Spotify Web API
            var token = body.access_token;
            var options = {
                url: encodedUrl,
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                json: true
            };
            request.get(options, function (error, response, body) {
                // If successful
                if (!error && response.statusCode === 200) {
                    win.webContents.send("from_getTracks", [body]);
                }
                // On error
                else {
                    win.webContents.send("spotify_error", error);
                }   
            });
        }
    });
});

// Get Audio Features of tracks from album
ipcMain.on('spotify_getAudioFeatures', (event, data) => {
    var query = data[0];
    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            // Encode URL
            var url = 'https://api.spotify.com/v1/audio-features?ids=' + query;
            var encodedUrl = encodeURI(url);

            // Use the access token to access the Spotify Web API
            var token = body.access_token;
            var options = {
                url: encodedUrl,
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                json: true
            };
            request.get(options, function (error, response, body) {
                // If successful
                if (!error && response.statusCode === 200) {
                    win.webContents.send("from_getAudioFeatures", [body]);
                }
                // On error
                else {
                    win.webContents.send("spotify_error", error);
                } 
            });
        }
    });
});

// Get artist ID
ipcMain.on('spotify_getArtistID', (event, data) => {
    var artist = data[0];
    var referrer = data[1];
    var query = artist + '&type=artist';
    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            // Encode URL
            var url = 'https://api.spotify.com/v1/search?q=' + query;
            var encodedUrl = encodeURI(url);
            // Use the access token to access the Spotify Web API
            var token = body.access_token;
            var options = {
                url: encodedUrl,
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                json: true
            };
            request.get(options, function (error, response, body) {
                // If successful
                if (!error && response.statusCode === 200) {
                    if (referrer == "recommendations") {
                        win.webContents.send("from_getArtistID_recommendations", [body, artist]);
                    }
                    if (referrer == "discography") {
                        win.webContents.send("from_getArtistID_discography", [body, artist]);
                    }
                }
                // On error
                else {
                    win.webContents.send("spotify_error", error);
                }                
            });
        }
    });
});

// Get recommendations based on spotify artist ID
ipcMain.on('spotify_recommendations', (event, data) => {
    var query = data[0];
    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            // Encode URL
            var url = 'https://api.spotify.com/v1/recommendations?limit=18&market=GB&seed_artists=' + query;
            var encodedUrl = encodeURI(url);
            // Use the access token to access the Spotify Web API
            var token = body.access_token;
            var options = {
                url: encodedUrl,
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                json: true
            };
            request.get(options, function (error, response, body) {
                // If successful
                if (!error && response.statusCode === 200) {
                    win.webContents.send("from_recommendations", [body]);
                }
                // On error
                else {
                    win.webContents.send("spotify_error", error);
                }
            });
        }
    });
});

// Get spotify album details
ipcMain.on('spotify_album', (event, data) => {
    var query = data[0];
    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            // Encode URL
            var url = 'https://api.spotify.com/v1/albums/' + query;
            var encodedUrl = encodeURI(url);
            // Use the access token to access the Spotify Web API
            var token = body.access_token;
            var options = {
                url: encodedUrl,
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                json: true
            };
            request.get(options, function (error, response, body) {
                // If successful
                if (!error && response.statusCode === 200) {
                    win.webContents.send("from_album", [body]);
                }
                // On error
                else {
                    win.webContents.send("spotify_error", error);
                }
            });
        }
    });
});

// Get new releases
ipcMain.on('spotify_getNewReleases', (event) => {
    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            // Encode URL
            var url = 'https://api.spotify.com/v1/browse/new-releases?country=GB&limit=48';
            // Use the access token to access the Spotify Web API
            var token = body.access_token;
            var options = {
                url: url,
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                json: true
            };
            request.get(options, function (error, response, body) {
                // If successful
                if (!error && response.statusCode === 200) {
                    win.webContents.send("from_getNewReleases", [body]);
                }
                // On error
                else {
                    win.webContents.send("spotify_error", [error, "releases"]);
                }
            });
        }
    });
});

ipcMain.on('spotify_discography', (event, data) => {
    var query = data[0];
    console.log("spotify ID :: " + query)
    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            // Encode URL

            var url = 'https://api.spotify.com/v1/artists/' + query + '/albums?include_groups=album&market=gb&limit=50'
            var encodedUrl = encodeURI(url);
            // Use the access token to access the Spotify Web API
            var token = body.access_token;
            var options = {
                url: encodedUrl,
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                json: true
            };
            request.get(options, function (error, response, body) {
                // If successful
                if (!error && response.statusCode === 200) {
                    win.webContents.send("from_discography", [body]);
                }
                // On error
                else {
                    win.webContents.send("spotify_error", error);
                }
            });
        }
    });
});

//#########################
// READ AUDIO FILE METADATA
//-------------------------
// Get Audio Features of tracks from album
ipcMain.on('read_ID3tags', (event, data) => {
    var audioFile = data[0];

    // Read ID3 tags using jsmediatags module
    jsmediatags.read(audioFile, {
        onSuccess: function (tag) {

            win.webContents.send("from_read_ID3tags", [tag]);
        },
        onError: function (error) {
            console.log('Error: ', error.type, error.info);
        }
    });
});

//#########################
// CODE TO CONNECT WITH PI PLAYER VIA SSH
//-------------------------
// Check network connection
ipcMain.on('check_connection', (event, data) => {
    var ipAddress = data[0];
    var userName = data[1];
    var password = data[2];

    // Connect to remote server using SSH
    const { Client } = require('ssh2');
    const conn = new Client();

    // Connection error handling
    conn.on('error', function (e) {
        console.log("Check Connection :: " + e);
        win.webContents.send("from_check_connection_error", [e]);
    });

    // Connection successful
    conn.on('ready', () => {
        console.log("Check Connection :: Connected")
        win.webContents.send("from_check_connection_success");
        // Connection details of remote server
    }).connect({
        host: ipAddress,
        port: 22,
        username: userName,
        password: password
    });
});

// Send current playing artfile to remote server
ipcMain.on('ssh_artworkfile', (event, data) => {
    var artworkLarge = data[0];   
    var artworkFolder = data[1]; 
    var artist = data[2];
    var album = data[3];
    var track = data[4];
    var playTime = data[5];
    var favourite = data[6];
    var ipAddress = data[7];
    var userName = data[8];
    var password = data[9];
    var artworkFile;
    var newDate = Date().toLocaleString();

    // Location of file on pi-player
    const fileToReceive = "/home/" + userName + "/Documents/pi-player/graphics/tempFolder.jpg"

    // Get absolute path of PP logo
    if (artworkLarge == './graphics/peerless_player_blue.jpg') {
        artworkLarge = (path.join(__dirname, "./app/graphics/peerless_player_blue.jpg"));
    }

    // Check if large artwork file exists, if not use folder file
    if (fs.existsSync(artworkLarge)) {
        artworkFile = artworkLarge;
        fileToSend = artworkFile;
    } else {
        artworkFile = artworkFolder;
        fileToSend = artworkFile;
    }
    // Write track data to pi_json data file to send to remote server
    var jsonData = '{"artist":"' + artist + '", "album":"' + album + '", "track":"' + track + '", "playTime":"' + playTime + '", "favourite":" ' + favourite + '", "timeStamp":"' + newDate + '"}';
    fs.writeFileSync(data_path + "/pi_data.json", jsonData)

    // Send art file first
    if (ipAddress) {
        sendFile([fileToSend, fileToReceive, ipAddress, userName, password])
    }  
});

// Function to send files by sftp to pi-player
function sendFile(data) {
    var fileToSend = data[0];
    var fileToReceive = data[1]
    var ipAddress = data[2];
    var userName = data[3];
    var password = data[4];
    // Connect to remote server using SSH
    const { Client } = require('ssh2');
    const conn = new Client();

    // Connection error handling
    conn.on('error', function (e) {
        console.log("Connection ERROR :: " + e);
    });

    // Connection successful
    conn.on('ready', () => {
        conn.sftp(function (err, sftp) {
            if (err) throw err;
            // Local directory path
            var readStream = fs.createReadStream(fileToSend);
            // Remote directory location; include the file name
            var writeStream = sftp.createWriteStream(fileToReceive);
            writeStream.on('close', function () {
                if (fileToReceive == "/home/" + userName + "/Documents/pi-player/graphics/tempFolder.jpg") {
                    shellCommand(['mv /home/' + userName + '/Documents/pi-player/graphics/tempFolder.jpg /home/' + userName + '/Documents/pi-player/graphics/folder.jpg\n', ipAddress, userName, password])
                    conn.end();
                }
            });
            writeStream.on('end', function () {
                console.log("sftp connection closed");
                conn.close();
            });

            // Initiate transfer of file
            readStream.pipe(writeStream);
        });

        // Connection details of remote server
    }).connect({
        host: ipAddress,
        port: 22,
        username: userName,
        password: password
    });
}

// Receive Shell Commands from client
ipcMain.on('shell_command', (event, data) => {
    // Call function to send command
    shellCommand(data)
});

// Function to send Shell Commands to pi-player
function shellCommand(data) { 
    var command = data[0];
    var ipAddress = data[1];
    var userName = data[2];
    var password = data[3];
    // Connect to remote server using SSH
    const { Client } = require('ssh2');
    const conn = new Client();

    // Connection error handling
    conn.on('error', function (e) {
        console.log("ERROR connecting :: " + e);
    });

    // Connection successful
    conn.on('ready', () => {
        conn.shell(false, { pty: true }, function (err, stream) {
            if (err) throw err;
            stream.on('close', function () {
                console.log('Stream shell :: close');
                conn.end();
            }).on('data', function (data) {
                console.log('SHELL STDOUT: ' + data);
                if (command == 'mv /home/' + userName + '/Documents/pi-player/graphics/tempFolder.jpg /home/' + userName + '/Documents/pi-player/graphics/folder.jpg\n') {
                    var fileToSend = data_path + "/pi_data.json"
                    var fileToReceive = "/home/" + userName + "/Documents/pi-player/data/pi_data.json"
                    sendFile([fileToSend, fileToReceive, ipAddress, userName, password]); 
                }
            }).stderr.on('data', function (data) {
                console.log('STDERR: ' + data);
            });

            stream.write(command)
        })

        // Connection details of remote server
    }).connect({
        host: ipAddress,
        port: 22,
        username: userName,
        password: password
    });
};
