//##################
// SMART PLAYLIST
//##################
// Function to calculate dot product
function dotProduct(a, b) {
    var n = 0, limit = Math.min(a.length, b.length);
    for (var i = 0; i < limit; i++) n += a[i] * b[i];
    return n;
}

// Click event on Smart Playlist button
$(document).on('click', '#btnSmart', async function (event) {
    event.preventDefault();
    btnSmartClicked()
});
// Menu click
ipcRenderer.on('Smart Playlist', (event) => {
    btnSmartClicked()
});

// Click event on Smart Playlist button
async function btnSmartClicked() {
    // Key value pair to store trackIDs and cosine sim results
    var results = [];
    // The final smart playlist
    var smartList = [];
    // Get seed track trackID
    var seedID = global_TrackSelected;

    // Query database for seed track vector and magnitude
    var sql = "SELECT vector, magnitude FROM track WHERE trackID=?";
    var seed = await dBase.get(sql, seedID)
    // Check that seed vector is not null
    if (seed.vector == null) {
        // Show ERROR modal to display
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/warning.png'></div><p>&nbsp<br><b>ERROR</b> - smart playlist could not be created. Please update smart results and try again.<br>&nbsp<br>&nbsp</p >");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        return
    }
    // Split seed vector into array
    var seedVector = seed.vector.split(",");
    // Get seed track magnitude
    var seedMagnitude = seed.magnitude;

    // Query database for all tracks vector and magnitude
    var sql = "SELECT trackID, vector, magnitude FROM track WHERE NOT trackID=?";
    var rows = await dBase.all(sql, seedID)

    rows.forEach((row) => {
        // Variable for dot product
        var dotProd;
        // Variable for cosine similarity
        var cosSim = 0.0;
        // Split other vector into array
        if (row.vector != null) {
            var otherVector = row.vector.split(",");
            // Get track magnitude
            var otherMagnitude = row.magnitude;
            // Calculate the dot product against the seedID
            dotProd = dotProduct(seedVector, otherVector)
            // Calculate cosine similarity between trackID and seedID
            cosSim = dotProd / (seedMagnitude * otherMagnitude);

            if (cosSim != 0) {
                results.push(cosSim + "|" + row.trackID)
            }
        }
    });

    // Check that at least 29 tracks returned
    if (results.length < 29) {
        // If not enough matching tracks found show error modal box
        $('#okModal').css('display', 'block');
        $('.modalHeader').empty();
        $('#okModalText').empty();
        $(".modalFooter").empty();
        $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
        $('#okModalText').append("<div class='modalIcon'><img src='./graphics/warning.png'></div><p>&nbsp<br><b>NOT ENOUGH MATCHING TRACKS</b> found in the database.<br>&nbsp<br>&nbsp</p >");
        var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
        $('.modalFooter').append(buttons);
        $("#btnOkModal").focus();
        return
    }

    // Sort the coSim results into numeric order
    results.sort();
    // Reverse the results so closest matches at top 
    results.reverse();
    // Slice off the top 29 results
    results = results.slice(0, 29)

    // Shuffle results
    for (var i = results.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = results[i];
        results[i] = results[j];
        results[j] = temp;
    }

    // Slice off the top 19 results
    results = results.slice(0, 19)
    // Convert the numberic array to string
    stringResults = results.join();
    // Split string array
    var splitResults = stringResults.split(",");
    // Add seed trackID to smartList
    smartList.push(seedID)

    // Loop thorugh string array and split off trackID
    for (var i = 0; i < splitResults.length; i++) {
        var result = splitResults[i].split("|");
        // Add trackID to smartList
        smartList.push(result[1])
    }

    // Convert smartList to string to add to database
    smartList = smartList.join();

    // Add results to smartPlaylist in database playlist table
    var todayDate = new Date();
    var dateCreated = convertDate(todayDate);
    var playlistName = "Smart Playlist";
    var playlistID;
    // Check if Smart Playlist exists in table
    var sql = "SELECT playlistID FROM playlists WHERE playlistName='Smart Playlist'";
    var row = await dBase.get(sql)

    if (!row) {
        // Insert Smart Playlist
        try {
            var entry = `"${playlistName}","${smartList}","${dateCreated}"`;
            var sql = "INSERT INTO playlists (playlistName, trackList, dateCreated) " + "VALUES (" + entry + ")";
            var insert = await dBase.run(sql);
            // Now get playlistID
            var sql = "SELECT playlistID FROM playlists WHERE playlistName='Smart Playlist'";
            var sel = await dBase.get(sql)
            playlistID = sel.playlistID
        }
        catch (err) {
            console.log(err)
            // Show ERROR modal to display
            $('#okModal').css('display', 'block');
            $('.modalHeader').empty();
            $('#okModalText').empty();
            $(".modalFooter").empty();
            $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
            $('#okModalText').append("<div class='modalIcon'><img src='./graphics/warning.png'></div><p>&nbsp<br><b>DATABASE ERROR</b> - Smart Playlist not added to " + global_AppName + ".<br>&nbsp<br>&nbsp</p >");
            var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
            $('.modalFooter').append(buttons);
            $("#btnOkModal").focus();
            return
        }
    }
    else {
        try {
            // Update Smart Playlist
            var sql = "UPDATE playlists SET trackList='" + smartList + "', dateCreated='" + dateCreated + "' WHERE playlistID=" + row.playlistID;
            var update = await dBase.run(sql);
            playlistID = row.playlistID
        }
        catch (err) {
            console.log(err)
            // Show ERROR modal to display
            $('#okModal').css('display', 'block');
            $('.modalHeader').empty();
            $('#okModalText').empty();
            $(".modalFooter").empty();
            $('.modalHeader').append('<span id="btnXModal">&times;</span><h2>' + global_AppName + '</h2>');
            $('#okModalText').append("<div class='modalIcon'><img src='./graphics/warning.png'></div><p>&nbsp<br><b>DATABASE ERROR</b> - Smart Playlist not added to " + global_AppName + ".<br>&nbsp<br>&nbsp</p >");
            var buttons = $("<button class='btnContent' id='btnOkModal'>OK</button>");
            $('.modalFooter').append(buttons);
            $("#btnOkModal").focus();
            return
        }
    }

    // Display smart playlist
    global_PlaylistID = playlistID
    $("#divContent").css("width", "475px");
    $('#spnAtoZmenu').css('display', 'none')
    $('#divContent').load('./html/playlists.html');
    // Enable btnSync
    $("#btnSync").prop("disabled", false);

    $("#divTrackListing").css("display", "block");
    //$("#divTrackListing").css("visibility", "visible");
    $("#divTrackListing").load("./html/displayplaylist.html");

    $(document).ajaxComplete(function () {
        $(document).scrollTop(0);
        global_TrackListing = false;
    });
}

