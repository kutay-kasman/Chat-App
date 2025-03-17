const socket = io()

// socket.on("message", (welcome) => {
//     console.log(welcome)
// }) 

// document.querySelector('#messageForm').addEventListener('submit', (e) => {
//     e.preventDefault()
    
//     const message = e.target.elements.message.value

//     socket.emit('sendMessage', message)
// })



//receive the event sending
// on is for event listener
socket.on("countUpdated", (count, userId) => {   // name should be matched exatcly with server sending socket.emit
    userId++
    // console.log("The count is ", count, userId)

    // const numberShow = document.getElementById('number')
    // numberShow.innerHTML = count
})    

const incrementButton = document.querySelector("#increment")
// incrementButton.addEventListener('click', () => {
//     console.log("Clicked")
//     socket.emit('increment')
// })




const button = document.getElementById('setText')
const textarea = document.getElementById('mes')
button.addEventListener('click', () => {
    const userText = textarea.value
    console.log('Message was read')
    socket.emit("sendText", userText)
})


socket.on("showMessage", (userText, userID) => {
    const message = document.getElementById('message')
    const newMessageDiv = document.createElement("div")
    
    newMessageDiv.innerText = userText
    message.appendChild(newMessageDiv)

    if(userID % 2) {
        newMessageDiv.style.backgroundColor = "cyan"
    }
    else {
        newMessageDiv.style.backgroundColor = "red"
    }

})