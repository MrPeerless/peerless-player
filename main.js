//'use strict';
// SET VARIABLES
//---------------
const { electron, app, BrowserWindow, ipcMain, dialog } = require('electron');// Require electron modules
const { autoUpdater } = require('electron-updater');// Require electron-updater for auto updates
const shell = require('electron').shell;// Require shell to open external websites in default browser
const path = require('path');// Require Path module
const fs = require("fs");// Require FS module
var request = require('request'); // Used for saving images
var Jimp = require('jimp');// Require Jimp for resizing images

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
    // Get app path
    var data_path = app.getPath('userData')
    // Get path to sqlite script
    var data_base = path.resolve(__dirname + "/app/js/sqlite_async")
    // Load index.html into window with app path in query string
    win.loadURL(`file://${__dirname}/app/index.html?path=${data_path}=data=${data_base}`);
    // Show window once all contents loaded
    win.once('ready-to-show', () => {
        win.show();
    })

    // Open the DevTools.
    //win.webContents.openDevTools()

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Close database connection
        closeDatabase()
        // Dereference the window object
        win = null
    })

    //Show menu
    require('./app/js/mainmenu.js') 
}

// APP FUNCTIONS
//---------------
// Once electron has initialised create browser window
app.on('ready', () => {
    createWindow();
    // Add check for updates
    autoUpdater.checkForUpdatesAndNotify();
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

// OTHER FUNCTIONS
//-----------------
// Close database connection
async function closeDatabase() {
    dBase.close();
}

// Function to open dialog box to select directory
function openFolderDialog(message) {
    // Data to return message to renderer
    var data = [];
    // Options to display on dialog box
    var options = { title: message[1], defaultPath: message[2], buttonLabel: message[3], properties: [message[4]] }

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

// Function to open dialog box to select file
function openFileDialog(message) {
    // Data to return message to renderer
    var data = [];
    // Options to display on dialog box
    var options = { title: message[1], defaultPath: message[2], buttonLabel: message[3], filters: message[4], properties: [message[5]] }
    console.log(message[4])
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

// IPC DIRECTORY FUNCTIONS
// Read files from album directory
ipcMain.on('read_album_directory', (event, message) => {
    var sender = message[0];
    var dirPath = message[1];
    var artist = message[2];
    var album = message[3];
    var fnames = [];
    // Read all files from album directory
    var files = fs.readdirSync(dirPath + artist + "/" + album + "/");

    for (var i = 0; i < files.length; i++) {
        var ext = (path.extname(dirPath + artist + "/" + album + "/" + files[i]));
        if ((ext == '.mp3') || (ext == '.m4a') || (ext == '.wav')) {
            fnames[i] = path.basename(dirPath + artist + "/" + album + "/" + files[i]);
        }
    }
    win.webContents.send("files_album_directory", [sender, fnames, artist, album]);
});

// IPC RENAME DIRECTORIES
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

// IPC PLAYLIST FUNCTIONS
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

// IPC IMAGE FUNCTIONS
// Save album artwork from add to database
ipcMain.on('save_artwork', (event, message) => {
    var artFilePath = message[0];
    var resizedFilePath = message[1];
    var coverArtUrl = message[2];
    var genre = message[3];
    // Delete folder.jpg if it exists because Windows Media Player rips files as hidden system files, which don't overwrite.
    if (fs.existsSync(resizedFilePath)) {
        fs.unlinkSync(resizedFilePath);
    }

    // Function to save art image
    var saveImage = function (url, fileName, callback) {
        request(url).pipe(fs.createWriteStream(fileName)).on('close', callback);
    }
    // Call function to save art image
    // If there is cover art found on Gracenote server
    if (coverArtUrl != "") {
        saveImage(coverArtUrl, artFilePath, function () {
            // resize image
            Jimp.read(artFilePath).then(tpl => (tpl.clone().resize(250, 250).write(resizedFilePath)))
        });
    }
    // If no cover art found use default genre art
    else {
        var genreArtFilePath = "./app/graphics/genres/" + genre + ".gif";
        // Create AlbumArtXLarge.jpg 
        Jimp.read(genreArtFilePath).then(tpl => (tpl.clone().write(artFilePath)))
        // Create and resize folder.jpg
        Jimp.read(genreArtFilePath).then(tpl => (tpl.clone().resize(250, 250).write(resizedFilePath)))
    }
});

// Save AlbumArtXLarge from URL from edit database
ipcMain.on('save_artXlarge_URL', (event, message) => {
    var coverArtUrl = message[0];
    var artFilePath = message[1];
    var resizedFilePath = message[2];
    // Function to save art image
    var saveImage = function (url, fileName, callback) {
        request(url).pipe(fs.createWriteStream(fileName)).on('close', callback);
    }
    // Call function to save art image
    saveImage(coverArtUrl, artFilePath, function () {
        // Delete folder.jpg if it exists because Windows Media Player rips files as hidden system files, which don't overwrite.
        if (fs.existsSync(resizedFilePath)) {
            fs.unlinkSync(resizedFilePath);
        }
        // resize image
        // Use Jimp to copy and resize art file
        Jimp.read(artFilePath).then(tpl => (tpl.clone().resize(250, 250).write(resizedFilePath)))
    });
});

// Save AlbumArtXLarge from file from edit database
ipcMain.on('save_artXlarge_file', (event, message) => {
    var coverArtUrl = message[0];
    var artFilePath = message[1];
    Jimp.read(coverArtUrl, function (err, image) {
        if (err) throw err;
        image.write(artFilePath);
    });
});

// Resize and save folder.jpg from file from edit database
ipcMain.on('save_folder_file', (event, message) => {
    var coverArtUrl = message[0];
    var resizedFilePath = message[1];
    // Resize and save folder.jpg
    Jimp.read(coverArtUrl, function (err, image) {
        if (err) throw err;
        // Delete folder.jpg if it exists because Windows Media Player rips files as hidden system files, which don't overwrite.
        if (fs.existsSync(resizedFilePath)) {
            fs.unlinkSync(resizedFilePath);
        }
        image.resize(250, 250).write(resizedFilePath);
    });
});

// IPC NEW MUSIC IN DATABASE
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
        if ((ext == '.mp3') || (ext == '.m4a') || (ext == '.wav')) {
            trackCount += 1;
        }
    }
    win.webContents.send("from_count_tracks", [trackCount]);
});


// IPC SYNC DIRECTORY 
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

// IPC SYNC TO SD CARD
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

// IPC AUTOUPDATE
// Add autoUpdate event listeners
autoUpdater.on('update-available', () => {
    win.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update_downloaded');
});


