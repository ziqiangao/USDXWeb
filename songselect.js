const cardcontainer = document.getElementById("songselectoverlay")


function setcurtainopacity(opacity = 1) {
    document.getElementById("curtain").style.opacity = opacity
}

let timerid = 0

function fadevolume(target, duration = 1000) {
    if (timerid) clearInterval(timerid)
    const start = getvolume();
    const end = target;
    const steps = 20;
    const stepTime = duration / steps;
    let i = 0;

    if (start === end) return;

    timerid = setInterval(() => {
        i++;
        const t = i / steps;
        const v = start + (end - start) * t;
        setvolume(v);

        if (i >= steps) {
            clearInterval(timerid);
            setvolume(end);
        }
    }, stepTime);
}

function snapback() {
    // Remove transition and reset transform
    cardcontainer.style.transition = "transform 0s";
    cardcontainer.style.transform = "";

    // Force a reflow so the browser notices the change
    void cardcontainer.offsetWidth;

    // Reapply the transition
    cardcontainer.style.transition = "";
    c = mod(c, 7)
    active = mod(active, Songs.length)
}

let scrolling = false
let c = 3
let active = 0

const blobs = []

function mod(n, m) {
    return ((n % m) + m) % m;
}

const navAudio = document.getElementById("nav");

function geticonsneeded(song) {
    const icons = []
    const metadata = song.getmetadata()
    if (song.isduet()) icons.push("Duet")
    if (song.containsrap()) icons.push("Rap")
    if (SongwithMedley.includes(song)) icons.push("Medley")
    return icons
}

function scrollright() {
    if (scrolling) return
    navAudio.play();
    navAudio.currentTime = 0;
    scrolling = true
    cardcontainer.style.transform = "translate(-14.3dvw,0dvw)"
    cardcontainer.children[1].className = "card preload"
    cardcontainer.children[2].className = "card edge"
    cardcontainer.children[3].className = "card"
    cardcontainer.children[4].className = "card active"
    cardcontainer.children[5].className = "card"
    cardcontainer.children[6].className = "card edge"
    setTimeout(async () => {
        c = mod(c + 1, 7);
        active = mod(active + 1, Songs.length);

        snapback();
        cardcontainer.appendChild(cardcontainer.firstElementChild);

        for (const i in cards) {
            if (i == c) {
                cards[i].morebutton.removeAttribute("disabled")
            } else {
                cards[i].morebutton.setAttribute("disabled", "true")
            }
        }

        const card = cards[mod(c + 3, 7)];
        const song = Songs[mod(active + 3, Songs.length)];

        card.artist = song.getmetadata().ARTIST;
        card.title = song.getmetadata().TITLE;
        card.icons = geticonsneeded(song)
        URL.revokeObjectURL(card.cover);
        card.cover = URL.createObjectURL(await song.getresource("cover"));

        scrolling = false;
    }, 100);
}

function scrollleft() {
    if (scrolling) return
    navAudio.play();
    navAudio.currentTime = 0;
    scrolling = true
    cardcontainer.style.transform = "translate(14.3dvw,0dvw)"
    cardcontainer.children[0].className = "card edge"
    cardcontainer.children[1].className = "card"
    cardcontainer.children[2].className = "card active"
    cardcontainer.children[3].className = "card"
    cardcontainer.children[4].className = "card edge"
    cardcontainer.children[5].className = "card preload"
    setTimeout(async () => {
        c = mod(c - 1, 7);
        active = mod(active - 1, Songs.length);

        snapback();
        cardcontainer.insertBefore(cardcontainer.lastElementChild, cardcontainer.firstElementChild);

        for (const i in cards) {
            if (i == c) {
                cards[i].morebutton.removeAttribute("disabled")
            } else {
                cards[i].morebutton.setAttribute("disabled", "true")
            }
        }

        const card = cards[mod(c - 3, 7)];
        const song = Songs[mod(active - 3, Songs.length)];

        card.artist = song.getmetadata().ARTIST;
        card.title = song.getmetadata().TITLE;
        card.icons = geticonsneeded(song)
        URL.revokeObjectURL(card.cover);
        card.cover = URL.createObjectURL(await song.getresource("cover"));

        scrolling = false;
    }, 100);
}

async function loadsongsontocards(activeindex) {
    active = activeindex
    /**@type {[Card]} */
    const cardsdisplay = []
    /**@type {[Song]} */
    const displaysongs = []
    for (i = -3; i < 4; i++) {
        cardsdisplay.push(cards[mod(c + i, 7)])
    }

    for (i = -3; i < 4; i++) {
        displaysongs.push(Songs[mod(activeindex + i, Songs.length)])
    }

    while (blobs.length > 0) {
        URL.revokeObjectURL(blobs.pop())
    }

    for (i in displaysongs) {
        const metadata = displaysongs[i].getmetadata()
        const blob = URL.createObjectURL(await displaysongs[i].getresource("cover"))
        cardsdisplay[i].cover = blob
        cardsdisplay[i].title = metadata.TITLE
        cardsdisplay[i].artist = metadata.ARTIST
        cardsdisplay[i].icons = geticonsneeded(displaysongs[i])
        blobs.push(blob)
    }

    for (const i in cards) {
        if (i == 3) {
            cards[i].morebutton.removeAttribute("disabled")
        } else {
            cards[i].morebutton.setAttribute("disabled", "true")
        }
    }
}

let timer = 0
let previewon = false

function handlepreview() {
    clearTimeout(timer)
    if (previewon) { stoppreview(), previewon = false }
    timer = setTimeout(() => {
        startpreview(Songs[active])
        previewon = true
    }, 600)
}