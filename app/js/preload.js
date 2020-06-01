const { contextBridge, ipcRenderer } = require("electron");

// From index.js
const { webFrame } = require('electron') // For setting zoom level; webframe can't be used in main.js

// Load jquery
window.onload = () => {
    //const $ = require('jquery')
    global.$ = require('jquery')
    const jqueryValidation = require('jquery-validation'); // Used for validating form input
}

/*
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "api", {
        send: (channel, data) => {
            // whitelist channels
            let validChannels = ["toMain", "toApp_path", "toPath_resolve"];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, func) => {
            let validChannels = ["fromMain", "fromApp_path", "fromPath_resolve"];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender` 
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        },
    }   
);
*/

//window.onload = () => {
//    const $ = require('jquery')
//    window.$ = window.jQuery = require('jquery')
//}
