const mongoose = require('mongoose')

const messageSchema = mongoose.Schema({
    message: String,
    timestamp: String,
    sender: String,
    receiver: String
})

module.exports = mongoose.model('messages', messageSchema)