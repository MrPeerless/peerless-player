$(document).ready(function () {
    // Display name of app
    $("#appName").text(global_AppName);

    // Music library stats
    // Call function in index.js to update display of stats for music library
    libraryStats()

    if (global_LibraryExpand == false) {
        $("button#btnLibraryExpand").css("background", "url(./graphics/expand.png) no-repeat");
        $("#divMusicLibrary").css('display', 'none');
    }
    else {
        $("button#btnLibraryExpand").css("background", "url(./graphics/collapse.png) no-repeat");
        $("#divMusicLibrary").css('display', 'block');
    }

    // Select all mood1 from database
    populateMood1()

    async function populateMood1() {
        // Select all mood1 from database
        var sql = "SELECT DISTINCT mood1 FROM track WHERE mood1 IS NOT NULL ORDER BY mood1 ASC";
        var rows = await dBase.all(sql);
        rows.forEach((row) => {
            // Check that mood1 is not null and append value to selection dropdown
            if (row.mood1 != "") {               
                $("#sltMood").append($('<option/>', {
                    value: row.mood1,
                    text: row.mood1
                }));
            }
        });
        if (global_MoodExpand == false) {
            $("button#btnMoodExpand").css("background", "url(./graphics/expand.png) no-repeat");
            $("#divMoodSelect").css('display', 'none');
        }
        else {
            $("button#btnMoodExpand").css("background", "url(./graphics/collapse.png) no-repeat");
            $("#divMoodSelect").css('display', 'block');
        }
    }

    populateGenre2()

    async function populateGenre2() {
        // Select all genre2 from database
        var sql = "SELECT DISTINCT genre2 FROM track ORDER BY genre2 ASC";
        var rows = await dBase.all(sql);

        rows.forEach((row) => {
            // Check that genre2 is not null and append value to selection dropdown
            if (row.genre2 != null) {
                $("#sltGenre").append($('<option/>', {
                    value: row.genre2,
                    text: row.genre2
                }));
            }
        });
    }

    // Clickable progress bar for seek function
    var player = document.getElementById('audio1')
    var progressBar = document.getElementById('seekbar')
    progressBar.addEventListener("click", seek);

    // Seek function
    function seek(e) {
        var percent = e.offsetX / this.offsetWidth;
        player.currentTime = percent * player.duration;
        progressBar.value = percent / 100;
    }

});