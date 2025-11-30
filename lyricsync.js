
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
    if (audio.currentTime * 1000 > parseInt(currentsong?.getmetadata()?.END || "999999999")) finished()
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

let currentblockbase
let currentblockp1
let currentblockp2
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

    if (hideBars) {
        // clear current block variables when hidden
        currentblockbase = null;
        currentblockp1 = null;
        currentblockp2 = null;
        return; // stop further highlighting
    }

    if (isduet) {
        // P1
        let idx = getlinebreakattime(beat, currentjson.lyrics.p1);
        let line = getline(idx, currentjson.lyrics.p1);
        if (line[0] !== prevtext1) settext(line[0], line[1], 0, 1);
        prevtext1 = line[0];
        let highlight = getwordtime(beat, line[2]);
        // set the current block variable to the highlighted lyric object (or null)
        currentblockp1 = (line[2] && line[2].length > 0 && line[2][highlight[0]]) ? line[2][highlight[0]] : null;
        sethighlight(highlight[0], highlight[1], 0);

        // P2
        idx = getlinebreakattime(beat, currentjson.lyrics.p2);
        line = getline(idx, currentjson.lyrics.p2);
        if (line[0] !== prevtext2) settext(line[0], line[1], 1, 2);
        prevtext2 = line[0];
        highlight = getwordtime(beat, line[2]);
        currentblockp2 = (line[2] && line[2].length > 0 && line[2][highlight[0]]) ? line[2][highlight[0]] : null;
        sethighlight(highlight[0], highlight[1], 1);
    } else {
        let idx = getlinebreakattime(beat, currentjson.lyrics.base);
        let line = getline(idx, currentjson.lyrics.base);
        if (line[0] !== prevtext1) settext(line[0], line[1], 0, 0);
        prevtext1 = line[0];
        let highlight = getwordtime(beat, line[2]);
        currentblockbase = (line[2] && line[2].length > 0 && line[2][highlight[0]]) ? line[2][highlight[0]] : null;
        sethighlight(highlight[0], highlight[1], 0);

        // clear duet-specific block vars
        currentblockp1 = null;
        currentblockp2 = null;
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
    if (beat < lyricblock[0].time) return [-1, 0];

    const lastIndex = lyricblock.length - 1;

    // after last word -> return last word with completed progress
    if (beat >= lyricblock[lastIndex].time + lyricblock[lastIndex].duration) {
        return [lastIndex, 1];
    }

    // Find index of the first word whose start is greater than beat
    let nextIndex = 0;
    while (nextIndex < lyricblock.length && beat >= lyricblock[nextIndex].time) {
        nextIndex++;
    }

    // nextIndex is the index of the next word (start > beat), or lyricblock.length
    if (nextIndex === 0) return [0, 0]; // defensive, should be handled above

    const prevIndex = nextIndex - 1;
    const prev = lyricblock[prevIndex];

    // If beat is within the previous word's duration, compute normal progress
    if (beat < prev.time + prev.duration) {
        let progress;
        if (prev.duration <= 0) {
            progress = beat >= prev.time ? 1 : 0;
        } else {
            progress = (beat - prev.time) / prev.duration;
        }
        progress = Math.max(0, Math.min(1, progress));
        return [prevIndex, progress];
    }

    // If beat is after prev end but before next start => hold prev at 1
    if (nextIndex < lyricblock.length) {
        const next = lyricblock[nextIndex];
        if (beat < next.time) {
            return [prevIndex, 1];
        }
    }

    // Fallback: find the current word by scanning (shouldn't normally reach here)
    let i = 0;
    while (i < lyricblock.length && beat >= (lyricblock[i].time + lyricblock[i].duration)) {
        i++;
    }
    if (i >= lyricblock.length) return [lastIndex, 1];
    const word = lyricblock[i];
    let progress;
    if (word.duration <= 0) {
        progress = beat >= word.time ? 1 : 0;
    } else {
        progress = (beat - word.time) / word.duration;
    }
    progress = Math.max(0, Math.min(1, progress));
    return [i, progress];
}
