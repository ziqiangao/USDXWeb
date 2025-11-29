let songon = false

/**
 * 
 * @param {Song} song 
 */
async function startpreview(song) {

    const med = Getmedley(song, 0)
    await loadSongOntoPlayer(song)
    let sec

    if (song.getmetadata().PREVIEWSTART) {
        sec = parseFloat(song.getmetadata().PREVIEWSTART.replace(",", "."))
        sync(sec)
    } else {
        if (med) {
            sync(song.beattoseconds(med[0]) - 1)
        } else {
            sync(audio.duration / 4 - 1)
        }
    }
    setTimeout(() => {
        showlyrics = false
        setvolume(0)
        setcurtainopacity(.5)
        startplayer()
        fadevolume(.5)
    }, 200)

}

function stoppreview() {
    showlyrics = false
    setcurtainopacity(1)
    fadevolume(0)
    setTimeout(pauseplayer, 1000)
}

async function commitplay(song) {
    if (songon) return
    songon = true
    stoppreview()
    setTimeout(async () => {
        await loadSongOntoPlayer(song)
        cardcontainer.style.opacity = 0
        setcurtainopacity(0)
        setTimeout(() => {
            sync(song.getmetadata().START || "0")
            showlyrics = true
            startplayer()
            fadevolume(1, 100)
        }, 500)
    }, 1000)
}

function stopplay() {
    songon = false
    stoppreview()
    cardcontainer.style.opacity = 1
}