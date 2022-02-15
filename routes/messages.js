const express = require('express')
const Messages = require('../models/messages')

const router = express.Router()

router.get('/', (req, res) => {
    Messages.find((error, data) => {
        if(error) {
            res.status(500).json({error})
        } else {
            data.map(message => ({
                message: message.message,
                timestamp: message.timestamp,
                sender: message.sender,
                receiver: message.receiver
            }))
            res.status(200).json(data)
        }
    })
})

router.post('/add', (req, res) => {
    const body = req.body
    if(!(body.message && body.timestamp && req.user_id && body.receiver)) {
        return res.status(400).json({ error: "Data not formatted properly" })
    }

    const message = {...body, sender: req.user_id}
    Messages.create(message, (error, data) => {
        if(error) {
            res.status(500).json({error})
        } else {
            res.status(201).json({
                message: data.message, 
                timestamp: data.timestamp,
                sender: data.sender,
                receiver: data.receiver
            })
        }
    })
})

module.exports = router