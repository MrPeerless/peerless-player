const { Menu } = require('electron')
const electron = require('electron')
const app = electron.app

const template = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Settings',
                click: function (menuItem, currentWindow) {
                    currentWindow.webContents.send('Settings');
                }
            },
            {
                label: 'Sync Database',
                click: function (menuItem, currentWindow) {
                    currentWindow.webContents.send('Sync Database');
                } 
            },
            {
                label: 'Update Smart Results',
                click: function (menuItem, currentWindow) {
                    currentWindow.webContents.send('Update Smart Results');
                }
            },
            {
                label: 'Sync External Directory',
                click: function (menuItem, currentWindow) {
                    currentWindow.webContents.send('Sync Directory');
                }
            },
            {
                type: 'separator'
            },
            /*
            {
                label: 'Export Database Table',
                click: function (menuItem, currentWindow) {
                    currentWindow.webContents.send('Export Table');
                }
            },
            {
                label: 'Import Database Table',
                click: function (menuItem, currentWindow) {
                    currentWindow.webContents.send('Import Table');
                }
            },
            {
                type: 'separator'
            },
            */
            {
                role: 'quit'
            }
        ]
    },
    {
        label: 'Edit',
        submenu: [
            {
                role: 'undo'
            },
            {
                role: 'redo'
            },
            {
                type: 'separator'
            },
            {
                role: 'cut'
            },
            {
                role: 'copy'
            },
            {
                role: 'paste'
            },
            {
                role: 'pasteandmatchstyle'
            },
            {
                role: 'delete'
            },
            {
                role: 'selectall'
            }
        ]
    },

    {
        label: 'Player',
        submenu: [
            {
                label: 'Previous Track',
                accelerator: 'Alt+M',
                click: function (menuItem, currentWindow) {
                    currentWindow.webContents.send('Previous Track');
                }
            },
            {
                label: 'Rewind',
                accelerator: 'Alt+R',
                click: function (menuItem, currentWindow) {
                    currentWindow.webContents.send('Rewind');
                }
            },
            {
                label: 'Play/Stop',
                accelerator: 'Alt+P',
                    click: function (menuItem, currentWindow) {
                        currentWindow.webContents.send('Play/Stop');
                }
            },
            {
                label: 'Pause',
                accelerator: 'Alt+O',
                click: function (menuItem, currentWindow) {
                    currentWindow.webContents.send('Pause');
                }
            },
            {
                label: 'Fast Forward',
                accelerator: 'Alt+F',
                click: function (menuItem, currentWindow) {
                    currentWindow.webContents.send('Fast Forward');
                }
            },
            {
                label: 'Next Track',
                accelerator: 'Alt+N',
                click: function (menuItem, currentWindow) {
                    currentWindow.webContents.send('Next Track');
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Shuffle',
                accelerator: 'Alt+S',
                click: function (menuItem, currentWindow) {
                    currentWindow.webContents.send('Shuffle');
                }
            },
            {
                label: 'Queue Track',
                accelerator: 'Alt+Q',
                click: function (menuItem, currentWindow) {
                    currentWindow.webContents.send('Queue Track');
                }
            },
            {
                label: 'Clear Queued Music',
                accelerator: 'Alt+C',
                click: function (menuItem, currentWindow) {
                    currentWindow.webContents.send('Clear Queued Music');
                }
            },
        ]
    },

    {
        label: 'Playlists',
        submenu: [
            {
                label: 'New Playlist',
                accelerator: 'Alt+Shift+N',
                click: function (menuItem, currentWindow) {
                    currentWindow.webContents.send('New Playlist');
                }
            },
            {
                label: 'Smart Playlist',
                accelerator: 'Alt+Shift+M',
                click: function (menuItem, currentWindow) {
                    currentWindow.webContents.send('Smart Playlist');
                }
            },
            {
                label: 'View Exported Playlists',
                accelerator: 'Alt+Shift+V',
                click: function (menuItem, currentWindow) {
                    currentWindow.webContents.send('View Exported Playlists');
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Save Playlist',
                accelerator: 'Alt+Shift+S',
                click: function (menuItem, currentWindow) {
                    currentWindow.webContents.send('Save Playlist');
                }
            },
            {
                label: 'Move Track Up',
                accelerator: 'Alt+Shift+U',
                click: function (menuItem, currentWindow) {
                    currentWindow.webContents.send('Move Track Up');
                }
            },
            {
                label: 'Add Selected Track',
                accelerator: 'Alt+Shift+A',
                click: function (menuItem, currentWindow) {
                    currentWindow.webContents.send('Add Selected Track');
                }
            },
            {
                label: 'Delete Selected Track',
                accelerator: 'Alt+Shift+E',
                click: function (menuItem, currentWindow) {
                    currentWindow.webContents.send('Delete Selected Track');
                }
            },
            {
                label: 'Move Track Down',
                accelerator: 'Alt+Shift+D',
                click: function (menuItem, currentWindow) {
                    currentWindow.webContents.send('Move Track Down');
                }
            },
            {
                label: 'Close Without Saving',
                accelerator: 'Alt+Shift+C',
                click: function (menuItem, currentWindow) {
                    currentWindow.webContents.send('Close Without Saving');
                }
            },
        ]
    },
    {
        label: 'View',
        submenu: [
            {
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                click(item, focusedWindow) {
                    if (focusedWindow) focusedWindow.reload()
                }
            },
            {
                label: 'Toggle Developer Tools',
                accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                click(item, focusedWindow) {
                    if (focusedWindow) focusedWindow.webContents.toggleDevTools()
                }
            },
            {
                type: 'separator'
            },
            {
                role: 'resetzoom'
            },
            {
                role: 'zoomin'
            },
            {
                role: 'zoomout'
            },
            {
                type: 'separator'
            },
            {
                role: 'togglefullscreen'
            }
        ]
    },
    {
        role: 'window',
        submenu: [
            {
                role: 'minimize'
            },
            {
                role: 'close'
            }
        ]
    },
    {
        label: 'Shop',
        submenu: [
            {
                label: 'Bandcamp',
                click() { require('electron').shell.openExternal('https://bandcamp.com/') }
            },
            {
                label: 'Amazon',
                click() { require('electron').shell.openExternal('https://www.amazon.co.uk/b?_encoding=UTF8&tag=geoffstravels-21&linkCode=ur2&linkId=7e917ba0501769c46c751ae19bc1e5c5&camp=1634&creative=6738&node=77925031') }
            }
        ]
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'About',
                click: function (menuItem, currentWindow) {
                    currentWindow.webContents.send('Help About');
                }
            },
            {
                label: 'Release Notes',
                click: function (menuItem, currentWindow) {
                    currentWindow.webContents.send('Help Release');
                }
            },
            {
                label: 'Keyboard Shortcuts',
                click: function (menuItem, currentWindow) {
                    currentWindow.webContents.send('Help Shortcuts');
                }
            },
            {
                label: 'User Guide',
                click: function (menuItem, currentWindow) {
                    currentWindow.webContents.send('Help Guide');
                }
            },
        ]
    }
]

