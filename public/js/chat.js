const socket = io()

// elements
const messageForm = document.getElementById('messageForm')
const messageInput = document.getElementById('message')
const submitButton = document.getElementById('submit-button')
const sendLocationButton = document.getElementById('send-location')
const mesContainer = document.getElementById('message-container')

//templates
const mesTemplate = document.getElementById('message-template').innerHTML
const sysMesTemplate = document.getElementById('sys-message-template').innerHTML
const locationTemplate = document.getElementById('location-template').innerHTML
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML


// options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true}) 

const autoscroll = () => {
    // new message element
    const newMessage = mesContainer.lastElementChild
    
    // height of new message
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    // visible height
    const visibleHeight = mesContainer.offsetHeight

    // height of messages container
    const containerHeight = mesContainer.scrollHeight

    // how far have I scrolled
    const scrollOffset = mesContainer.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        mesContainer.scrollTop = mesContainer.scrollHeight
    }
}

// send message and create an div element
socket.on("message", (message) => {
    console.log(message)

    const html = Mustache.render(mesTemplate , {
        username: message.username, 
        text: message.text,
        createdAt: moment(message.createdAt).format('HH:mm'),
    })
    
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html

    mesContainer.insertAdjacentElement('beforeend', tempDiv.firstElementChild)
    autoscroll()
}) 

// send message and create an div element
socket.on("sys-message", (message) => {
    console.log(message)

    const html = Mustache.render(sysMesTemplate , {
        text: message.text,
        createdAt: moment(message.createdAt).format('HH:mm'),
        type: message.type || ""
    })
    
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html

    if (message.type === "join") {
        tempDiv.firstElementChild.classList.add("join-message");
    }
    if(message.type === "exit") {
        tempDiv.firstElementChild.classList.add('exit-message')
    }
    
    mesContainer.insertAdjacentElement('beforeend', tempDiv.firstElementChild)
}) 

// send location with link
socket.on('locationMessage', (message) => {
    console.log(message)

    const html = Mustache.render(locationTemplate, {
        username: message.username, 
        url: message.url,
        createdAt: moment(message.createdAt).format('HH:mm')
    })
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html

    mesContainer.insertAdjacentElement('beforeend', tempDiv.firstElementChild)
})

// send userList to the chat sidebar
socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    sidebar.innerHTML = html

})

// Listen for the 'updateRoomList' event to update the room list on the home page
socket.on('updateRoomList', (rooms) => {
    const roomsList = document.getElementById("rooms-list-ul");

    roomsList.innerHTML = rooms.length
        ? rooms.map(room => `<li> ${room.roomName} - ${room.userNum}</li>`).join('')
        : "<li>No active rooms</li>";
});


// EVENT LISTENERS

// send message event listener
messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    submitButton.setAttribute('disabled', 'disabled')    // disable sendLocation button while its sending

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (err) => {

        submitButton.removeAttribute('disabled')
        messageInput.value = ""
        messageInput.focus()
        
        if(err) {
            return console.log(err)
        }

        console.log('Message is delivered')
    })
})

// send location event listener
sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported with your browser')
    }
    sendLocationButton.setAttribute('disabled', '') // disable sending location before its done. No value need for disabled

    navigator.geolocation.getCurrentPosition((position) => {
        sendLocationButton.removeAttribute('disabled')

        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (err) => {
            if(err) {
                return console.log(err)
            }
            console.log('Location is delivered')
        })
    })
})

const exitRoom = document.getElementById('exit-room')

exitRoom.addEventListener('click', () => {
    window.location.replace('./index.html')
})



socket.emit('join', {username, room}, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})