let created = false
let gainnode
let ctx
function volnormanize() {
    if (!created) {
        ctx = new AudioContext()
        const media = ctx.createMediaElementSource(audio)
        const gain = ctx.createGain()

        media.connect(gain)
        gain.gain.value = 15
        const compressor = ctx.createDynamicsCompressor()
        gain.connect(compressor)
        compressor.attack.value = 0
        compressor.release.value = 1
        compressor.knee.value = 24
        compressor.ratio.value = 4
        compressor.threshold.value = -48
        intergain = ctx.createGain()
        intergain.gain.value = .7
        mastergain = ctx.createGain()
        gainnode = mastergain
        mastergain.gain.value = 1
        compressor.connect(intergain)
        intergain.connect(mastergain)
        mastergain.connect(ctx.destination)

        document.addEventListener("click", () => {
            if (ctx.state == "suspended") {
                ctx.resume()
            }
        })
        created = true
    }
}
