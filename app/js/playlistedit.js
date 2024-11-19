$(function () {

    playlistEdit();

    async function playlistEdit() {

        var sql = "SELECT playlistName, trackList FROM playlists WHERE playlistID=?";
        var row = await dBase.get(sql, global_PlaylistID);
        var tracks = row.trackList.split(",");

        $('#inpPlaylistName').val(row.playlistName);
        $('#inpEditPlaylistID').val(global_PlaylistID);

        for (i = 0; i < tracks.length; i++) {
            var sql = "SELECT trackName FROM track WHERE trackID=?";
            var row = await dBase.get(sql, tracks[i]);

            $("#sltPlaylist").append($('<option/>', {
                value: tracks[i],
                text: row.trackName
            })); 
        }
    }
});
