//imports
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const Pusher = require('pusher')
const cors = require('cors')
const jwtVerify = require('./middlewares/authentication')
const authRouter = require('./routes/auth')
const usersRouter = require('./routes/users')
const messagesRouter = require('./routes/messages')

//app config
const app = express()
const port = process.env.PORT || 9000 

mongoose.connect(process.env.DB_CONNECTION_URL)
const db = mongoose.connection

//init pusher
const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: "eu",
    useTLS: true
})

//middleware
app.use(express.static('public'))
app.use(express.json())
app.use(cors())

//api routes
app.get('/', (req, res) => res.status(200).send('Hello denis'))

app.use('/auth', authRouter)

app.use('/users', jwtVerify, usersRouter)

app.use('/messages', jwtVerify, messagesRouter)

//set listener to pusher
db.once('open', () => {
    console.log('DB connected')

    const messages = db.collection('messages')
    const changeStream = messages.watch()

    changeStream.on('change', (change) => {
        if(change.operationType === 'insert') {
            const message = change.fullDocument
            pusher.trigger('messages', 'inserted', {
                message: message.message,
                timestamp: message.timestamp,
                sender: message.sender,
                receiver: message.receiver
            })
        } else {
            console.log('Error triggering Pusher')
        }
    })
})

//listener
app.listen(port, () => console.log(`listening on localhost:${port}`))