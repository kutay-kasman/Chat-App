const mongoose = require ('mongoose')

const messageSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    text: {
        type: String,
        required: true
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }    
})

// Add method to get messages by room
messageSchema.statics.getMessagesByRoom = async function(roomId) {
    try {
        const messages = await this.find({ room: roomId })
            .sort({ createdAt: 1 }) // Sort by timestamp ascending
            .exec();
        return messages;
    } catch (error) {
        throw new Error('Error fetching messages');
    }
}

const Message = mongoose.model('Message', messageSchema)

module.exports = Message