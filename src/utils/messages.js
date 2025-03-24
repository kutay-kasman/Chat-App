const generateMessage = (text) => {
    return {
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessages = (username, loc) => {
    return {
        username, 
        url: loc,
        createdAt: new Date().getTime() 
    }
}


module.exports = {
    generateMessage, generateLocationMessages
}