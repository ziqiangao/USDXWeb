const discriptions = {
    "Medley": "Medley Mode Is Avalible",
    "Rap": "Song Contains Rap Lines",
    "Duet": "Song Is A Duet",
}

class Card {
    #element
    #coverelement
    #infoelement
    #textcontainer
    #iconcontainer
    #titleelement
    #artistelement
    morebutton

    constructor() {
        // <div class="card">
        this.#element = document.createElement("div")
        this.#element.classList.add("card")

        // <div class="cover">
        this.#coverelement = document.createElement("div")
        this.#coverelement.classList.add("cover")
        this.#element.appendChild(this.#coverelement)

        // <div class="info">
        this.#infoelement = document.createElement("div")
        this.#infoelement.classList.add("info")
        this.#element.appendChild(this.#infoelement)

        // <div class="textcontainer">
        this.#textcontainer = document.createElement("div")
        this.#textcontainer.classList.add("textcontainer")
        this.#infoelement.appendChild(this.#textcontainer)

        // title + artist
        this.#titleelement = document.createElement("span")
        this.#titleelement.classList.add("title")
        this.#textcontainer.appendChild(this.#titleelement)

        this.#artistelement = document.createElement("span")
        this.#artistelement.classList.add("artist")
        this.#textcontainer.appendChild(this.#artistelement)

        // <div class="iconcontainer">
        this.#iconcontainer = document.createElement("div")
        this.#iconcontainer.classList.add("iconcontainer")
        this.#infoelement.appendChild(this.#iconcontainer)

        // More Button
        this.morebutton = document.createElement("button")
        this.morebutton.classList.add("more")
        this.morebutton.innerText = "⋮"
        this.morebutton.setAttribute("type","button")
        this.morebutton.setAttribute("disabled","true")
        this.#infoelement.appendChild(this.morebutton)
        this.morebutton.onclick = () => {
            if (songon) return
            menubox.showModal()
        }
    }

    get element() { return this.#element }

    get artist() { return this.#artistelement.innerText }
    set artist(v) { this.#artistelement.innerText = v }

    get title() { return this.#titleelement.innerText }
    set title(v) { this.#titleelement.innerText = v }

    get icons() {
        const temp = []
        for (const i of this.#iconcontainer.children) {
            temp.push(i.src.slice(5).replace(".svg",""))
        }
    }

    set icons(v) {
        while (this.#iconcontainer.lastElementChild) {
            this.#iconcontainer.removeChild(this.#iconcontainer.lastElementChild);
        }

        for (const i of v) {
            const icon = document.createElement("img")
            icon.title = discriptions[i]
            icon.src = `Icons/${i}.svg`
            icon.classList.add("icon")
            this.#iconcontainer.appendChild(icon)
        }
    }

    get cover() {
        // returns the URL of the background image (without the url(...) wrapper)
        const bg = this.#coverelement.style.backgroundImage;
        return bg ? bg.slice(5, -2) : ""; // removes `url("...")`
    }

    set cover(v) {
        // sets the background image of the cover element
        this.#coverelement.style.backgroundImage = `url("${v}")`;
    }
}

const cards = []
while (cards.length < 7) cards.push(new Card())
cards[0].element.classList.add("preload")
cards[1].element.classList.add("edge")
cards[3].element.classList.add("active")
cards[5].element.classList.add("edge")
cards[6].element.classList.add("preload")
for (let i = 0; i < 7; i++) cardcontainer.appendChild(cards[i].element)