// This is MAC operating system code. Oh Apple want to be soooo different!
if (process.platform === 'darwin') {
    const name = app.getName()
    template.unshift({
        label: name,
        submenu: [
            {
                role: 'about'
            },
            {
                type: 'separator'
            },
            {
                role: 'services',
                submenu: []
            },
            {
                type: 'separator'
            },
            {
                role: 'hide'
            },
            {
                role: 'hideothers'
            },
            {
                role: 'unhide'
            },
            {
                type: 'separator'
            },
            {
                role: 'quit'
            }
        ]
    })
    // Edit menu.
    template[1].submenu.push(
        {
            type: 'separator'
        },
        {
            label: 'Speech',
            submenu: [
                {
                    role: 'startspeaking'
                },
                {
                    role: 'stopspeaking'
                }
            ]
        }
    )
    // Window menu.
    template[3].submenu = [
        {
            label: 'Close',
            accelerator: 'CmdOrCtrl+W',
            role: 'close'
        },
        {
            label: 'Minimize',
            accelerator: 'CmdOrCtrl+M',
            role: 'minimize'
        },
        {
            label: 'Zoom',
            role: 'zoom'
        },
        {
            type: 'separator'
        },
        {
            label: 'Bring All to Front',
            role: 'front'
        }
    ]
}

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)