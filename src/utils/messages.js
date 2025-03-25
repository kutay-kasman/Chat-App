const generateMessage = (username, text,) => {
    return {
        username,
        text,
        createdAt: new Date().getTime(),
    }
}

const generateSystemMessage = (text, type = "") => {
    return {
        text,
        createdAt: new Date().getTime(),
        type
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
    generateMessage, generateSystemMessage, generateLocationMessages 
}