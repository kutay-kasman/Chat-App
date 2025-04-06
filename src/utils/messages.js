const Message = require('../models/message'); // Import the Message model

const generateMessage = async (username, text, roomId) => {
    // Create a new message using the Message model
    const newMes = new Message({ name: username, text, room: roomId});

    try {
        // Save the message to the database
        await newMes.save();
        console.log('Message saved:', newMes);

        // Return the saved message or any other information you need
        return {
            username,
            text,
            createdAt: new Date().getTime(),
            roomId
        };
    } catch (error) {
        console.error('Error saving message:', error);
        throw error;
    }
};

const generateSystemMessage = (text, type = "") => {
    return {
        text,
        createdAt: new Date().getTime(),
        type
    };
};

const generateLocationMessages = (username, loc) => {
    return {
        username, 
        url: loc,
        createdAt: new Date().getTime()
    };
};

module.exports = {
    generateMessage,
    generateSystemMessage,
    generateLocationMessages
};
