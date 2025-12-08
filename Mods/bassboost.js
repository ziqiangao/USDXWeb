const CUTOFF = 80
audioready = () => {
    const DCRemove = ctx.createBiquadFilter()
    DCRemove.Q.value = Math.SQRT1_2
    DCRemove.type = "highpass"
    DCRemove.frequency.value = 5
    audioprocessinput.disconnect()
    audioprocessinput.connect(DCRemove)



    const HP = ctx.createBiquadFilter()
    const LP = ctx.createBiquadFilter()

    DCRemove.connect(LP)
    DCRemove.connect(HP)
    LP.frequency.value = CUTOFF
    HP.frequency.value = CUTOFF
    LP.Q.value = Math.SQRT1_2
    HP.Q.value = Math.SQRT1_2
    HP.type = "highpass"


    const HPPreGain = ctx.createGain()
    const LPPreGain = ctx.createGain()

    LP.connect(LPPreGain)
    HP.connect(HPPreGain)

    LPPreGain.gain.value = 5
    HPPreGain.gain.value = 3

    const HPCompressor = ctx.createDynamicsCompressor()
    const LPCompressor = ctx.createDynamicsCompressor()

    LPCompressor.attack.value = 0.01
    HPCompressor.attack.value = 0.01

    LPCompressor.release.value = 1
    HPCompressor.release.value = 1

    LPCompressor.knee.value = 24
    HPCompressor.knee.value = 24

    LPCompressor.ratio.value = 4
    HPCompressor.ratio.value = 4

    LPCompressor.threshold.value = -24
    HPCompressor.threshold.value = -24

    LPPreGain.connect(LPCompressor)
    HPPreGain.connect(HPCompressor)

    const LPPostGain = ctx.createGain()
    LPPostGain.gain.value = 0.9
    const HPPostGain = ctx.createGain()
    HPPostGain.gain.value = 0.7

    HPCompressor.connect(HPPostGain)
    LPCompressor.connect(LPPostGain)

    HPPostGain.connect(gainnode)
    LPPostGain.connect(gainnode)
}