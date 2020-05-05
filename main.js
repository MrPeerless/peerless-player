//'use strict';
// Require electron 
const { app, BrowserWindow, ipcMain } = require('electron')

// Require electron-updater to run auto updates
const { autoUpdater } = require('electron-updater');

// Require path module
var path = require('path');

// Global reference of the window object
let win

function createWindow() {
    const electron = require('electron');
    const { dialog } = require('electron');
    const { width, height } = electron.screen.getPrimaryDisplay().size;
    const nativeImage = require('electron').nativeImage;

    // Create the browser window.
    win = new BrowserWindow({
        width,
        height,
        frame: true,
        icon: (path.join(__dirname, './app/graphics/indy_Tunes.ico')),
        backgroundColor: '#ffffff',
    })

    // and load the index.html of the app.
    win.loadURL(`file://${__dirname}/app/index.html`);

    // Show window once all contents loaded
    win.once('ready-to-show', () => {
        win.show()
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

    // Add check for updates
    autoUpdater.checkForUpdatesAndNotify();
}

// Close database connection
async function closeDatabase() {
    dBase.close();
}

// This method will be called when Electron has finished initialization and is ready to create browser windows.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

// Reads the app version specified in package.json and sends it to the main window
ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
});

// Add autoUpdate event listeners
autoUpdater.on('update-available', () => {
    win.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update_downloaded');
});

// Restart app after download
ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});




