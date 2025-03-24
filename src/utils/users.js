var users = []

// add user, remove user, getUser, getUsersInRoom

const addUser = ({id, username, room}) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate the data
    if(!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    // check for existing username
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if(existingUser) {
        return {
            error: 'Username is already taken!'
        }
    }

    // store user
    const user = {id, username, room}
    users.push(user)
    return {user}
}

const removeUser = (id) => {
    const userDelete = users.find((user) => user.id === id)
    users = users.filter((user) => user.id !== id)
    
    return userDelete // return the deleted user
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}


const getUsersInRoom = (roomName) => {
    return users.filter((user) => user.room === roomName)
}

module.exports = {
    addUser, removeUser, getUser, getUsersInRoom
}