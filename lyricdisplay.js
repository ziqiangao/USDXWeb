const bottombar = document.getElementById("bottombar")
const topbar = document.getElementById("topbar")

function sethighlightcss(prg = 0.5, set = [0]) {
    prg = Math.max(0, Math.min(1, prg));
    const pct = prg * 100;

    // Build gradient strings
    const base = `linear-gradient(to right, gold 0%, gold ${pct}%, white ${pct}%, white 100%)`;
    const p1 = `linear-gradient(to right, dodgerblue 0%, dodgerblue ${pct}%, lightblue ${pct}%, lightblue 100%)`;
    const p2 = `linear-gradient(to right, hotpink 0%, hotpink ${pct}%, pink ${pct}%, pink 100%)`;

    // Iterate through all stylesheets
    for (const rule of document.styleSheets[2].cssRules) {

        if (rule.selectorText === ".highlighting" && set.includes(0)) {
            rule.style.backgroundImage = base;
        }

        if (rule.selectorText === ".duetp1.highlighting" && set.includes(1)) {
            rule.style.backgroundImage = p1;
        }

        if (rule.selectorText === ".duetp2.highlighting" && set.includes(2)) {
            rule.style.backgroundImage = p2;
        }
    }
}

function settext(text = ["We ", "are"], type = [":", ":"], pos = 0, player = 0) {
    let ele = bottombar
    if (pos === 1) {
        ele = topbar
    }
    ele.replaceChildren()
    let i = 0
    for (const word of text) {
        let block = document.createElement("span")
        block.innerText = word
        block.classList.add("block")
        if (player > 0) {
            block.classList.add(`duetp${player}`)
        }
        if ("GRF".includes(type[i])) {
            block.classList.add("freestyle")
        }
        ele.appendChild(block)
        i++
    }
}

function sethighlight(word = 0, prg = 0, pos = 0) {
    let ele = bottombar
    if (pos === 1) {
        ele = topbar
    }
    for (let i = 0;i < ele.children.length;i++) {
        ele.children[i].classList.remove("highlighting")
        ele.children[i].classList.remove("highlighted")
        if (i < word) {
            ele.children[i].classList.add("highlighted")
        } else if (i == word) {
            ele.children[i].classList.add("highlighting")
        }
    }
    if (isduet) {
        sethighlightcss(prg,[pos+1])
    } else {
        sethighlightcss(prg,[pos])
    }
    
}

function showbars(bottom, top) {
    bottombar.classList.add("hide")
    topbar.classList.add("hide")
    if (bottom) bottombar.classList.remove("hide")
    if (top) topbar.classList.remove("hide")
}