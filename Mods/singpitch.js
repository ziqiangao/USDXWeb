const synthbase = new Tone.Synth().toDestination();
const synthp1 = new Tone.Synth().toDestination();
const synthp2 = new Tone.Synth().toDestination();
const snareb = document.createElement("audio");
snareb.src = "mods/Snare.wav";

const snare1 = document.createElement("audio");
snare1.src = "mods/Snare.wav";

const snare2 = document.createElement("audio");
snare2.src = "mods/Snare.wav";

let tempb, temp1, temp2

function isSnareType(t) {
    return t === "F" || t === "G" || t === "R";
}


function synthloop() {

    if (tempb !== currentblockbase) {
        tempb = currentblockbase;
        if (tempb) {

            if (isSnareType(tempb.type)) {
                snareb.currentTime = 0
                snareb.play()
            } else {

                const time = Tone.now();
                const dur = currentsong.beattoseclength(tempb.duration);
                const freq = 440 * Math.pow(2, (tempb.pitch - 9) / 12);
                synthbase.triggerAttackRelease(freq, dur, time);


            }
        }
    }

    if (temp1 !== currentblockp1) {
        temp1 = currentblockp1;
        if (temp1) {

            if (isSnareType(temp1.type)) {
                snare1.currentTime = 0
                snare1.play()
            } else {

                const time = Tone.now();
                const dur = currentsong.beattoseclength(temp1.duration);
                const freq = 438 * Math.pow(2, (temp1.pitch - 9) / 12);
                synthp1.triggerAttackRelease(freq, dur, time);

            }
        }
    }

    if (temp2 !== currentblockp2) {
        temp2 = currentblockp2;
        if (temp2) {

            if (isSnareType(temp2.type)) {
                snare2.currentTime = 0
                snare2.play()
            } else {
                const time = Tone.now();
                const dur = currentsong.beattoseclength(temp2.duration);
                const freq = 442 * Math.pow(2, (temp2.pitch - 9) / 12);
                synthp2.triggerAttackRelease(freq, dur, time);


            }
        }
    }

    requestAnimationFrame(synthloop);
}

requestAnimationFrame(synthloop)