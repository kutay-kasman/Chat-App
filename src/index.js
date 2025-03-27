const path = require("path")
const http = require("http")
const express = require("express")
const socketio = require("socket.io")
const Filter = require("bad-words")
const {generateMessage, generateSystemMessage, generateLocationMessages} = require("./utils/messages.js")
const {addUser, removeUser, getUser, getUsersInRoom} = require("../src/utils/users.js")
const {addRoom, removeRoom, getRoom, getAllRooms, incUserNum, decreaseUserNum} = require("../src/utils/rooms.js")


// set up a server with socket.io
const app = express()
const server = http.createServer(app)
const io = socketio(server) // now web server supports web sockets

const port = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, "../public")
app.use(express.static(publicDirPath))

app.get("/rooms", (req, res) => {
    var rooms = getAllRooms() 
    rooms = rooms.map((room) => {
        if(!room.userNum) {
            removeRoom(room.roomName)
        }
        return room
    })
    res.json(rooms);
});

// connect to socket.io
io.on("connection", (socket) => {
    console.log("New web socket connection")

    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({id: socket.id, username, room})
        
        if(error) {
            return callback(error)
        }

        socket.join(user.room)   
        // console.log(user)
        // console.log(user.room)

        // the room added
        addRoom(user.room)
        incUserNum(user.room)


        socket.emit("sys-message", generateSystemMessage('Welcome!')) 
        socket.broadcast.to(room).emit("sys-message", generateSystemMessage(`${user.username} has joined`, "join"))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
        
    })

    // send message
    socket.on('sendMessage', (message ,callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(message)) {
            return callback('The profanity is not allowed')
        }
        io.to(getUser(socket.id).room).emit("message", generateMessage(user.username, message))
        callback()
    
    })

    // send location
    socket.on('sendLocation', (location, callback) => {
        const locationURL = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
        const user = getUser(socket.id)
        if(user) {
            io.to(user.room).emit('locationMessage', generateLocationMessages(user.username ,locationURL))
            callback()
        }

    })


    socket.on("disconnect", ()=> {
        const user = removeUser(socket.id)
        if(user) {
            decreaseUserNum(user.room)
            socket.broadcast.to(user.room).emit("sys-message", generateSystemMessage(`${user.username} has left`, "exit"))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})


// serve a server
server.listen(port, () => {
    console.log("Server is up on " + port)
})



{/* <script>
    async function fetchRooms() {
        try {
            const response = await fetch('/rooms');
            const rooms = await response.json();
            const roomsList = document.getElementById("rooms-list");
            
            roomsList.innerHTML = rooms.length 
                ? rooms.map(room => `<li>${room}</li>`).join('') 
                : "<li>No active rooms</li>";
        } catch (error) {
            console.error("Error fetching rooms:", error);
        }
    }

    fetchRooms();
</script> */}