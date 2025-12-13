let showlyrics = true
let Folder = null
let FoldersUsed = []
/**
 * @type {[Song]}
 */
let Songs = []
let SongwithMedley = []

document.addEventListener("click", () => {
    if (scene == 'main') {
        audio.play()
    }
    volnormanize();
},{once: true})

document.addEventListener("contextmenu", async (event) => {
    event.preventDefault();

    volnormanize();
    Folder = await showDirectoryPicker({ id: "ultrastar" });

    for (const used of FoldersUsed) {
        if (await used.isSameEntry(Folder)) return;
    }

    FoldersUsed.push(Folder);

    await scanFolder(Folder, 0, 4);

    if (Songs.length > 0) loadsongsontocards(0);
});


async function scanFolder(dirHandle, depth = 0, maxDepth = 4) {
    if (depth > maxDepth) return;

    for await (const entry of dirHandle.entries()) {
        const [name, handle] = entry;

        if (handle instanceof FileSystemDirectoryHandle) {
            // process folder as a song folder
            let song = new Song(handle);
            await song.parse();
            if (!song.getjson()) continue;

            await song.storefilepointers();
            if (Getmedley(song, 15)) {
                SongwithMedley.push(song);
            }

            // recurse
            await scanFolder(handle, depth + 1, maxDepth);
        }
    }
}



document.addEventListener("keydown", (event) => {
    

    if (menubox.open) {
        if (event.key.toLowerCase() == "m") menubox.close()
        return
    }
    switch (event.key.toLowerCase()) {
        case "arrowleft":
            if (!Songs.length) return
            if (scene !== 'songs') return
            clearTimeout(timer)
            scrollleft();
            break;
        case "arrowright":
            if (!Songs.length) return
            if (scene !== 'songs') return
            clearTimeout(timer)
            scrollright();
            break;
        case "enter":
            if (!Songs.length) return
            if (scene !== 'songs') return
            medleymode = false
            clearTimeout(timer)
            startsong()
            break
        case "backspace":
            back()
            break
        case "m":
            if (!Songs.length) return
            if (scene !== 'songs') return
            clearTimeout(timer)
            menubox.showModal()
        case " ":
            if (scene !== 'play') return
            if (!audio.paused) pauseplayer(); else startplayer()
            break
    }
});
