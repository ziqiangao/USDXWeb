let scene = "main"
const whoosh = document.createElement("audio")
whoosh.src = "mixkit-cinematic-wind-swoosh-1471-cut.wav"

function hidemainmenu() {
    document.getElementById("mainmenu").classList.add("hide")
    scene = "songs"
    fadevolume(0,300)
    audio.loop = false
    whoosh.currentTime = 0
    whoosh.play()
}

function showmainmenu() {
    document.getElementById("mainmenu").classList.remove("hide")
    scene = "main"
    audio.src = "Effects/Amazing Future.mp3"
    fadevolume(0.6,300)
    audio.play()
    audio.loop = true
    whoosh.currentTime = 0
    whoosh.play()
    document.getElementById("menubuttons").children[0].focus()
    
}

function back() {
    
    queue.length = 0;
    if (songon) {
        stopplay()
        return
    }
    clearTimeout(timer)
    if (previewon) {
        
        stoppreview(200)
        setTimeout(() => {
            showmainmenu()
        },300)
    } else {
        showmainmenu()
    }
    
}