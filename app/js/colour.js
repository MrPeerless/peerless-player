drawImage = async img_path => {
    let canvas = document.createElement("canvas");
    canvas.src = img_path;
    const context = canvas.getContext("2d");
    const img = await loadImage(img_path);
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0);
    return { canvas, context };
};

function loadImage(img_path) {
    return new Promise(r => {
        let i = new Image();
        i.onload = () => r(i);
        i.src = img_path;
    });
}

calculateResult = (canvas, context) => {
    let store = {};
    const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const total_pixels = canvas.width * canvas.height;
    const coverage = total_pixels / 4;
    const max_pixel_index = total_pixels - 1;
    for (let i = 0; i < coverage; ++i) {
        const x = getPixelIndex(Math.floor(Math.random() * max_pixel_index));
        const key = `${data[x]},${data[x + 1]},${data[x + 2]}`;

        var val;
        // Ignore pure white and black pixels
        if (key != "255,255,255" | key != "0,0,0") {
            val = store[key];
        }

        store[key] = val ? val + 1 : 1;
    }
    const rgb_code = Object.keys(store).reduce((a, b) =>
        store[a] > store[b] ? a : b
    );

    return `rgb(${rgb_code})`;    
};

function getPixelIndex(numToRound) {
    //Each pixel is 4 units long: r,g,b,a
    const remainder = numToRound % 4;
    if (remainder == 0) return numToRound;
    return numToRound + 4 - remainder;
}

