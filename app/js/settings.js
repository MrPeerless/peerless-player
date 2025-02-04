$(function () {
    // Query database for settings values
    populateSettings()

    $("body").css("background", global_Background);
    $('#ulMenu a').css("textDecoration", "none");

    async function populateSettings() {
        var settingsID = 1;
        var sql = "SELECT * FROM settings WHERE settingsID=?";
        var row = await dBase.get(sql, settingsID)

        // Add placeholder to appName input box
        $("#ipnAppName").val(row.appName);

        // Add value to ipnMusicDirectory input box
        $("#ipnMusicDirectory").val(row.musicDirectory);

        // Select album art size radio button
        var artRadioButton = "radio" + row.artSize;
        $("#" + artRadioButton).prop("checked", true);

        // Select album art shape radio button
        var shapeRadioButton = "radio" + row.artShape;
        $("#" + shapeRadioButton).prop("checked", true);

        // Select theme radio button
        var themeRadioButton = "radio" + row.theme;
        $("#" + themeRadioButton).prop("checked", true);

        // Select zoom default selected
        $("#sltZoom").val(row.zoom);

        // Select notifications radio button
        var notificationsRadioButton = "radioNotifications" + row.notifications;
        $("#" + notificationsRadioButton).prop("checked", true);
    }

    populatePiSettings()

    async function populatePiSettings() {
        var piSettingsID = 1;
        var sql = "SELECT * FROM piSettings WHERE piSettingsID=?";
        var row = await dBase.get(sql, piSettingsID)

        // Add placeholder to ipAdress input box
        $("#ipnPiIp").val(row.ipAddress);

        // Add placeholder to piUserName input box
        $("#ipnPiUser").val(row.userName);

        // Add placeholder to ipAdress input box
        $("#ipnPiPassword").val(row.password);
    }
});