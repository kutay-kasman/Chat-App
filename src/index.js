require('./db/mongoose.js')
const Message = require('./models/message.js')
const Room = require('./models/rooms.js')
const path = require("path")
const http = require("http")
const express = require("express")
const socketio = require("socket.io")
const Filter = require("bad-words")
const {generateMessage, generateSystemMessage, generateLocationMessages} = require("./utils/messages.js")
const {addUser, removeUser, getUser, getUsersInRoom} = require("../src/utils/users.js")
const {addRoom, removeRoom, getRoom, getAllRooms, incUserNum, decreaseUserNum, verifyRoomPassword} = require("../src/utils/rooms.js")

// const testMessage = new Message({ name: "Kutay", text : "room1" })

// testMessage.save()
//   .then(() => {
//     console.log("Message saved and database created!")
//   })
//   .catch((err) => {
//     console.error("Error saving message:", err)
//   })

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
app.post("/create-room", async (req, res) => {
    const { roomName, isPrivate, password } = req.body;
    
    if (!roomName) {
        return res.status(400).json({ message: 'Room name is required' });
    }
    
    if (isPrivate && !password) {
        return res.status(400).json({ message: 'Password is required for private rooms' });
    }
    
    const trimmedRoomName = roomName.trim();
    if (trimmedRoomName.length === 0) {
        return res.status(400).json({ message: 'Room name cannot be empty' });
    }
    
    try {
        // First, check if room already exists in MongoDB
        let dbRoom = await Room.findOne({ roomName: trimmedRoomName });
        
        if (!dbRoom) {
            // Create room in MongoDB first
            dbRoom = new Room({
                roomName: trimmedRoomName,
                isPrivate: isPrivate || false
            });
            await dbRoom.save();
        }
        
        // Only after DB operation succeeds, add to in-memory storage
        const result = addRoom(trimmedRoomName, isPrivate, password);
        
        if (result.error) {
            return res.status(400).json({ message: result.error });
        }
        
        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ message: 'Error creating room' });
    }
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

    // In src/index.js, update the 'join' event handler
socket.on('join', async ({username, room, password}, callback) => {
    try {
        // Add retry logic for getting room
        let retries = 3;
        let roomData;
        
        while (retries > 0) {
            roomData = getRoom(room);
            
            if (!roomData.error) {
                break;
            }
            
            // If room doesn't exist, wait briefly and retry
            await new Promise(resolve => setTimeout(resolve, 100));
            retries--;
        }
        
        // If still no room after retries, check MongoDB
        if (roomData.error) {
            const dbRoom = await Room.findOne({ roomName: room });
            
            if (dbRoom) {
                // Room exists in DB but not in memory, recreate it
                roomData = addRoom(room, dbRoom.isPrivate, password);
            } else {
                return callback('Room does not exist');
            }
        }
        
        // Rest of your existing join logic
        if (roomData.isPrivate) {
            const isRoomCreator = getAllRooms().find(r => r.roomName === room && r.password === password);
            
            if (!isRoomCreator) {
                const isValidPassword = verifyRoomPassword(room, password);
                if (!isValidPassword) {
                    return callback('Invalid room password');
                }
            }
        }
        
        const {error, user} = addUser({id: socket.id, username, room});
        
        if(error) {
            return callback(error);
        }

        socket.join(user.room);

        // Find or create room in database
        let dbRoom = await Room.findOne({ roomName: room });
        if (!dbRoom) {
            dbRoom = new Room({
                roomName: room,
                userName: username
            });
            await dbRoom.save();
        }

        // Fetch message history
        const messageHistory = await Message.getMessagesByRoom(dbRoom._id);
        
        socket.emit('messageHistory', messageHistory.map(msg => ({
            username: msg.name,
            text: msg.text,
            createdAt: msg.createdAt
        })));

        if (!roomData.error) {
            incUserNum(user.room);
        }

        socket.emit("sys-message", generateSystemMessage('Welcome!')); 
        socket.broadcast.to(room).emit("sys-message", generateSystemMessage(`${user.username} has joined`, "join"));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        callback();
    } catch (error) {
        console.error('Error joining room:', error);
        callback(error.message);
    }
});

    socket.on('sendMessage', async (message, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter();
    
        // Check if the message contains profanity
        if (filter.isProfane(message)) {
            return callback('The profanity is not allowed');
        }
    
        try {
            // Find the room by roomName
            let room = await Room.findOne({roomName: user.room});
    
            // If the room doesn't exist, create a new room
            if (!room) {
                console.log(`Room ${user.room} not found. Creating a new room...`);
                room = new Room({
                    roomName: user.room,
                    userName: user.username // assuming the user is the first to join
                });
    
                // Save the new room to the database
                await room.save();
                console.log('Room created:', room);
            }
    
            // Now that the room exists, create and save the message
            const generatedMessage = await generateMessage(user.username, message, room._id);
            
            // Emit the message to the appropriate room
            io.to(user.room).emit("message", generatedMessage);
            callback();
        } catch (err) {
            console.error('Error sending message:', err);
            callback('Message failed to send');
        }
    });
    
    
    


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