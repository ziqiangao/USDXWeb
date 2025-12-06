const menubox = document.getElementById("menuoverlay").children[0];

menubox.org = menubox.close
menubox.orgshow = menubox.showModal

menubox.close = () => {
    menubox.style.transform = "translate(0px, -100dvh)"; // correct property
    setTimeout(() => {
        menubox.org();
    }, 500);
};

menubox.showModal = () => {
    menubox.orgshow();
    menubox.style.transform = "translate(0px, 0px)"; // correct property
    
};

async function reloadcurrentsong() {
    await Songs[active].parse()
    await Songs[active].storefilepointers()
    menubox.close()
}

function startsong() {
    if (songon) return
    medleymode = false
    menubox.close()
    clearTimeout(timer)
    if (queue.length > 0) commitplay(queue.shift()); else commitplay(Songs[active])
}