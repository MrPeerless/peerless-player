$(document).ready(function () {
    // Disable button until selection made
    $("#btnDatabaseTable").prop("disabled", true);

    // Variable for table selected in selection box
    var tableSelected;

    // Code to perform once sltDatabaseTable is changed
    $(document).on('change', '.sltDatabaseTable', function () {
        // Get value of selection box when it changes
        tableSelected = $(this).val();
        // If a value is selected 
        if (tableSelected != "") {
            // Enable button
            $("#btnDatabaseTable").prop("disabled", false);
        }
        else {
            // Disable button
            $("#btnDatabaseTable").prop("disabled", true);
        }
    });

    // Function for Select File button click
    $(document).on('click', '#btnDatabaseTable', function (event) {
        event.preventDefault();
        // Function in databaseimport.js file
        importTable(tableSelected)
    });

    // Function to import a csv file into a table in the database
    async function importTable(tableSelected) {
        // Table selected to import
        var table = tableSelected;

        // Jquery csv parse node module
        var csv = require('jquery-csv');
        // File dialog box variable
        var dir;

        // Open dialog box to browse directory
        var options = {
            title: "Select .csv file to add to database",
            defaultPath: "C:\\", buttonLabel: "Select File",
            filters: [{ name: 'Data Files', extensions: ['csv'] }],
            properties: ["openFile"]
        }
        dir = dialog.showOpenDialog(options)

        try {
            // Get value from dialog box
            var csvFile = dir[0];

            // Parse csv file using jquery-csv
            fs.readFile(csvFile, 'UTF-8', function (err, csv) {
                if (err) { console.log(err); }
                $.csv.toArrays(csv, {}, async function (err, data) {
                    if (err) { console.log(err); }
                    // Loop each line of csv file, starting from 2nd line to ignore header row
                    for (var i = 1, len = data.length; i < len; i++) {
                        // Add each row to relevant table in the database
                        switch (table) {
                            case "Album":
                                // Create entry variable for sql statement
                                var entry = `"${data[i][0]}","${data[i][1]}","${data[i][2]}","${data[i][3]}","${data[i][4]}","${data[i][5]}","${data[i][6]}","${data[i][7]}","${data[i][8]}"`;
                                // Create sql variable
                                var sql = "INSERT INTO album (albumID, genreID, artistID, albumName, releaseDate, albumTime, albumCount, dateAdd, albumLastPlay) " + "VALUES(" + entry + ")";
                                // Insert row into database table
                                var insert = await dBase.run(sql)
                                break;
                            case "Artist":
                                // Create entry variable for sql statement
                                var entry = `"${data[i][0]}","${data[i][1]}","${data[i][2]}"`;
                                // Create sql variable
                                var sql = "INSERT INTO artist (artistID, artistName, origin) " + "VALUES (" + entry + ")";
                                // Insert row into database table
                                var insert = await dBase.run(sql);
                                break;
                            case "Genre":
                                // Create entry variable for sql statement
                                var entry = `"${data[i][0]}","${data[i][1]}"`;
                                // Create sql variable
                                var sql = "INSERT INTO genre (genreID, genreName) " + "VALUES (" + entry + ")";
                                // Insert row into database table
                                var insert = await dBase.run(sql);
                                break;
                            /*
                            case "Playlists":
                                // Create entry variable for sql statement
                                var entry = `"${data[i][0]}","${data[i][1]}","${data[i][2]}","${data[i][3]}"`;
                                // Create sql variable
                                var sql = "INSERT INTO playlists (playlistID, playlistName, trackList, dateCreated) " + "VALUES (" + entry + ")";
                                // Insert row into database table
                                var insert = await dBase.run(sql);
                                break;
                            */
                            case "Settings":
                                // Update settings table
                                var settingsID = "1";
                                // Create entry variable for sql statement
                                var sql = "UPDATE settings SET appName='" + data[i][1] + "', musicDirectory='" + data[i][2] + "', artSize='" + data[i][3] + "',  artShape='" + data[i][4] + "', userID='" + data[i][5] + "', zoom='" + data[i][6] + "', notifications='" + data[i][7] + "', theme='" + data[i][8] + "' WHERE settingsID=" + settingsID;
                                var update = await dBase.run(sql);
                                break;
                            case "Track":
                                // Create entry variable for sql statement
                                var entry = `"${data[i][0]}","${data[i][1]}","${data[i][2]}","${data[i][3]}","${data[i][4]}","${data[i][5]}","${data[i][6]}","${data[i][7]}","${data[i][8]}","${data[i][9]}","${data[i][10]}","${data[i][11]}","${data[i][12]}","${data[i][13]}","${data[i][14]}","${data[i][15]}","${data[i][16]}","${data[i][17]}"`;
                                // Create sql variable
                                var sql = "INSERT INTO track (trackID, genreID, artistID, albumID, trackName, fileName, playTime, count, mood1, mood2, tempo1, tempo2, genre2, genre3, favourite, lastPlay, vector, magnitude) " + "VALUES (" + entry + ")";
                                // Insert row into database table
                                var insert = await dBase.run(sql);
                                break;
                        }
                    }
                });

                // Show OK modal box to confirm table added to database
                $('#okModal').css('display', 'block');
                $(".modalFooter").empty();
                $('.modalHeader').html('<span id="btnXModal">&times;</span><h2>Peerless Player</h2>');
                $('#okModalText').html("<div class='modalIcon'><img src='./graphics/information.png'></div><p>&nbsp<br>" + table + " table has been successfully added to " + global_AppName + ".<br>&nbsp<br>&nbsp</p >");
                var buttons = $("<button class='btnContent' id='btnOkImportTable'>OK</button>");
                $('.modalFooter').append(buttons);
                $("#btnOkImport").focus();
                // Enable btnSync
                $("#btnSync").prop("disabled", false);

                // Get settings data once updated
                if (table == "Settings") {
                    openDatabase("Import");
                }
            });
        }
        catch (err) {
            console.log(err)
            // Show ERROR modal to display
            $('#okModal').css('display', 'block');
            $(".modalFooter").empty();
            $('.modalHeader').html('<span id="btnXModal">&times;</span><h2>Peerless Player</h2>');
            $('#okModalText').html("<div class='modalIcon'><img src='./graphics/warning.png'></div><p>&nbsp<br><b>DATABASE ERROR</b> - table not added to database. Check console for more details.<br>&nbsp<br>&nbsp</p >");
            var buttons = $("<button class='btnContent' id='btnOkImportTable'>OK</button>");
            $('.modalFooter').append(buttons);
            $("#btnOkModal").focus();
        }
    }

    // Button click to close modal box from import to database
    $(document).on('click', '#btnOkImportTable', function () {
        $('#okModal').css('display', 'none');
    })
});