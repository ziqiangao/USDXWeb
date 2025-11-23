class Song {
    /** @type {FileSystemDirectoryHandle} */
    #folder;

    /** @type {String} */
    #text;

    /** @type {Object} */
    #parsedjson;

    /** @type {Blob} */
    #audio;

    /** @type {?Blob} */
    #video;

    /** @type {?Blob} */
    #instrumental;

    /** @type {?Blob} */
    #vocals;

    /** @type {?Blob} */
    #cover;

    /** @type {?Blob} */
    #background;

    /**
     * @param {FileSystemDirectoryHandle} data
     */
    constructor(data) {
        this.#folder = data;

        this.#parsedjson = null;
        this.#audio = null;
        this.#video = null;
        this.#instrumental = null;
        this.#vocals = null;
        this.#cover = null;
        this.#background = null;
    }

    /**
     * @param {Number} p 
     * @param {any} i 
     * @returns {voids}
     */
    #push(p, i) {
        if (p == 0) {
            this.#parsedjson.lyrics.base.push(i)
            return
        }
        if (p == 1) {
            this.#parsedjson.lyrics.p1.push(i)
            return
        }
        if (p == 2) {
            this.#parsedjson.lyrics.p2.push(i)
            return
        }
    }

    /**@param {String} line  */
    #splitlyricline(line) {
        let tmp2 = line.split(" ", 4)
        let i = line.charAt(line.length - 1) == " " ? line.length - 2 : line.length - 1
        while (line.charAt(i) != " ") {
            i--
        }
        while (line.charAt(i) == " ") {
            i--
        }
        i += 2
        tmp2.push(line.slice(i))
        return tmp2
    }

    async parse() {
        this.#parsedjson = { metadata: {}, lyrics: { base: [], p1: [], p2: [] } };

        for await (const entry of this.#folder.values()) {
            if (entry.kind === 'file' && entry.name.endsWith('.txt')) {
                const file = await entry.getFile();
                this.#text = await file.text();
            }
        }


        let lines = this.#text.split(/\r?\n/)

        let pswitch = 0
        for (const line of lines) {
            if (line.startsWith("E")) {
                break
            }
            if (line.startsWith("P")) {
                pswitch = parseInt(line[1])
                continue
            }
            if (line.startsWith("#")) {
                let temp = line.slice(1).split(":", 2)
                this.#parsedjson.metadata[temp[0]] = temp[1]
                continue
            }
            if (!line.trim()) {
                continue
            }
            if (line.startsWith("-")) {
                this.#push(pswitch, { type: "-", time: line.slice(2) })
                continue
            }
            let temp = this.#splitlyricline(line)
            let lyricblock = { type: temp[0], time: temp[1], duration: temp[2], pitch: temp[3], word: temp[4] }
            this.#push(pswitch, lyricblock)
        }
    }

    async #getblobfromfilename(name = "") {
        const file = await this.#folder.getFileHandle(name)
        return await file.getFile()
    }

    async storeblobs() {

        for (const key of Object.keys(this.#parsedjson.metadata)) {
            try {
                const value = this.#parsedjson.metadata[key]
                if (key == "AUDIO" || key == "MP3") {
                    this.#audio = await this.#getblobfromfilename(value)
                }
                if (key == "VIDEO") {
                    this.#video = await this.#getblobfromfilename(value)
                }
                if (key == "COVER") {
                    this.#cover = await this.#getblobfromfilename(value)
                }
                if (key == "BACKGROUND") {
                    this.#background = await this.#getblobfromfilename(value)
                }
                if (key == "VOCALS") {
                    this.#vocals = await this.#getblobfromfilename(value)
                }
                if (key == "INSTRUMENTAL") {
                    this.#instrumental = await this.#getblobfromfilename(value)
                }
            } catch {
                console.warn(`File could not be loaded`)
            }
        }
    }

    /**
     * 
     * @param {String} type 
     * @returns {?File}
     */
    getresource(type) {
        switch (type.toLowerCase()) {
            case "vocals":
                return this.#vocals
            case "instrumental":
                return this.#instrumental
            case "video":
                return this.#video
            case "audio":
                return this.#audio
            case "cover":
                return this.#cover
            case "background":
                return this.#background
        }
    }

    getjson() {
        return this.#parsedjson
    }

    isduet() {
        return this.#parsedjson.lyrics.p1.length > 0 && this.#parsedjson.lyrics.p2.length > 0
    }
}
