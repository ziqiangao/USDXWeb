let songon = false

/**
 * 
 * @param {Song} song 
 */
async function startpreview(song) {
    if (transition) return
    transition = true

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
            const start = song.getmetadata().START ? song.getmetadata().START.replace(",", ".") : "0"
            const totaldur = parseInt(song.getmetadata().END || audio.duration * 1000) / 1000 - parseFloat(start)
            sync(parseFloat(start) + totaldur / 4 - 1)
        }
    }
    setTimeout(() => {
        showlyrics = false
        setvolume(0)
        setcurtainopacity(.5)
        startplayer()
        fadevolume(.5)
        transition = false
    }, 200)
}

function stoppreview(time = 1000) {
    if (transition) return
    transition = true
    showlyrics = false
    setcurtainopacity(1)
    fadevolume(0,time)
    setTimeout(() => {pauseplayer(); transition = false}, time)
}

async function commitplay(song) {
    if (songon) return
    
    songon = true
    stoppreview()
    setTimeout(async () => {
        await loadSongOntoPlayer(song)
        cardcontainer.style.opacity = 0
        setcurtainopacity(0)
        scene = "play"
        setTimeout(() => {
            sync(medleymode ? medleystart - 8 : song.getmetadata().START || "0")
            showlyrics = true
            startplayer()
            if (medleymode) fadevolume(1,5000); else fadevolume(1, 300)
        }, 500)
    }, 1000)
}

function stopplay() {
    songon = false
    medleymode = false
    stoppreview()
    cardcontainer.style.opacity = 1
    scene = "songs"
}