function displayImage(imageName) {
    // Display modal box with image
    document.getElementById("screenshotModal").style.display = "block";
    document.getElementById("screenshotModalImage").src = "./images/" + imageName + ".png";
    document.getElementById("mainText").style.filter = "blur(5px)";
    document.getElementById("banner").style.filter = "blur(5px)";
    document.getElementById("menu").style.filter = "blur(5px)";
}

function closeImage() {
    document.getElementById("screenshotModal").scrollTop = 0;
    document.getElementById("screenshotModal").style.display = "none";
    document.getElementById("mainText").style.filter = "blur(0px)";
    document.getElementById("banner").style.filter = "blur(0px)";
    document.getElementById("menu").style.filter = "blur(0px)";

}