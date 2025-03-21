const path = require("path")
const http = require("http")
const express = require("express")
const socketio = require("socket.io")
const Filter = require("bad-words")


const app = express()
const server = http.createServer(app)
const io = socketio(server) // now web server supports web sockets

const port = process.env.PORT || 3000

const publicDirPath = path.join(__dirname, "../public")

app.use(express.static(publicDirPath))
 
// // let count = 0
// // let userID = 0
// io.on("connection", (socket) => {  
//     // console.log("New web socket connection")
//     // userID++
//     // socket.emit("countUpdated", count, userID);
    

//     // socket.on('increment', () => {
//     //     count++
//     //     io.emit('countUpdated', count, userID)
//     // })

//     socket.on('sendText', (userText) => {
//         io.emit("showMessage", userText, userID)
//         // console.log(userText)
//     })
// })

io.on("connection", (socket) => {
    console.log("New web socket connection")

    socket.emit("message", 'Welcome!!')
    //socket.broadcast.emit("message", `${socket.id} joined`)


    socket.on('sendMessage', (message ,callback) => {
        
        const filter = new Filter()
        if(filter.isProfane(message)) {
            return callback('The profanity is not allowed')
        }
        io.emit("message", message)
        callback()
    
    })

    socket.on('sendLocation', (location, callback) => {
        const locationURL = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
        io.emit('locationMessage', locationURL)
        callback()
    })


    socket.on("disconnect", ()=> {
        socket.broadcast.emit("message", `${socket.id} has left`)
    })
})

server.listen(port, () => {
    console.log("Server is up on " + port)
})
