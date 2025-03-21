const socket = io()

// elements
const messageForm = document.getElementById('messageForm')
const messageInput = document.getElementById('message')
const submitButton = document.getElementById('submit-button')
const sendLocationButton = document.getElementById('send-location')
const mesContainer = document.getElementById('message-container')

//templates
const mesTemplate = document.getElementById('message-template').innerHTML
const locationTemplate = document.getElementById('location-template').innerHTML

socket.on('locationMessage', (locationURL) => {
    console.log(locationURL)

    const html = Mustache.render(locationTemplate, {
        locationURL
    })
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html

    mesContainer.insertAdjacentElement('beforeend', tempDiv.firstElementChild)
})


socket.on("message", (message) => {
    console.log(message)

    const html = Mustache.render(mesTemplate , {
        mes: message
    })
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    mesContainer.insertAdjacentElement('beforeend', tempDiv.firstElementChild)
}) 

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






























//receive the event sending
// on is for event listener
// socket.on("countUpdated", (count, userId) => {   // name should be matched exatcly with server sending socket.emit
//     userId++
    // console.log("The count is ", count, userId)

    // const numberShow = document.getElementById('number')
    // numberShow.innerHTML = count
// })    

// const incrementButton = document.querySelector("#increment")
// incrementButton.addEventListener('click', () => {
//     console.log("Clicked")
//     socket.emit('increment')
// })




// const button = document.getElementById('setText')
// const textarea = document.getElementById('mes')
// button.addEventListener('click', () => {
//     const userText = textarea.value
//     console.log('Message was read')
//     socket.emit("sendText", userText)
//     document.getElementById('mes').value = ""
// })


// socket.on("showMessage", (userText, userID) => {
//     const message = document.getElementById('message')
//     const newMessageDiv = document.createElement("div")
    
//     newMessageDiv.innerText = userText
//     message.appendChild(newMessageDiv)

//     if(userID % 2) {
//         newMessageDiv.style.backgroundColor = "cyan"
//     }
//     else {
//         newMessageDiv.style.backgroundColor = "red"
//     }

// })