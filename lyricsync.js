
/**@type {HTMLElement} */
const debug = document.getElementById("debug")
let beat, bpm = 0

let prevtext1, prevtext2

function loop() {
    if (!showlyrics) {
        showbars(false, false)
        requestAnimationFrame(loop)
        return
    }
    if (audio.currentTime * 1000 > parseInt(currentsong?.getmetadata()?.END || "9999999")) stopplay()
    if (currentjson) {
        bpm = parseFloat(currentjson.metadata["BPM"].replace(',', '.')) || 60
        beat = (audio.currentTime - currentjson.metadata["GAP"] / 1000) * (bpm * 4 / 60)

        getcurrentlyrics(beat)
    }
    requestAnimationFrame(loop)
}


let e = setInterval(() => {
    if (typeof settext === "function") {
        requestAnimationFrame(loop)
        clearInterval(e)
    }
}, 500)

function getcurrentlyrics(beat = -100) {
    if (!currentjson) return;

    let hideBars = beat < -24;

    if (isduet) {
        const p1Lyrics = currentjson.lyrics.p1;
        const p2Lyrics = currentjson.lyrics.p2;

        const lastP1 = p1Lyrics[p1Lyrics.length - 1];
        const lastP2 = p2Lyrics[p2Lyrics.length - 1];

        if (beat > Math.max(lastP1.time + lastP1.duration + 24, lastP2.time + lastP2.duration + 24)) {
            hideBars = true;
        }
    } else {
        const baseLyrics = currentjson.lyrics.base;
        const lastWord = baseLyrics[baseLyrics.length - 1];
        if (beat > lastWord.time + lastWord.duration + 24) {
            hideBars = true;
        }
    }

    showbars(!hideBars, !hideBars && isduet); // hide if finished

    if (hideBars) return; // stop further highlighting

    if (isduet) {
        let idx = getlinebreakattime(beat, currentjson.lyrics.p1)
        let line = getline(idx, currentjson.lyrics.p1)
        if (line[0] !== prevtext1) settext(line[0], line[1], 0, 1); prevtext1 = line[0]
        let highlight = getwordtime(beat, line[2])
        sethighlight(highlight[0], highlight[1], 0)

        idx = getlinebreakattime(beat, currentjson.lyrics.p2)
        line = getline(idx, currentjson.lyrics.p2)
        if (line[0] !== prevtext2) settext(line[0], line[1], 1, 2); prevtext2 = line[0]
        highlight = getwordtime(beat, line[2])
        sethighlight(highlight[0], highlight[1], 1)
    } else {
        let idx = getlinebreakattime(beat, currentjson.lyrics.base)
        let line = getline(idx, currentjson.lyrics.base)
        if (line[0] !== prevtext1) settext(line[0], line[1], 0, 0); prevtext1 = line[0]
        let highlight = getwordtime(beat, line[2])
        sethighlight(highlight[0], highlight[1], 0)
    }
}


function getlinebreakattime(time = 0, lyrics = []) {
    // Find the index of the first word in the current block (the word after the most recent "-")
    if (!lyrics.length) return 0;

    let i = 0;
    // Move forward to the last lyric whose start <= time
    while (i + 1 < lyrics.length && time >= Number(lyrics[i + 1].time)) {
        i++;
    }

    // Move backwards to the most recent '-' marker
    while (i > 0 && lyrics[i].type !== "-") {
        i--;
    }

    // we want the first word after the '-' marker (if there is one)
    if (i > 0) i++;

    // clamp
    if (i < 0) i = 0;
    if (i >= lyrics.length) i = lyrics.length - 1;
    return i;
}

function getline(index = 0, lyrics = []) {
    let i = index;
    let accum = [];
    let accumtype = [];
    let accumlyric = [];

    // iterate until we hit a '-' or end-of-array
    while (i < lyrics.length && lyrics[i].type !== "-") {
        accum.push(lyrics[i].word);
        accumtype.push(lyrics[i].type);
        accumlyric.push(lyrics[i]); // store the whole object for timing
        i++;
    }

    return [accum, accumtype, accumlyric];
}

function getwordtime(beat = 0, lyricblock = []) {
    // Returns [wordIndex, progress] where progress is clamped 0..1
    if (!lyricblock || !lyricblock.length) return [0, 0];

    // normalise numeric fields (defensive)
    for (let k = 0; k < lyricblock.length; k++) {
        lyricblock[k].time = Number(lyricblock[k].time);
        lyricblock[k].duration = Number(lyricblock[k].duration);
        if (!Number.isFinite(lyricblock[k].time)) lyricblock[k].time = 0;
        if (!Number.isFinite(lyricblock[k].duration)) lyricblock[k].duration = 0;
    }

    // before first word
    if (beat < lyricblock[0].time) return [0, 0];

    const lastIndex = lyricblock.length - 1;
    // after last word -> return last word with completed progress
    if (beat >= lyricblock[lastIndex].time + lyricblock[lastIndex].duration) {
        return [lastIndex, 1];
    }

    // find current word index (advance while beat >= end of the word)
    let i = 0;
    while (i < lyricblock.length && beat >= (lyricblock[i].time + lyricblock[i].duration)) {
        i++;
    }

    // safety clamp
    if (i >= lyricblock.length) return [lastIndex, 1];
    if (i < 0) i = 0;

    const word = lyricblock[i];
    // handle zero/negative durations: treat as instant -> progress = 1 if beat >= start, else 0
    let progress;
    if (word.duration <= 0) {
        progress = beat >= word.time ? 1 : 0;
    } else {
        progress = (beat - word.time) / word.duration;
    }

    // clamp progress to [0,1]
    progress = Math.max(0, Math.min(1, progress));

    return [i, progress];
}
