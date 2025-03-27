var rooms = []

const roomModel = {
    roomName: '',
    userNum: 0
}

// addRoom, removeRoom, getRoom, getAllRooms

const addRoom = (roomName) => {
    const room = rooms.find(room => room.roomName === roomName)

    if (!room) {
        // Add a new room with userNum initialized to 0
        rooms.push({ roomName, userNum: 0 })
    }
    
    return room
}

const removeRoom = (roomName) => {
    const roomDelete = rooms.find(room => room.roomName === roomName)
    
    if (roomDelete) {
        // Remove the room and update rooms array
        rooms = rooms.filter(room => room.roomName !== roomName)
        
        // Return the removed room
        return {
            roomName: roomDelete.roomName
        }
    }
    return {
        error: 'No room with this name!'
    }
}

const getRoom = (roomName) => {
    const room = rooms.find(room => room.roomName === roomName)
    
    if (room) {
        return {
            roomName: room.roomName,
            userNum: room.userNum
        }
    }
    return {
        error: 'No room with this name!'
    }
}

const getAllRooms = () => {
    return rooms.map(room => ({roomName: room.roomName, userNum: room.userNum }));
}

const incUserNum = (roomName) => {
    const room = rooms.find(room => room.roomName === roomName)
    
    if (room) {
        room.userNum++
        return {
            roomName: room.roomName,
            userNum: room.userNum
        }
    }
    return {
        error: 'No room with this name!'
    }
}

const decreaseUserNum = (roomName) => {
    const room = rooms.find((room) => room.roomName === roomName)

    if(room) {
        room.userNum--
        return {
            roomName: room.roomName,
            userNum: room.userNum
        }
    }
    return {
        error: 'No room with this name!'
    }
}

// addRoom(12)
// addRoom(11)
// addRoom(10)

// incUserNum(10)


// // console.log(rooms)

// const arr = getAllRooms()

// // console.log(arr)

// removeRoom(11)
// decreaseUserNum(10)
// // decreaseUserNum(10)

// console.log(rooms)


module.exports = {
    addRoom, removeRoom, getRoom, getAllRooms, incUserNum, decreaseUserNum
}
