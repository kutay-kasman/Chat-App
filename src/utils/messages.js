const generateMessage = (text) => {
    return {
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessages = (loc) => {
    return {
        url: loc,
        createdAt: new Date().getTime() 
    }
}


module.exports = {
    generateMessage, generateLocationMessages
}