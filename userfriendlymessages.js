const toaststyles = {
    "error": { background: "linear-gradient(to right, #c82100ff, #c94b3dff)" },
    "warning": { background: "linear-gradient(to right, #c8a000ff, #f0e328ff)" },
    "info": { background: "linear-gradient(to right, #00c8b1ff, #3d93c9ff)" },
}

function makemessage(msg, type) {
    Toastify({
        text: msg,
        gravity: "bottom", // `top` or `bottom`
        position: "left", // `left`, `center` or `right`
        duration: 2000,
        style: toaststyles[type]
    }).showToast();
}

console.orgwarn = console.warn
console.orginfo = console.info
console.orgerror = console.error

console.warn = (...msg) => {
    console.orgwarn(msg.join(" "))
    makemessage(String(msg.join(" ")),'warning')
}
console.info = (...msg) => {
    console.orginfo(msg.join(" "))
    makemessage(String(msg.join(" ")),'info')
}
console.error = (...msg) => {
    console.orgerror(msg.join(" "))
    makemessage(String(msg.join(" ")),'error')
}
