let medleystart, medleyend, medleymode
const applauseplayer = document.createElement("audio")
const tickplayer = document.createElement("audio")
applauseplayer.src = "Effects/applause.wav"
applauseplayer.volume = 0.7
tickplayer.src = "Effects/tick.wav"
tickplayer.volume = 0.7

function startmedley() {
    // weed out songs without a medley seg
    const temp = queue.filter(song => SongwithMedley.includes(song))
    if (temp.length != queue.length) console.warn("Some Songs Were Removed as they did not support medley mode")
    // mutate the existing array instead of rebinding
    queue.length = 0;
    queue.push(...temp);

    if (songon) return
    menubox.close()
    if (queue.length > 0) medley(queue.shift()); else medley(Songs[active])
}

async function medley(song) {
    
    medleymode = true
    const medleyseg = Getmedley(song, 10)
    if (!medleyseg) { console.warn("Medley Not Supported"); return }
    medleystart = song.beattoseconds(medleyseg[0])
    medleyend = song.beattoseconds(medleyseg[1])
    await commitplay(song)
    setTimeout(startcountdown,900)
}

let secs
const countdownEl = document.getElementById('countdown');

function startcountdown() {
    countdownEl.style.display = ''
    secs = 8; // starting countdown
    tick()
}

function tick() {
  if (secs < 0) {
    countdownEl.style.display = 'none'; // hide after countdown
    return;
  }
    tickplayer.currentTime = 0
    tickplayer.play()

  countdownEl.textContent = secs;
  countdownEl.classList.remove('stomp'); // reset animation
  void countdownEl.offsetWidth; // trigger reflow to restart animation
  countdownEl.classList.add('stomp');

  secs--;
  setTimeout(tick, 950);
}

function getRandomSongs(count) {
    // Create a shallow copy of SongwithMedley to avoid mutating the original
    const copy = [...SongwithMedley];
    const selected = [];

    while (selected.length < count && copy.length > 0) {
        const index = Math.floor(Math.random() * copy.length);
        selected.push(copy.splice(index, 1)[0]); // remove from copy to prevent duplicates
    }

    return selected;
}

function start5medley() {
    menubox.close()
    const randomSongs = getRandomSongs(5);
    if (randomSongs.length < 5) console.warn("Not enough songs for a 5-song medley");
    queue.length = 0;
    queue.push(...randomSongs);
    if (!songon) medley(queue.shift());
}

function start10medley() {
    menubox.close()
    const randomSongs = getRandomSongs(10);
    if (randomSongs.length < 10) console.warn("Not enough songs for a 10-song medley");
    queue.length = 0;
    queue.push(...randomSongs);
    if (!songon) medley(queue.shift());
}
