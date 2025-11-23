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
            await song.parse()
            await song.storeblobs()
            Songs.push(song)
        }
    }

})


document.addEventListener('keydown', function (event) {
    // Check if the pressed key is "r" or "R"
    if (event.key.toLowerCase() === 'r') {
        loadSongOntoPlayer(Songs[Math.floor(Math.random() * Songs.length)])
    sync(currentjson.metadata.START || "0")
    startplayer()
    }

    if (event.key.toLowerCase() === 'o') {
        setcurtainopacity(0)
    }
    if (event.key.toLowerCase() === 'i') {
        setcurtainopacity(1)
    }
});