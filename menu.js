let scene = "main"

function hidemainmenu() {
    document.getElementById("mainmenu").classList.add("hide")
    scene = "songs"
    fadevolume(0,1000)
}

function showmainmenu() {
    document.getElementById("mainmenu").classList.remove("hide")
    scene = "main"
    audio.src = "Effects/Amazing Future.mp3"
    fadevolume(1,1000)
    audio.play()
}

function back() {
    queue.length = 0;
    if (songon) {
        stopplay()
        return
    }
    if (previewon) {
        stoppreview()
        setTimeout(() => {
            showmainmenu()
        },1000)
    } else {
        showmainmenu()
    }
    
}