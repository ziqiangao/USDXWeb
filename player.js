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

function waitForAudioLoad(audioEl) {
    return new Promise((resolve, reject) => {
        const onLoad = () => {
            cleanup();
            resolve();
        };
        const onError = () => {
            cleanup();
            reject(new Error('Audio failed to load'));
        };
        const cleanup = () => {
            audioEl.removeEventListener('loadedmetadata', onLoad);
            audioEl.removeEventListener('error', onError);
        };

        audioEl.addEventListener('loadedmetadata', onLoad, { once: true });
        audioEl.addEventListener('error', onError, { once: true });
    });
}


/**
 * @param {Song} song 
 */
async function loadSongOntoPlayer(song) {
    let vidurl = "";
    let imgurl = "";
    let audurl = "";

    const audioFile = await song.getresource("audio");
    const videoFile = await song.getresource("video");
    const imageFile = await song.getresource("background");

    if (audioFile) audurl = URL.createObjectURL(audioFile);
    if (videoFile) vidurl = URL.createObjectURL(videoFile);
    if (imageFile) imgurl = URL.createObjectURL(imageFile);

    audio.src = audurl;
    video.src = vidurl;
    image.src = imgurl;

    // Wait for audio to load or error
    await waitForAudioLoad(audio);

    currentsong = song;
    currentjson = song.getjson();
    isduet = song.isduet();
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

let wakeLock
function release() {
    if (wakeLock) wakeLock.release()
    debug.innerText = false
}

async function set() {
    wakeLock = await navigator.wakeLock.request("screen");
    debug.innerText = true
}

function seek(amount) {
    audio.currentTime += amount
    sync(audio.currentTime)
}

function pauseplayer() {
    release()
    sync(audio.currentTime)
    video.pause()
    audio.pause()
}

function startplayer() {
    set()
    if (!document.fullscreenElement) document.documentElement.requestFullscreen()
    sync(audio.currentTime)
    if (currentsong.getmetadata().VIDEO) video.play()
    audio.play()
}

function getvolume() {
    if (typeof gainnode !== "undefined") {return gainnode.gain.value}
    return audio.volume
}

function setvolume(vol) {
    if (typeof gainnode !== "undefined") {gainnode.gain.value = vol} else {audio.volume = vol}
    
}

audio.onpause = () => {
    pauseplayer()
}

audio.onplay = () => {
    seek(0)
}

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        pauseplayer()
    } else {
    }
});

function finished() {
    stopplay()
}