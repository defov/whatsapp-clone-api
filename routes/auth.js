const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Users = require('../models/users.js')

const multer  = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './client/public/images')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, Date.now() + '-' + file.originalname)
    }
  })
  
const upload = multer({ storage: storage })

const router = express.Router()

router.post('/signup', upload.single('file'), function(req, res) {
    const body = req.file ? 
        { ...req.body, profileImage: `/images/${req.file.filename}` } : req.body 

        console.log(body);
    if (!(body.email && body.username && body.password && body.profileImage)) {
      return res.status(400).json({ error: "Data not formatted properly" });
    }

    Users.findOne({$or: [
        {email: body.email},
        {username: body.username}
    ]}).then(function(user) {
        if(user) {
            res.status(400).json({
                error: 'There is already an existing user with the given email and/or username',
            })
        } else {
            const salt = bcrypt.genSaltSync(Number.parseInt(process.env.SALT))
            const password = bcrypt.hashSync(body.password, salt)
            Users.create({...body, password}, (error, data) => {
                if(error) {
                    res.status(500).json({error})
                } else {
                    const token = jwt.sign({ id: data._id.toString() }, process.env.JWT_SECRET, {
                        expiresIn: 86400, // 24 hours
                    });
                    res.status(201).json({
                        token: token,
                        id: data._id,
                        username: data.username,
                        profileImage: data.profileImage
                    });
                }
            })
        }
    }).catch(error => res.status(500).json({error}))


})

router.post('/login', function(req, res) {
    const body = req.body

    if (!(body.username && body.password)) {
        return res.status(400).json({ error: "Data not formatted properly" });
    }

    Users.findOne({
        username: body.username
    }).then(user => {
        if(user) {
            // Validate password
            const validPassword = bcrypt.compareSync(body.password, user.password)
            if (validPassword) {
                const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, {
                    expiresIn: 86400, // 24 hours
                });
                res.status(200).json({
                    token: token,
                    id: user._id,
                    username: user.username,
                    profileImage: user.profileImage
                });
            } else {
                res.status(400).json({ error: "Invalid Password!" });
            }
        } else {
            res.status(400).json({
                error: 'User doesn\'t exist!'
            })
        }
    }).catch(error => res.status(500).json({error}))
})

// router.post('/logout', function(req, res) {
//     try {
//         res.status(200).send({
//           message: "You've been signed out!"
//         });
//     } catch (error) {
//         res.status(500).send(error)
//     }
// })

module.exports = router