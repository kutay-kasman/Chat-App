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
const {username, room, password} = Qs.parse(location.search, {ignoreQueryPrefix: true}) 

const autoscroll = (forceScroll = false) => {
    const newMessage = mesContainer.lastElementChild;
    
    if (!newMessage) return; // Guard clause if no messages exist
    
    // Calculate heights
    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;
    const visibleHeight = mesContainer.offsetHeight;
    const containerHeight = mesContainer.scrollHeight;
    const scrollOffset = mesContainer.scrollTop + visibleHeight;

    // Force scroll to bottom if specified or if user was already at bottom
    if (forceScroll || containerHeight - newMessageHeight <= scrollOffset) {
        mesContainer.scrollTop = mesContainer.scrollHeight;
    }
}

// send message and create an div element
socket.on("message", (message) => {
    console.log(message.text)
    
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

// Add this near the top of chat.js with other socket listeners
socket.on('messageHistory', (messages) => {
    // Clear existing messages
    mesContainer.innerHTML = '';
    
    // Render each message from history
    messages.forEach(message => {
        const html = Mustache.render(mesTemplate, {
            username: message.username,
            text: message.text,
            createdAt: moment(message.createdAt).format('HH:mm')
        });
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        mesContainer.insertAdjacentElement('beforeend', tempDiv.firstElementChild);
    });
    
    // Force scroll to bottom after loading history
    autoscroll(true);
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



socket.emit('join', {username, room, password}, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})

// Add this to your HTML
const scrollButton = document.createElement('button');
scrollButton.innerHTML = '⬇️';
scrollButton.className = 'scroll-bottom-btn';
scrollButton.style.display = 'none';
mesContainer.parentElement.appendChild(scrollButton);

// Add these styles to your CSS
const styles = `
.scroll-bottom-btn {
    position: fixed;
    bottom: 80px;
    right: 20px;
    padding: 10px;
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    cursor: pointer;
    display: none;
    z-index: 1000;
}

.scroll-bottom-btn:hover {
    background: rgba(0, 0, 0, 0.7);
}
`;

// Add scroll monitoring to show/hide the button
mesContainer.addEventListener('scroll', () => {
    const bottomThreshold = 300; // pixels from bottom
    const distanceFromBottom = 
        mesContainer.scrollHeight - 
        (mesContainer.scrollTop + mesContainer.clientHeight);
    
    scrollButton.style.display = 
        distanceFromBottom > bottomThreshold ? 'block' : 'none';
});

// Add click handler for the scroll button
scrollButton.addEventListener('click', () => {
    autoscroll(true);
});