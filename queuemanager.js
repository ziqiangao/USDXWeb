const queue = []

function addtoqueue() {
    queue.push(Songs[active])
    menubox.close()
    console.info(`${Songs[active].getmetadata().TITLE} by ${Songs[active].getmetadata().ARTIST} Was Added Successfully`)
}