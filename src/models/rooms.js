const mongoose = require ('mongoose')

const roomSchema = mongoose.Schema({
    roomName: {
        type: String,
        required: true,
        trim: true
    }
})

roomSchema.virtual('messages', {
    ref: 'Message',
    localField: '_id',
    foreignField: 'room'
})


const Room = mongoose.model('Room', roomSchema)

module.exports = Room