const path = require("path")
const http = require("http")
const express = require("express")
const socketio = require("socket.io")
const Filter = require("bad-words")
const {generateMessage, generateSystemMessage, generateLocationMessages} = require("./utils/messages.js")
const {addUser, removeUser, getUser, getUsersInRoom} = require("../src/utils/users.js")
const {addRoom, removeRoom, getRoom, getAllRooms, incUserNum, decreaseUserNum, verifyRoomPassword} = require("../src/utils/rooms.js")


// set up a server with socket.io
const app = express()
const server = http.createServer(app)
const io = socketio(server) // now web server supports web sockets

const port = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, "../public")
app.use(express.static(publicDirPath))
app.use(express.json()) // Add middleware to parse JSON bodies

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

// Create a new room
app.post("/create-room", (req, res) => {
    const { roomName, isPrivate, password } = req.body;
    
    if (!roomName) {
        return res.status(400).json({ message: 'Room name is required' });
    }
    
    // For private rooms, ensure password is provided
    if (isPrivate && !password) {
        return res.status(400).json({ message: 'Password is required for private rooms' });
    }
    
    // Trim and validate room name
    const trimmedRoomName = roomName.trim();
    if (trimmedRoomName.length === 0) {
        return res.status(400).json({ message: 'Room name cannot be empty' });
    }
    
    const result = addRoom(trimmedRoomName, isPrivate, password);
    
    if (result.error) {
        return res.status(400).json({ message: result.error });
    }
    
    res.status(201).json(result);
});

// Verify room password
app.post("/verify-room-password", (req, res) => {
    const { roomName, password } = req.body;
    
    if (!roomName || !password) {
        return res.status(400).json({ message: 'Room name and password are required' });
    }
    
    const isValid = verifyRoomPassword(roomName, password);
    
    if (isValid) {
        res.json({ valid: true });
    } else {
        res.status(401).json({ valid: false, message: 'Invalid password' });
    }
});

// connect to socket.io
io.on("connection", (socket) => {
    console.log("New web socket connection")

    socket.on('join', async ({username, room, password}, callback) => {
        const roomData = getRoom(room);
        
        if (roomData.error) {
            return callback('Room does not exist');
        }
        
        // Only verify password for private rooms when joining (not creating)
        if (roomData.isPrivate) {
            // Skip password verification if this is the room creator (they just created the room)
            const isRoomCreator = getAllRooms().find(r => r.roomName === room && r.password === password);
            
            if (!isRoomCreator) {
                const isValidPassword = verifyRoomPassword(room, password);
                if (!isValidPassword) {
                    return callback('Invalid room password');
                }
            }
        }
        
        const {error, user} = addUser({id: socket.id, username, room})
        
        if(error) {
            return callback(error)
        }

        socket.join(user.room)   

        // Increment user count
        if (!roomData.error) {
            incUserNum(user.room)
        }

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