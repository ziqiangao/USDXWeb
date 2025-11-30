let showlyrics = true
let Folder = null
let FoldersUsed = []
let Songs = []
document.addEventListener("contextmenu", async (event) => {
    event.preventDefault()

    volnormanize()
    Folder = await showDirectoryPicker({ id: "ultrastar" })

    // Check if this folder was already used
    for (const used of FoldersUsed) {
        if (await used.isSameEntry(Folder)) {
            return; // same folder → ignore
        }
    }

    FoldersUsed.push(Folder)
    for await (const folder of Folder.entries()) {
        //console.log(folder)
        if (folder[1] instanceof FileSystemDirectoryHandle) {
            let song = new Song(folder[1])
            Songs.push(song)
            await song.parse()
            await song.storefilepointers()
        }
    }
    loadsongsontocards(0)
})


document.addEventListener("keydown", (event) => {
    if (!Songs.length) return
    

    // Handle left/right arrow keys
    switch (event.key) {
        case "ArrowLeft":
            if (songon) return
            clearTimeout(timer)
            scrollleft();
            break;
        case "ArrowRight":
            if (songon) return
            clearTimeout(timer)
            scrollright();
            break;
        case "Enter":
            if (songon) return
            clearTimeout(timer)
            commitplay(Songs[active])
            break
        case "Backspace":
            if (!songon) return
            stopplay()
            break
        case " ":
            if (!songon) return
            if (!audio.paused) pauseplayer(); else startplayer()
            break
    }
});
