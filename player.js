/**@type {?HTMLVideoElement} */
const video = document.getElementById("bgvideo")
/**@type {?HTMLAudioElement} */
const audio = document.getElementById("audio")
/**@type {?HTMLImageElement} */
const image = document.getElementById("bgimage")
/**@type {?Song} */
let currentsong
/**@type {?Object} */
let currentjson
/**@type {?boolean} */
let isduet

/**
 * @param {Song} song 
 */
function loadSongOntoPlayer(song) {
    let vidurl, imgurl, audurl = null

    if (song.getresource("audio")) {
        audurl = URL.createObjectURL(song.getresource("audio"))
    }
    if (song.getresource("video")) {
        vidurl = URL.createObjectURL(song.getresource("video"))
    }
    if (song.getresource("background")) {
        imgurl = URL.createObjectURL(song.getresource("background"))
    }
    audio.src = audurl
    video.src = vidurl
    image.src = imgurl
    currentsong = song
    currentjson = song.getjson()
    isduet = song.isduet()
}

let t
function sync(time) {
    clearTimeout(t)
    const json = currentsong.getjson()

    audio.playbackRate = 1
    audio.currentTime = time

    if (video.src) {
        video.playbackRate = 1
        let timeset = time + (json.metadata["VIDEOGAP"] ? parseFloat(json.metadata["VIDEOGAP"]) : 0)
        video.currentTime = timeset
        if (timeset < 0 && !audio.paused) {
            video.pause()
            t = setTimeout(() => { video.play() }, Math.abs(timeset) * 1000)
        }
    }
}

function seek(amount) {
    audio.currentTime += amount
    sync(audio.currentTime)
}

function pauseplayer() {

    sync(audio.currentTime)
    video.pause()
    audio.pause()
}

function startplayer() {
    sync(audio.currentTime)
    if (video.src) video.play()
    audio.play()
}