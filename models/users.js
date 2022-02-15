const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    email: String,
    username: String,
    password: String,
    profileImage: String
})

module.exports = mongoose.model('users', userSchema)