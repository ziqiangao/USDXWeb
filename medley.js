/**
 * 
 * @param {Song} song 
 * @param {number} medleyMinDuration 
 * @returns {[number,number]?}
 */
function Getmedley(song, medleyMinDuration) {
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

    if ((!baseLines || baseLines.length === 0) &&
        (!song.getAllLines("p1") || song.getAllLines("p1").length === 0) &&
        (!song.getAllLines("p2") || song.getAllLines("p2").length === 0)) {
        //console.warn(`Invalid lyrics in ${metadata.TITLE}`);
        return null;
    }

    if (metadata.RELATIVE === "yes") {
        //console.warn(`Relative timestamps are not supported for medleys in ${metadata.TITLE}`);
        return null;
    }

    if (metadata.CALCMEDLEY === "off") {
        //console.info(`${metadata.TITLE} has disabled calculating medley`);
        return null;
    }

    const bpm = parseFloat((metadata.BPM || "0").replace(',', '.')) || 0;
    const medleyMinBeats = Math.floor(medleyMinDuration * bpm / 15);
    const minStartBeats = Math.ceil(8 * bpm / 15); // 8 seconds in beats

    let medleyCandidates = [];
    const normalised = baseLines.map(s => (s || "").toLowerCase().replace(/[,\.!?~ ]/g, ''));
    if (!normalised || normalised.length < 2) return null;

    // find medley candidates
    for (let i = 0; i <= normalised.length - 2; i++) {
        const firstRaw = normalised[i];
        if (!firstRaw) continue;

        const startLineNotes = song.getLineAt(i, "base");
        if (!startLineNotes || startLineNotes.length === 0) continue;

        const startBeat = parseFloat(startLineNotes[0].time);
        if (startBeat < minStartBeats) continue; // skip candidates too close to start

        for (let j = i + 4; j < normalised.length; j++) {
            const secondRaw = normalised[j];
            if (!secondRaw) continue;

            if (firstRaw === secondRaw) {
                let start = i;
                let end = i;
                let max = j + (j - i) - 1 > normalised.length - 1 ? normalised.length - j - 1 : j - i - 1;

                for (let k = 1; k <= max; k++) {
                    const a = normalised[i + k];
                    const b = normalised[j + k];
                    if (!a || !b) break;
                    if (a === b) end = i + k;
                    else break;
                }

                medleyCandidates.push([start, end]);
            }
        }
    }

    if (medleyCandidates.length === 0) {
        //console.warn(`No medley candidates found for ${metadata.TITLE}`);
        return null;
    }

    // pick longest candidate
    let longestMedleyIndex = 0;
    for (let l = medleyCandidates.length - 1; l >= 0; l--) {
        const lenL = medleyCandidates[l][1] - medleyCandidates[l][0];
        const lenCur = medleyCandidates[longestMedleyIndex][1] - medleyCandidates[longestMedleyIndex][0];
        if (lenL >= lenCur) longestMedleyIndex = l;
    }

    let medleyStartLine = medleyCandidates[longestMedleyIndex][0];
    let medleyEndLine   = medleyCandidates[longestMedleyIndex][1];

    const medleyLineCount = medleyEndLine - medleyStartLine + 1;
    if (medleyLineCount <= 3) {
        //console.warn(`No suitable medley section for ${metadata.TITLE}`);
        return null;
    }

    const startLineNotes = song.getLineAt(medleyStartLine, "base");
    const endLineNotes = song.getLineAt(medleyEndLine, "base");
    if (!startLineNotes || !endLineNotes) return null;

    let medleyStartBeat = parseFloat(startLineNotes[0].time);
    let medleyEndBeat = parseFloat(endLineNotes[endLineNotes.length - 1].time)
                       + parseFloat(endLineNotes[endLineNotes.length - 1].duration);

    let medleyDuration = (medleyEndBeat - medleyStartBeat + 1) * 15 / bpm;
    if (medleyDuration < medleyMinDuration) {
        const approximateEndBeat = medleyStartBeat + medleyMinBeats - 1;
        for (const lineObj of baseLinesObjects) {
            if (medleyDuration >= medleyMinDuration) break;
            for (const noteObj of lineObj) {
                const noteTime = parseFloat(noteObj.time);
                if (noteTime > approximateEndBeat) {
                    const last = lineObj[lineObj.length - 1];
                    medleyEndBeat = parseFloat(last.time) + parseFloat(last.duration);
                    medleyDuration = (medleyEndBeat - medleyStartBeat + 1) * 15 / bpm;
                    break;
                }
            }
        }
    }
    return medleyDuration >= medleyMinDuration ? [medleyStartBeat, medleyEndBeat] : null;
}
