var rooms = []

const roomModel = {
    roomName: '',
    userNum: 0,
    isPrivate: false,
    password: null
}

// addRoom, removeRoom, getRoom, getAllRooms

const addRoom = (roomName, isPrivate = false, password = null) => {
    const room = rooms.find(room => room.roomName === roomName)

    if (!room) {
        // Add a new room with userNum initialized to 0
        rooms.push({ 
            roomName, 
            userNum: 0,
            isPrivate,
            password
        })
        return { roomName, isPrivate }
    }
    
    return { error: 'Room already exists!' }
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
            userNum: room.userNum,
            isPrivate: room.isPrivate
        }
    }
    return {
        error: 'No room with this name!'
    }
}

const verifyRoomPassword = (roomName, password) => {
    const room = rooms.find(room => room.roomName === roomName)
    
    if (!room) {
        return false;
    }
    
    if (!room.isPrivate) {
        return true;
    }
    
    if (!password || !room.password) {
        return false;
    }
    
    return room.password === password;
}

const getAllRooms = () => {
    return rooms.map(room => ({
        roomName: room.roomName, 
        userNum: room.userNum,
        isPrivate: room.isPrivate
    }));
}

const incUserNum = (roomName) => {
    const room = rooms.find(room => room.roomName === roomName)
    
    if (room) {
        room.userNum++
        return {
            roomName: room.roomName,
            userNum: room.userNum,
            isPrivate: room.isPrivate
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
            userNum: room.userNum,
            isPrivate: room.isPrivate
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
    addRoom, removeRoom, getRoom, getAllRooms, incUserNum, decreaseUserNum, verifyRoomPassword
}
