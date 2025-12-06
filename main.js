let showlyrics = true
let Folder = null
let FoldersUsed = []
/**
 * @type {[Song]}
 */
let Songs = []
let SongwithMedley = []
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
            if (Getmedley(song,15)) {
                SongwithMedley.push(song)
            }
        }
    }
    loadsongsontocards(0)
})


document.addEventListener("keydown", (event) => {
    if (!Songs.length) return

    if (menubox.open) {
        if (event.key.toLowerCase() == "m") menubox.close()
        return
    }
    switch (event.key.toLowerCase()) {
        case "arrowleft":
            if (songon) return
            clearTimeout(timer)
            scrollleft();
            break;
        case "arrowright":
            if (songon) return
            clearTimeout(timer)
            scrollright();
            break;
        case "enter":
            if (songon) return
            medleymode = false
            menubox.close()
            clearTimeout(timer)
            commitplay(Songs[active])
            break
        case "backspace":
            if (!songon) return
            queue.length = 0;
            stopplay()
            break
        case "m":
            if (songon) return
            clearTimeout(timer)
            menubox.showModal()
        case " ":
            if (!songon) return
            if (!audio.paused) pauseplayer(); else startplayer()
            break
    }
});
