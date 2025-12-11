class Song {
    /** @type {FileSystemDirectoryHandle} */
    #folder;

    /** @type {String} */
    #text;

    /** @type {Object} */
    #parsedjson;

    /** @type {FileSystemFileHandle} */
    #audio;

    /** @type {?FileSystemFileHandle} */
    #video;

    /** @type {?FileSystemFileHandle} */
    #instrumental;

    /** @type {?FileSystemFileHandle} */
    #vocals;

    /** @type {?FileSystemFileHandle} */
    #cover;

    /** @type {?FileSystemFileHandle} */
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

        if (this.#text) {Songs.push(this)} else {return}
        let lines = this.#text.split(/\r?\n/)

        let pswitch = 0
        for (const line of lines) {
            if (line.startsWith("E")) {
                break
            }
            if (line.startsWith("P")) {
                pswitch = parseInt(line.replaceAll(" ","")[1])
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

    async storefilepointers() {
        if (!this.#parsedjson) throw "JSON Not Loaded"
        for (const key of Object.keys(this.#parsedjson.metadata)) {
            const value = this.#parsedjson.metadata[key]
            try {

                if (key == "AUDIO" || key == "MP3") {
                    this.#audio = await this.#folder.getFileHandle(value)
                }
                if (key == "VIDEO") {
                    this.#video = await this.#folder.getFileHandle(value)
                }
                if (key == "COVER") {
                    this.#cover = await this.#folder.getFileHandle(value)
                }
                if (key == "BACKGROUND") {
                    this.#background = await this.#folder.getFileHandle(value)
                }
                if (key == "VOCALS") {
                    this.#vocals = await this.#folder.getFileHandle(value)
                }
                if (key == "INSTRUMENTAL") {
                    this.#instrumental = await this.#folder.getFileHandle(value)
                }
            } catch {
                console.log(`File ${value} could not be loaded, "${this.#parsedjson.metadata.TITLE}"`)
            }
        }
    }

    /**
     * 
     * @param {"vocals"|"instrumental"|"video"|"audio"|"cover"|"background"} type 
     * @returns {?File}
     */
    async getresource(type) {
        switch (type.toLowerCase()) {
            case "vocals":
                if (!this.#vocals) return null
                return await this.#vocals.getFile()
            case "instrumental":
                if (!this.#instrumental) return null
                return await this.#instrumental.getFile()
            case "video":
                if (!this.#video) return null
                return await this.#video.getFile()
            case "audio":
                if (!this.#audio) return null
                return await this.#audio.getFile()
            case "cover":
                if (!this.#cover) return null
                return await this.#cover.getFile()
            case "background":
                if (!this.#background) return null
                return await this.#background.getFile()
            default:
                return null
        }
    }

    getjson() {
        return this.#parsedjson
    }

    isduet() {
        if (!this.#parsedjson) throw "JSON Not Loaded"
        return this.#parsedjson.lyrics.p1.length > 0 && this.#parsedjson.lyrics.p2.length > 0
    }

    getlyrics() {
        if (!this.#parsedjson) throw "JSON Not Loaded"
        return this.#parsedjson.lyrics
    }

    getmetadata() {
        if (!this.#parsedjson) throw "JSON Not Loaded"
        return this.#parsedjson.metadata
    }

    getLineAt(line, player) {
        let accum = 0;
        let accumarray = [];
        let idx = 0;

        // Find the start of the requested line
        while (accum < line) {
            if (idx >= this.#parsedjson.lyrics[player].length) return null; // prevent overflow
            let block = this.#parsedjson.lyrics[player][idx];
            if (block.type == "-") accum++;
            idx++;
        }

        // Collect words for this line
        while (idx < this.#parsedjson.lyrics[player].length && this.#parsedjson.lyrics[player][idx].type != "-") {
            accumarray.push(this.#parsedjson.lyrics[player][idx]);
            idx++;
        }

        return accumarray;
    }

    getLineAsString(line, player) {
        let accum = 0;
        let accumstring = "";
        let idx = 0;

        // Find the start of the requested line
        while (accum < line) {
            if (idx >= this.#parsedjson.lyrics[player].length) return null; // prevent overflow
            let block = this.#parsedjson.lyrics[player][idx];
            if (block.type == "-") accum++;
            idx++;
        }

        // Collect words for this line
        while (idx < this.#parsedjson.lyrics[player].length && this.#parsedjson.lyrics[player][idx].type != "-") {
            accumstring += this.#parsedjson.lyrics[player][idx].word;
            idx++;
        }

        return accumstring;
    }

    /**
     * Get all lines of lyrics for a player
     * @param {"base"|"p1"|"p2"} player - which player's lyrics
     * @returns {String[]} array of lyric lines
     */
    getAllLines(player) {
        const lyrics = this.#parsedjson.lyrics[player];
        const lines = [];
        let lineAccumulator = "";

        for (const block of lyrics) {
            if (block.type === "-") {
                if (lineAccumulator) {
                    lines.push(lineAccumulator);
                    lineAccumulator = "";
                }
            } else {
                lineAccumulator += block.word;
            }
        }

        // Push the last line if it doesn't end with "-"
        if (lineAccumulator) lines.push(lineAccumulator);

        return lines;
    }


    /**
     * Get all lines of lyrics for a player
     * @param {"base"|"p1"|"p2"} player - which player's lyrics
     * @returns {[Object[]]} array of lyric lines
     */
    getAllLinesAsObjects(player) {
        const lyrics = this.#parsedjson.lyrics[player];
        const lines = [];
        let lineAccumulator = [];

        for (const block of lyrics) {
            if (block.type === "-") {
                if (lineAccumulator) {
                    lines.push(lineAccumulator);
                    lineAccumulator = [];
                }
            } else {
                lineAccumulator.push(block);
            }
        }

        // Push the last line if it doesn't end with "-"
        if (lineAccumulator) lines.push(lineAccumulator);

        return lines;
    }

    /**
     * 
     * @param {number} beat 
     * @returns {number}
     */
    beattoseconds(beat) {
        return (this.#parsedjson.metadata.GAP / 1000) + (beat*60) / (parseFloat(this.#parsedjson.metadata.BPM.replace(",",".")) * 4)
    }

    /**
     * 
     * @param {number} beat 
     * @returns {number}
     */
    beattoseclength(beat) {
        return (beat*60) / (parseFloat(this.#parsedjson.metadata.BPM.replace(",",".")) * 4)
    }

    #lineisrap(line) {
        if (line.length == 0) return false
        let temp = true
        for (const i of line) {
            if (!"RG".includes(i.type)) temp = false
        }
        return temp
    }

    containsrap() {
        let rap = false
        let lines = this.getAllLinesAsObjects("base")
        for (const i of lines) {
            rap ||= this.#lineisrap(i)
        }
        lines = this.getAllLinesAsObjects("p1")
        for (const i of lines) {
            rap ||= this.#lineisrap(i)
        }
        lines = this.getAllLinesAsObjects("p2")
        for (const i of lines) {
            rap ||= this.#lineisrap(i)
        }
        return rap
    }
}
