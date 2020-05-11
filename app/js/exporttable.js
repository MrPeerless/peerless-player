$(document).ready(function () {
    // Function for Select File button click
    $(document).on('click', '#btnDatabaseExport', function (event) {
        event.preventDefault();
        // Function in databaseimport.js file
        exportTable()
    });

    // Function to export a csv files for each table from the database
    function exportTable() {
        // File dialog box variable
        var dir;
        // Create variable for csv-writer node module
        const createCsvWriter = require('csv-writer').createObjectCsvWriter;

        // Open dialog box to browse directory
        var options = { title: "Select Directory to Save Database Tables", defaultPath: "C:\\", buttonLabel: "Select Folder", properties: ["openDirectory"] }
        dir = dialog.showOpenDialog(options)

        // Get value from dialog box
        var destFolder = dir[0];

        getAlbum()

        // Album Table
        async function getAlbum() {
            // Set up csv writer with filepath and headers
            const csvWriter = createCsvWriter({
                path: destFolder + '/album.csv',
                header: [
                    { id: 'albumID', title: 'albumID' },
                    { id: 'genreID', title: 'genreID' },
                    { id: 'artistID', title: 'artistID' },
                    { id: 'albumName', title: 'albumName' },                    
                    { id: 'releaseDate', title: 'releaseDate' },                    
                    { id: 'albumTime', title: 'albumTime' },
                    { id: 'albumCount', title: 'albumCount' },
                    { id: 'dateAdd', title: 'dateAdd' },
                    { id: 'albumLastPlay', title: 'albumLastPlay' }
                ]
            });

            // Create sql variable
            var sql = "SELECT * FROM album";
            var rows = await dBase.all(sql);

            // Write all rows to csv file using csv wruter
            csvWriter.writeRecords(rows)
                .then(() => {
                    console.log('album.csv created');
                    getArtist();
                });
        }
        // Artist Table
        async function getArtist() {
            // Set up csv writer with filepath and headers
            const csvWriter = createCsvWriter({
                path: destFolder + '/artist.csv',
                header: [
                    { id: 'artistID', title: 'artistID' },
                    { id: 'artistName', title: 'artistName' },
                    { id: 'origin', title: 'origin' }                  
                ]
            });

            // Create sql variable
            var sql = "SELECT * FROM artist";
            var rows = await dBase.all(sql);

            // Write all rows to csv file using csv wruter
            csvWriter.writeRecords(rows)
                .then(() => {
                    console.log('artist.csv created');
                    getGenre();
                });
        }

        // Genre Table
        async function getGenre() {
            // Set up csv writer with filepath and headers
            const csvWriter = createCsvWriter({
                path: destFolder + '/genre.csv',
                header: [
                    { id: 'genreID', title: 'genreID' },
                    { id: 'genreName', title: 'genreName' }
                ]
            });

            // Create sql variable
            var sql = "SELECT * FROM genre";
            var rows = await dBase.all(sql);

            // Write all rows to csv file using csv wruter
            csvWriter.writeRecords(rows)
                .then(() => {
                    console.log('genre.csv created');
                    getSettings();
                });
        }
        /*
        // Playlists Table
        async function getPlaylists() {
            // Set up csv writer with filepath and headers
            const csvWriter = createCsvWriter({
                path: destFolder + '/playlists.csv',
                header: [
                    { id: 'playlistID', title: 'playlistID' },
                    { id: 'playlistName', title: 'playlistName' },
                    { id: 'trackList', title: 'trackList' },
                    { id: 'dateCreated', title: 'dateCreated' }
                ]
            });

            // Create sql variable
            var sql = "SELECT * FROM playlists";
            var rows = await dBase.all(sql);
            // Write all rows to csv file using csv wruter
            csvWriter.writeRecords(rows)
                .then(() => {
                    console.log('playlists.csv created');
                    getSettings();
                });
        }
        */
        // Settings Table
        async function getSettings() {
            // Set up csv writer with filepath and headers
            const csvWriter = createCsvWriter({
                path: destFolder + '/settings.csv',
                header: [
                    { id: 'settingsID', title: 'settingsID' },
                    { id: 'appName', title: 'appName' },
                    { id: 'musicDirectory', title: 'musicDirectory' },
                    { id: 'artSize', title: 'artSize' },
                    { id: 'importArtwork', title: 'importArtwork' },
                    { id: 'artShape', title: 'artShape' },
                    { id: 'userID', title: 'userID' },
                    { id: 'zoom', title: 'zoom' },
                    { id: 'notifications', title: 'notifications' },
                    { id: 'theme', title: 'theme' }
                ]
            });

            // Create sql variable
            var sql = "SELECT * FROM settings";
            var rows = await dBase.all(sql);

            // Write all rows to csv file using csv wruter
            csvWriter.writeRecords(rows)
                .then(() => {
                    console.log('settings.csv created');
                    getTrack();
                });
        }

        // Track Table
        async function getTrack() {
            // Set up csv writer with filepath and headers
            const csvWriter = createCsvWriter({
                path: destFolder + '/track.csv',
                header: [
                    { id: 'trackID', title: 'trackID' },
                    { id: 'genreID', title: 'genreID' },
                    { id: 'artistID', title: 'artistID' },
                    { id: 'albumID', title: 'albumID' },
                    { id: 'trackName', title: 'trackName' },
                    { id: 'fileName', title: 'fileName' },
                    { id: 'playTime', title: 'playTime' },
                    { id: 'count', title: 'count' },
                    { id: 'mood1', title: 'mood1' },
                    { id: 'mood2', title: 'mood2' },
                    { id: 'tempo1', title: 'tempo1' },
                    { id: 'tempo2', title: 'tempo2' },
                    { id: 'genre2', title: 'genre2' },
                    { id: 'genre3', title: 'genre3' },
                    { id: 'favourite', title: 'favourite' },
                    { id: 'lastPlay', title: 'lastPlay' },
                    { id: 'vector', title: 'vector' },
                    { id: 'magnitude', title: 'magnitude' }
                ]
            });

            // Create sql variable
            var sql = "SELECT * FROM track";
            var rows = await dBase.all(sql);

            // Write all rows to csv file using csv wruter
            csvWriter.writeRecords(rows)
                .then(() => {
                    console.log('track.csv created');

                    // Show OK modal box to confirm table added to database
                    $('#okModal').css('display', 'block');
                    $(".modalFooter").empty();
                    $('.modalHeader').html('<span id="btnXModal">&times;</span><h2>Peerless Player</h2>');
                    $('#okModalText').html("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br>All tables have been successfully exported to " + destFolder + ".<br>&nbsp<br>&nbsp</p >");
                    var buttons = $("<button class='btnContent' id='btnOkImportTable'>OK</button>");
                    $('.modalFooter').append(buttons);
                    $("#btnOkImport").focus();
                    // Enable btnSync
                    $("#btnSync").prop("disabled", false);
                });
        }

    }
    // Button click to close modal box from import to database
    $(document).on('click', '#btnOkImportTable', function () {
        $('#okModal').css('display', 'none');
    })
});