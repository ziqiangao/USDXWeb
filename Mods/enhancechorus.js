/**
 * Compute similarity between two strings as a number between 0 and 1
 * @param {string} strA
 * @param {string} strB
 * @returns {number}
 */
function similarity(strA, strB) {
    // normalize strings
    const a = normalizestring(strA).split(" ");
    const b = normalizestring(strB).split(" ");

    // handle empty strings
    if (a.length === 0 && b.length === 0) return 1;
    if (a.length === 0 || b.length === 0) return 0;

    // convert to sets to count unique word matches
    const setA = new Set(a);
    const setB = new Set(b);

    // intersection size
    let matches = 0;
    for (const word of setA) {
        if (setB.has(word)) matches++;
    }

    // Jaccard similarity: intersection / union
    const unionSize = new Set([...setA, ...setB]).size;
    return matches / unionSize;
}

/**
 * Count how many times subarray appears inside main array, using similarity
 * @param {string[]} mainArr
 * @param {string[]} subArr
 * @param {number} threshold similarity threshold (0–1)
 * @returns {number}
 */
function countSubarray(mainArr, subArr, threshold = 0.6) {
    if (subArr.length === 0) return 0; // empty subarray can't match
    let count = 0;

    for (let i = 0; i <= mainArr.length - subArr.length; i++) {
        let match = true;

        for (let j = 0; j < subArr.length; j++) {
            if (similarity(mainArr[i + j], subArr[j]) < threshold) {
                match = false;
                break;
            }
        }

        if (match) count++;
    }

    return count;
}

/**
 * 
 * @param {string} str 
 * @returns {string}
 */
function removeAccents(str) {
    return str
        .normalize("NFD")                  // split into base + combining marks
        .replace(/[\u0300-\u036f]/g, "");  // remove the combining marks
}

/**
 * 
 * @param {string} str 
 * @returns {string}
 */
function normalizestring(str) {
    str = removeAccents(str)
    str = str.replace(/[^a-zA-Z0-9\s]+/g, ''); // keep only letters, numbers, and spaces
    str = str.replace(/\s+/g, ' ').trim();    // collapse spaces and trim
    return str.toLowerCase()
}

/**
 * @param {string} str 
 * @param {string[]} arr 
 * @returns {number}
 */
function count(str, arr) {
    let c = 0
    for (const i of arr) {
        if (similarity(i, str) > 0.6) c++
    }
    return c
}

/**
 * @param {string[]} arr 
 * @returns {string[]} 
 */
function normalizearraystrings(arr) {
    for (const i in arr) {
        arr[i] = normalizestring(arr[i])
    }
    return arr
}

/**
 * Find the largest contiguous block (inclusive indices) starting at or after `from`
 * where the slice of `lines` appears more than once in `lines`.
 *
 * Returns [start, end] inclusive. If no block found returns [lines.length, lines.length].
 *
 * @param {number} from
 * @param {number[]} map
 * @param {string[]} lines
 * @returns {[number, number]}
 */
function findbiggestblock(from, map, lines) {
    const n = map.length;

    // find first index >= from with count > 1
    let start = from;
    while (start < n && map[start] <= 1) start++;
    if (start >= n) return [n, n]; // no block

    let end = start; // inclusive end
    while (end < lines.length) {
        const sub = lines.slice(start, end + 1); // slice is exclusive end, so +1
        if (countSubarray(lines, sub) > 1) {
            end++; // extend while there are still multiple occurrences
        } else {
            break; // stop when no more duplicates
        }
    }

    // end now points to the first index where condition failed
    return [start, end - 1]; // inclusive block
}


/**
 * @param {string[]} arr
 */
function chorus(arr) {
    arr = normalizearraystrings(arr);
    const countmap = [];
    const candidates = [];

    for (const i of arr) {
        countmap.push(count(i, arr));
    }
    //console.log('Count map:', countmap);

    let recent = [0, -1]; // start searching from index 0
    while (recent[1] + 1 < arr.length) {
        const nextStart = recent[1] + 1;
        const block = findbiggestblock(nextStart, countmap, arr);
        // no more blocks
        if (block[0] >= arr.length) break;

        candidates.push(block);
        recent = block;
    }

    const filtered = candidates.filter(([start, end]) =>
        (end - start) > 0
    );
    return filtered
}

Getmedley = (song, medleyMinDuration) => {
    const metadata = song.getmetadata();

    if (song.isduet()) {
        //console.warn(`Medley not supported for duets in ${metadata.TITLE}`);
        return null;
    }

    if (metadata.MEDLEYSTARTBEAT && metadata.MEDLEYENDBEAT) {
        //console.info("Manual Medley");
        return [parseInt(metadata.MEDLEYSTARTBEAT), parseInt(metadata.MEDLEYENDBEAT)];
    }

    const baseLines = song.getAllLines("base");
    const baseLinesObjects = song.getAllLinesAsObjects("base");

    const candidates = chorus(baseLines)

    if (candidates.length == 0) return null

    const durationmap = []
    const beatmap = []
    const lengthmap = []

    for (const i of candidates) {
        const firstline = baseLinesObjects[i[0]]
        const lastline = baseLinesObjects[i[1]]
        const startbeat = +firstline[0].time
        const endbeat = +lastline[lastline.length - 1].time + +lastline[lastline.length - 1].duration
        durationmap.push(endbeat-startbeat)
        lengthmap.push(baseLinesObjects.slice(i[0],i[1] + 1).flat(2).length)
        beatmap.push([startbeat,endbeat])
    }

    let longest = -1
    let longesttime = 0
    for (const i in durationmap) {
        if (song.beattoseclength(durationmap[i]) < medleyMinDuration) continue
        if (song.beattoseconds(beatmap[i][0]) < 9) continue
        if (lengthmap[i] <= longesttime) continue
        longest = i
        longesttime = lengthmap[i]
    }

    if (longest === -1) return null
    return (beatmap[longest])
}