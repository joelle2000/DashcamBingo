let mainImage = document.querySelector("#gallery > img");
let thumbnails = document.querySelector("#gallery .thumbnails");
let title = document.querySelector("#gallery > div > h2");
let galleryImages = [];
let foundBingos = new Set(); // Houd bij welke bingo's al gevonden zijn

// Confetti configuratie
const confettiColors = ['#1a73e8', '#34a853', '#fbbc05', '#ea4335'];
const confettiConfig = {
    particleCount: 200,
    spread: 70,
    origin: { y: 0.7 },
    colors: confettiColors
};



function menuHandler(){
    
    document.querySelector("#open-nav-menu").addEventListener("click", function(){
        document.querySelector("header nav .wrapper").classList.add("nav-open");
    });

    document.querySelector("#close-nav-menu").addEventListener("click", function(){
        document.querySelector("header nav .wrapper").classList.remove("nav-open");
    });
}

function galleryHandler(){
    return new Promise(resolve =>{
        fetch("/.bingokaarten.json")
        .then(response => response.json())
        .then(data => {
            galleryImages.push(...data)
            
            resolve();
        });
    })
}

async function loadGallery(){
    await galleryHandler();
    mainImage.src = galleryImages[0].src;
    mainImage.alt = galleryImages[0].alt;
    title.innerHTML = "Bingokaart gemaakt door " + galleryImages[0].author;

    galleryImages.forEach(function(image, index){
            let thumb = document.createElement("img");
            thumb.src = image.src;
            thumb.alt = image.alt;
            thumb.dataset.arrayIndex = index;
            thumb.dataset.selected = index === 0 ? true : false;


            // toont de foto die geklikt wordt onder de gallerij
            // parameter "e" staat voor event, zodat we kunnen achterhalen waar er is geklikt
            thumb.addEventListener("click", function(e){
                let selectedIndex = e.target.dataset.arrayIndex;
                let selectedImage = galleryImages[selectedIndex];
                mainImage.src = selectedImage.src;
                mainImage.alt = selectedImage.alt;
                title.innerHTML = "Bingokaart gemaakt door " + selectedImage.author;

                // DEselecteert alle thumbnails die niet geselecteerd zijn
                thumbnails.querySelectorAll("img").forEach(function(img){
                    img.dataset.selected = false;
                });

                // selecteert de thumbnail waarop is geklikt
                e.target.dataset.selected = true;
            });

            thumbnails.appendChild(thumb);
    })
    
}

async function randomKaart(){
    await galleryHandler();
    return new Promise(resolve => {
        let numberItem = Math.floor(Math.random() * galleryImages.length);
        let srcKaart = galleryImages[numberItem].srcWS;
        let bingoKaart = document.getElementById("bingokaart").style.backgroundImage = "url(" + srcKaart + ")";

        document.getElementById("bingokaart").style.display = "block";

        let w = window.innerWidth;
        if (w >= 830){
            let tableWidth = galleryImages[numberItem].width;
            let tableHeight = galleryImages[numberItem].height;
            let bingoRoosterWidth = document.getElementById("bingoRooster").style.width = tableWidth;
            let bingoRoosterHeight = document.getElementById("bingoRooster").style.height = tableHeight;
        } else if (w <830){
            let tableWidth = galleryImages[numberItem].Mwidth;
            let tableHeight = galleryImages[numberItem].Mheight;
            let bingoRoosterWidth = document.getElementById("bingoRooster").style.width = tableWidth;
            let bingoRoosterHeight = document.getElementById("bingoRooster").style.height = tableHeight;
        } else{
            console.log("error");
        }

        resolve();
    });
}


//wanneer er wordt geklikt en de cell is leeg wordt de afbeelding toegevoegd
//wordt er daarna weer geklik dan is de cell niet volledig leeg en is === niet van toepassing 
//dus dan wordt de else statement uitgevoerd
async function bingoHandler() {
    await randomKaart();
    document.querySelectorAll("td").forEach(td => {
        td.addEventListener("click", function () {
            if (td.innerHTML === '') { 
                td.innerHTML = '<img src="assets/kruis.png" class="kruisje" alt="x" width="50px" height="50px">';
            } else {
                td.innerHTML = ''; 
            }
            checkBingo();
        });
    });
    document.getElementById('random').addEventListener('click', function() {
        document.querySelectorAll("td").forEach(td => {
            td.innerHTML = ''; // Reset alle <td> cellen
        });    
    });
}

function checkBingo() {
    let table = document.getElementById("bingoRooster"); // Pak de bingo-tabel
    let rows = table.getElementsByTagName("tr"); // Haal alle rijen op
    let size = rows.length; // Het aantal rijen en kolommen (vierkant rooster)

    let board = [];
    for (let r = 0; r < size; r++) {
        let cells = rows[r].getElementsByTagName("td");
        board.push([...cells]); // Converteer HTMLCollection naar array
    }

    function isFull(line) {
        return line.every(td => td.innerHTML.includes("kruis.png"));
    }

    let newBingo = false;

    // **Check rijen**
    for (let r = 0; r < size; r++) {
        if (isFull(board[r]) && !foundBingos.has(`row-${r}`)) {
            foundBingos.add(`row-${r}`);
            newBingo = true;
        }
    }

    // **Check kolommen**
    for (let c = 0; c < size; c++) {
        let column = board.map(row => row[c]);
        if (isFull(column) && !foundBingos.has(`col-${c}`)) {
            foundBingos.add(`col-${c}`);
            newBingo = true;
        }
    }

    // **Check diagonalen**
    let diag1 = board.map((row, i) => row[i]);
    let diag2 = board.map((row, i) => row[size - 1 - i]);

    if (isFull(diag1) && !foundBingos.has("diag1")) {
        foundBingos.add("diag1");
        newBingo = true;
    }

    if (isFull(diag2) && !foundBingos.has("diag2")) {
        foundBingos.add("diag2");
        newBingo = true;
    }

    // **Confetti alleen bij nieuwe bingo**
    if (newBingo) {
        showConfetti();
    }  
}

function showConfetti(){
    setTimeout(() => {
        confetti(confettiConfig); //confetti is een functie afkomstig uit de library in de index
    }, 100);
}



//wat er nog moet gebeuren:
// De belangrijkste functionaliteiten zijn af

//wat ik nog zou willen doen:
// ~ uitzoeken wrm alleen bij de eerste kaart confetti te zien is als je bingo hebt maar als je vervolgens bingo haalt op een tweede kaart niet
// ~ andere bugs zoeken die ik miss wil fixen
// ~ achtergrond animatie voor de onderste speel mee knop op de home page
// ~ miss ook de namen klikbaar maken voor hun socials


menuHandler();
//galleryHandler(); hoeft niet te worden aangeroepen, want de functies die een response nodig 
// hebben van galleryHandler() roepen de functie aan dmv await. 
// De functies die de response nodig hebben, worden aangroepen. 
// Als je galleryHandler() dan nogmaals zou aanroepen dan worden de afbeeldingen 2x geladen.



//dit voorkomt dat functies worden geladen op de pagina waar zij niet gebruikt worden
if(document.getElementById('homePage')){
    loadGallery();
}

if (document.getElementById('bingoPage')){
    bingoHandler();
    document.getElementById('random').addEventListener('click', randomKaart);
}
