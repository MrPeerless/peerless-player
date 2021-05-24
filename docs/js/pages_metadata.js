// Process metadata page
function displayMetadata() {
    // Declare variables
    var valenceInt;
    var valence;
    var energyInt;
    var tempoInt;
    var mood1;
    var mood2;
    var tempo1;
    var tempo2;
    var baseX;
    var baseY;


    tempoInt = document.getElementById("inpTempo").value;
    valenceInt = document.getElementById("inpHappiness").value;
    energyInt = document.getElementById("inpEnergy").value;

    // Tempo
    if (tempoInt <= 26) {
        document.getElementById("spanTempo1").innerHTML = "Slow Tempo";
        document.getElementById("spanTempo2").innerHTML = "Static";
    }
    else if (tempoInt <= 53) {
        document.getElementById("spanTempo1").innerHTML = "Slow Tempo";
        document.getElementById("spanTempo2").innerHTML = "Very Slow";
    }
    else if (tempoInt <= 79) {
        document.getElementById("spanTempo1").innerHTML = "Slow Tempo";
        document.getElementById("spanTempo2").innerHTML = "Slow";
    }
    else if (tempoInt <= 96) {
        document.getElementById("spanTempo1").innerHTML = "Medium Tempo";
        document.getElementById("spanTempo2").innerHTML = "Medium Slow";
        tempo2 = "Medium Slow";
    }
    else if (tempoInt <= 112) {
        document.getElementById("spanTempo1").innerHTML = "Medium Tempo";
        document.getElementById("spanTempo2").innerHTML = "Medium";
        tempo2 = "Medium";
    }
    else if (tempoInt <= 129) {
        document.getElementById("spanTempo1").innerHTML = "Medium Tempo";
        document.getElementById("spanTempo2").innerHTML = "Medium Fast";
    }
    else if (tempoInt <= 149) {
        document.getElementById("spanTempo1").innerHTML = "Fast Tempo";
        document.getElementById("spanTempo2").innerHTML = "Fast";
        tempo2 = "Fast";
    }
    else {
        document.getElementById("spanTempo1").innerHTML = "Fast Tempo";
        document.getElementById("spanTempo2").innerHTML = "Very Fast";
    }

    // Mood 1
    // Create array of for values for mood1 grouped by valence
    if (valenceInt <= 19) {
        valence = ['Somber', 'Gritty', 'Serious', 'Brooding', 'Aggressive'];
        baseY = 0;
    }
    else if (valenceInt <= 39) {
        valence = ['Melancholy', 'Cool', 'Yearning', 'Urgent', 'Defiant'];
        baseY = 20;
    }
    else if (valenceInt <= 59) {
        valence = ['Sentimental', 'Sophisticated', 'Sensual', 'Fiery', 'Energizing'];
        baseY = 40;
    }
    else if (valenceInt <= 79) {
        valence = ['Tender', 'Romantic', 'Empowering', 'Stirring', 'Rowdy'];
        baseY = 60;
    }
    else {
        valence = ['Peaceful', 'Easygoing', 'Upbeat', 'Lively', 'Excited'];
        baseY = 80;
    }

    // Select mood1 array matching energy data from json file
    if (energyInt <= 19) {
        mood1 = valence[0];
        baseX = 0;
    }
    else if (energyInt <= 39) {
        mood1 = valence[1];
        baseX = 20;
    }
    else if (energyInt <= 59) {
        mood1 = valence[2];
        baseX = 40;
    }
    else if (energyInt <= 79) {
        mood1 = valence[3];
        baseX = 60;
    }
    else {
        mood1 = valence[4];
        baseX = 80;
    }
    document.getElementById("spanMood1").innerHTML = mood1;

    // Calculate x and y values for mood2 matric, which is a 2 x 2 matrix
    var mood2X = (energyInt - baseX) / 20;
    var mood2Y = (valenceInt - baseY) / 20;

    // Populate mood2 selection options
    switch (mood1) {
        case "Peaceful":
            // Calm Positive
            if (mood2X <= 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Pastoral / Serene";
            }
            // Energetic Positive
            else if (mood2X > 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Delicate / Tranquil";
            }
            // Calm Dark
            else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                document.getElementById("spanMood2").innerHTML = "Reverent / Healing";
            }
            // Energetic Dark
            else {
                document.getElementById("spanMood2").innerHTML = "Quiet / Introspective";
            }
            break;
        case "Romantic":
            // Calm Positive
            if (mood2X <= 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Sweet / Sincere";
            }
            // Energetic Positive
            else if (mood2X > 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Heartfelt Passion";
            }
            // Calm Dark
            else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                document.getElementById("spanMood2").innerHTML = "Dramatic / Romantic";
            }
            // Energetic Dark
            else {
                document.getElementById("spanMood2").innerHTML = "Lush / Romantic";
            }
            break;
        case "Sentimental":
            // Calm Positive
            if (mood2X <= 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Tender / Sincere";
            }
            // Energetic Positive
            else if (mood2X > 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Gentle Bittersweet";
            }
            // Calm Dark
            else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                document.getElementById("spanMood2").innerHTML = "Lyrical Sentimental";
            }
            // Energetic Dark
            else {
                document.getElementById("spanMood2").innerHTML = "Cool Melancholy";
            }
            break;
        case "Tender":
            // Calm Positive
            if (mood2X <= 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Refined / Mannered";
            }
            // Energetic Positive
            else if (mood2X > 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Awakening / Stately";
            }
            // Calm Dark
            else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                document.getElementById("spanMood2").innerHTML = "Romantic / Lyrical";
            }
            // Energetic Dark
            else {
                document.getElementById("spanMood2").innerHTML = "Light Groovy";
            }
            break;
        case "Easygoing":
            // Calm Positive
            if (mood2X <= 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Hopeful / Breezy";
            }
            // Energetic Positive
            else if (mood2X > 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Cheerful / Playful";
            }
            // Calm Dark
            else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                document.getElementById("spanMood2").innerHTML = "Friendly";
            }
            // Energetic Dark
            else {
                document.getElementById("spanMood2").innerHTML = "Charming / Easygoing";
            }
            break;
        case "Yearning":
            // Calm Positive
            if (mood2X <= 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Bittersweet Pop";
            }
            // Energetic Positive
            else if (mood2X > 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Energetic Yearning";
            }
            // Calm Dark
            else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                document.getElementById("spanMood2").innerHTML = "Sensitive / Exploring";
            }
            // Energetic Dark
            else {
                document.getElementById("spanMood2").innerHTML = "Energetic Dreamy";
            }
            break;
        case "Sophisticated":
            // Calm Positive
            if (mood2X <= 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Suave / Sultry";
            }
            // Energetic Positive
            else if (mood2X > 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Dark Playful";
            }
            // Calm Dark
            else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                document.getElementById("spanMood2").innerHTML = "Intimate Bittersweet";
            }
            // Energetic Dark
            else {
                document.getElementById("spanMood2").innerHTML = "Smoky / Romantic";
            }
            break;
        case "Sensual":
            // Calm Positive
            if (mood2X <= 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Soft Soulful";
            }
            // Energetic Positive
            else if (mood2X > 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Sensual Groove";
            }
            // Calm Dark
            else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                document.getElementById("spanMood2").innerHTML = "Dreamy Pulse";
            }
            // Energetic Dark
            else {
                document.getElementById("spanMood2").innerHTML = "Intimate";
            }
            break;
        case "Cool":
            // Calm Positive
            if (mood2X <= 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Casual Groove";
            }
            // Energetic Positive
            else if (mood2X > 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Wary / Defiant";
            }
            // Calm Dark
            else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                document.getElementById("spanMood2").innerHTML = "Cool Confidence";
            }
            // Energetic Dark
            else {
                document.getElementById("spanMood2").innerHTML = "Dark Groovy";
            }
            break;
        case "Gritty":
            // Calm Positive
            if (mood2X <= 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Sober / Determined";
            }
            // Energetic Positive
            else if (mood2X > 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Strumming Yearning";
            }
            // Calm Dark
            else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                document.getElementById("spanMood2").innerHTML = "Depressed / Lonely";
            }
            // Energetic Dark
            else {
                document.getElementById("spanMood2").innerHTML = "Gritty / Soulful";
            }
            break;
        case "Somber":
            // Calm Positive
            if (mood2X <= 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Solemn / Spiritual";
            }
            // Energetic Positive
            else if (mood2X > 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Enigmatic / Mysterious";
            }
            // Calm Dark
            else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                document.getElementById("spanMood2").innerHTML = "Dark Cosmic";
            }
            // Energetic Dark
            else {
                document.getElementById("spanMood2").innerHTML = "Creepy / Ominous";
            }
            break;
        case "Melancholy":
            // Calm Positive
            if (mood2X <= 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Mysterious / Dreamy";
            }
            // Energetic Positive
            else if (mood2X > 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Light Melancholy";
            }
            // Calm Dark
            else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                document.getElementById("spanMood2").innerHTML = "Wistful / Forlorn";
            }
            // Energetic Dark
            else {
                document.getElementById("spanMood2").innerHTML = "Sad / Soulful";
            }
            break;
        case "Serious":
            // Calm Positive
            if (mood2X <= 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Melodramatic";
            }
            // Energetic Positive
            else if (mood2X > 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Hypnotic Rhythm";
            }
            // Calm Dark
            else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                document.getElementById("spanMood2").innerHTML = "Serious / Cerebral";
            }
            // Energetic Dark
            else {
                document.getElementById("spanMood2").innerHTML = "Thrilling";
            }
            break;
        case "Brooding":
            // Calm Positive
            if (mood2X <= 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Evocative / Intriguing";
            }
            // Energetic Positive
            else if (mood2X > 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Energetic Melancholy";
            }
            // Calm Dark
            else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                document.getElementById("spanMood2").innerHTML = "Dreamy Brooding";
            }
            // Energetic Dark
            else {
                document.getElementById("spanMood2").innerHTML = "Dreamy Brooding";
            }
            break;
        case "Fiery":
            // Calm Positive
            if (mood2X <= 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Dark Sparkling Lyrical";
            }
            // Energetic Positive
            else if (mood2X > 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Fiery Groove";
            }
            // Calm Dark
            else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                document.getElementById("spanMood2").innerHTML = "Passionate Rhythm";
            }
            // Energetic Dark
            else {
                document.getElementById("spanMood2").innerHTML = "Energetic Abstract Groove";
            }
            break;
        case "Urgent":
            // Calm Positive
            if (mood2X <= 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Dark Pop";
            }
            // Energetic Positive
            else if (mood2X > 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Dark Pop Intensity";
            }
            // Calm Dark
            else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                document.getElementById("spanMood2").innerHTML = "Dark Urgent";
            }
            // Energetic Dark
            else {
                document.getElementById("spanMood2").innerHTML = "Energetic Anxious";
            }
            break;
        case "Defiant":
            // Calm Positive
            if (mood2X <= 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Heavy Brooding";
            }
            // Energetic Positive
            else if (mood2X > 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Hard Positive Excitement";
            }
            // Calm Dark
            else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                document.getElementById("spanMood2").innerHTML = "Attitude / Defiant";
            }
            // Energetic Dark
            else {
                document.getElementById("spanMood2").innerHTML = "Hard Dark Excitement";
            }
            break;
        case "Aggressive":
            // Calm Positive
            if (mood2X <= 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Dark Hard Beat";
            }
            // Energetic Positive
            else if (mood2X > 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Heavy Triumphant";
            }
            // Calm Dark
            else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                document.getElementById("spanMood2").innerHTML = "Chaotic / Intense";
            }
            // Energetic Dark
            else {
                document.getElementById("spanMood2").innerHTML = "Aggressive Power";
            }
            break;
        case "Rowdy":
            // Calm Positive
            if (mood2X <= 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Ramshackle / Rollicking";
            }
            // Energetic Positive
            else if (mood2X > 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Wild / Rowdy";
            }
            // Calm Dark
            else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                document.getElementById("spanMood2").innerHTML = "Confident / Tough";
            }
            // Energetic Dark
            else {
                document.getElementById("spanMood2").innerHTML = "Driving Dark Groove";
            }
            break;
        case "Excited":
            // Calm Positive
            if (mood2X <= 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Loud Celebratory";
            }
            // Energetic Positive
            else if (mood2X > 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Euphoric Energy";
            }
            // Calm Dark
            else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                document.getElementById("spanMood2").innerHTML = "Upbeat Pop Groove";
            }
            // Energetic Dark
            else {
                document.getElementById("spanMood2").innerHTML = "Happy Excitement";
            }
            break;
        case "Energizing":
            // Calm Positive
            if (mood2X <= 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Arousing Groove";
            }
            // Energetic Positive
            else if (mood2X > 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Heavy Beat";
            }
            // Calm Dark
            else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                document.getElementById("spanMood2").innerHTML = "Edgy / Sexy";
            }
            // Energetic Dark
            else {
                document.getElementById("spanMood2").innerHTML = "Abstract Beat";
            }
            break;
        case "Empowering":
            // Calm Positive
            if (mood2X <= 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Strong / Stable";
            }
            // Energetic Positive
            else if (mood2X > 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Powerful / Heroic";
            }
            // Calm Dark
            else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                document.getElementById("spanMood2").innerHTML = "Dramatic Emotion";
            }
            // Energetic Dark
            else {
                document.getElementById("spanMood2").innerHTML = "Idealistic / Stirring";
            }
            break;
        case "Stirring":
            // Calm Positive
            if (mood2X <= 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Invigorating / Joyous";
            }
            // Energetic Positive
            else if (mood2X > 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Jubilant / Soulful";
            }
            // Calm Dark
            else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                document.getElementById("spanMood2").innerHTML = "Focused Sparkling";
            }
            // Energetic Dark
            else {
                document.getElementById("spanMood2").innerHTML = "Triumphant / Rousing";
            }
            break;
        case "Lively":
            // Calm Positive
            if (mood2X <= 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Showy / Rousing";
            }
            // Energetic Positive
            else if (mood2X > 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Lusty / Jaunty";
            }
            // Calm Dark
            else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                document.getElementById("spanMood2").innerHTML = "Playful / Swinging";
            }
            // Energetic Dark
            else {
                document.getElementById("spanMood2").innerHTML = "Exuberant / Festive";
            }
            break;
        case "Upbeat":
            // Calm Positive
            if (mood2X <= 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Carefree Pop";
            }
            // Energetic Positive
            else if (mood2X > 0.5 && mood2Y > 0.5) {
                document.getElementById("spanMood2").innerHTML = "Party / Fun";
            }
            // Calm Dark
            else if (mood2X <= 0.5 && mood2Y <= 0.5) {
                document.getElementById("spanMood2").innerHTML = "Soulful / Easygoing";
            }
            // Energetic Dark
            else {
                document.getElementById("spanMood2").innerHTML = "Happy / Soulful";
            }
            break;
        case "Other":
            document.getElementById("spanMood2").innerHTML = "Other";
            break;
    }
};

// Clear Metadata page
function clearMetadata() {
    document.getElementById("inpTempo").value = "";
    document.getElementById("inpHappiness").value = "";
    document.getElementById("inpEnergy").value = "";
    document.getElementById("spanTempo1").innerHTML = "";
    document.getElementById("spanTempo2").innerHTML = "";
    document.getElementById("spanMood1").innerHTML = "";
    document.getElementById("spanMood2").innerHTML = "";
};