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
    setTimeout(async () => {
        showlyrics = false
        setvolume(0)
        startplayer().then(v => {
            setcurtainopacity(.5)
            fadevolume(.5, 0.2)
            transition = false
        }).catch(v => {
            transition = false
            console.error("Player failed :(")
        })
    }, 500)
}

function stoppreview(time = 200) {
    if (transition) return
    transition = true
    showlyrics = false
    setcurtainopacity(1)
    fadevolume(0, time)
    setTimeout(() => { pauseplayer(); transition = false }, time)
}

async function commitplay(song) {
    if (songon) return
    songon = true
    stoppreview()
    setTimeout(async () => {
        await loadSongOntoPlayer(song)
        sync(medleymode ? medleystart - 8 : song.getmetadata().START || "0")
        cardcontainer.style.opacity = 0
        setTimeout(() => {
            showlyrics = true
            startplayer().then(v => {
                fadevolume(1,500)
                setcurtainopacity(0)
                scene = "play"
                running()
                if (medleymode) fadevolume(1, 5000); else fadevolume(1, 300)
            }).catch(v => {
                console.error("Player failed :(")
                songon = false
                failed()  
            })
        }, 500)
    }, 700)
}

function stopplay() {
    songon = false
    medleymode = false
    stoppreview()
    cardcontainer.style.opacity = 1
    scene = "songs"
}