const express = require('express')
const mongoose = require('mongoose')
const Users = require('../models/users.js')

const router = express.Router()

router.get('/me', (req, res) => {
    Users.findById(req.user_id)
        .then(user => res.status(200).json({
            id: user._id.toString(),
            username: user.username,
            profileImage: user.profileImage
        }), error => res.status(400).json({error}))
})

router.get('/', (req, res) => {
    Users.find({
        _id: { $ne: mongoose.Types.ObjectId(req.user_id) }
    }, (error, data) => {
        if(error) {
            res.status(500).json({error})
        } else {
            const allUsers = data.map(user => ({
                id: user._id.toString(),
                username: user.username,
                profileImage: user.profileImage
            }))
            res.status(200).json(allUsers)
        }
    })
})

router.get('/search', (req, res) => {
    const username = req.query?.username
    if(!username) {
        return res.status(400).json({ error: "Data not formatted properly" })
    }
    Users.find({ 
        id: { $ne: mongoose.Types.ObjectId(req.user_id) },
       username: username
    }, (error, data) => {
        if(error) {
            res.status(500).json({error})
        } else {
            const allUsers = data.map(user => ({
                id: user._id.toString(),
                username: user.username
            }))
            res.status(200).json({users: allUsers})
        }
    })
})

module.exports = router