// Manual button click to update smart data results
$(document).on('click', '#btnUpdateMeta', function (event) {
    event.preventDefault();
    updateSmartData()
});
// Menu click
ipcRenderer.on('Update Smart Results', (event) => {
    updateSmartData()
});

// Update vector and magnitude in track table for smart playlist
async function updateSmartData() {
    try {
        // CREATE LIST OF ALL TERMS IN METADATA
        // Array to store all meta data terms from track table
        var allTerms = [];
        // Query database for all metadata terms
        var sql = "SELECT track.mood1, track.mood2, track.tempo1, track.tempo2, track.genre2, track.genre3, track.trackID, genre.genreID FROM track INNER JOIN genre ON genre.genreID=track.genreID";
        var rows = await dBase.all(sql);
        // Add results from database to allTerms array
        rows.forEach((row) => {
            allTerms.push(row.mood1);
            allTerms.push(row.mood2);
            allTerms.push(row.tempo1);
            allTerms.push(row.tempo2);
            allTerms.push(row.genre2);
            allTerms.push(row.genre3);
            allTerms.push(row.genreID);
        });
        // Remove any duplicated terms in all Terms using ...new Set
        allTerms = [...new Set(allTerms)];
        // Remove any NULL items in all Terms using filter
        allTerms = allTerms.filter(function (element) {
            return element != null;
        });

        // CREATE VECTOR FOR EACH TRACK
        //Get metadata for each track
        rows.forEach((row) => {
            // Array to store metadata for track retrieved from database
            var metaData = [];
            // Get trackID from rows
            var trackID = String(row.trackID);
            // Array to store vector for each track
            var vector = [];
            // String to store vector to add to database
            var vectorString;
            // Double to hold magnitude calculation
            var magnitude = 0.0;

            // Query database and populate metaData with results
            getTrackMetaData();
            async function getTrackMetaData() {
                var sql = "SELECT genreID, mood1, mood2, tempo1, tempo2, genre2, genre3 FROM track WHERE trackID=?";
                var response = await dBase.get(sql, trackID);
                // Add each track metadata to metaData
                metaData.push(response.mood1);
                metaData.push(response.mood2);
                metaData.push(response.tempo1);
                metaData.push(response.tempo2);
                metaData.push(response.genre2);
                metaData.push(response.genre3);
                metaData.push(response.genreID);
                // Remove any NULL items in all metaData using filter
                metaData = metaData.filter(function (element) {
                    return element != null;
                });

                // Count frequency of each term in metaData and store in object frequency
                var frequency = {};
                for (var i = 0; i < metaData.length; i++) {
                    var term = metaData[i];
                    frequency[term] = frequency[term] ? frequency[term] + 1 : 1;
                }
                // Loop through each term in allterms
                allTerms.forEach((term) => {
                    if (metaData.includes(term)) {
                        // Add frequency to vector array from frequency
                        vector.push(frequency[term])
                        // Calculate magnitude
                        magnitude = magnitude + (frequency[term] * frequency[term]);
                    }
                    else {
                        // If no term present add 0 to vector array
                        vector.push(0)
                        // No need to calculate magnitude as 0 * 0 = 0
                    }
                });
                // Convert vector to string
                vectorString = vector.join()
                // Calculate square root of magnitude
                magnitude = Math.sqrt(magnitude);

                // Update track table with vector
                var sql = "UPDATE track SET vector='" + vectorString + "' WHERE trackID=" + trackID;
                var update = await dBase.run(sql);

                // Update track tabel with magnitude
                var sql = "UPDATE track SET magnitude='" + magnitude + "' WHERE trackID=" + trackID;
                var update = await dBase.run(sql);
            }
        });
        // Hide modal box
        $('#okModal').css('display', 'none');
    }
    catch{
        $('#okModal').css('display', 'none');
        return;
    }
}