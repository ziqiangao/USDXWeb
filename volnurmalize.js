let created = false
function volnormanize() {
    if (!created) {
        const ctx = new AudioContext()
        const media = ctx.createMediaElementSource(audio)
        const gain = ctx.createGain()
        media.connect(gain)
        gain.gain.value = 6
        const compressor = ctx.createDynamicsCompressor()
        gain.connect(compressor)
        compressor.attack.value = 0
        compressor.release.value = 1
        compressor.knee.value = 24
        compressor.ratio.value = 8
        compressor.threshold.value = -28
        compressor.connect(ctx.destination)

        document.addEventListener("click", () => {
            if (ctx.state == "suspended") {
                ctx.resume()
            }
        })
        created = true
    }
}
