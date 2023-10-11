const express = require('express')
const router = express.Router()

const { register, login, logout, forgotPassword, resetPassword, getUserProfile } = require('../controllers/user')
const { authentication } = require('../middleware/auth')

router.post('/register', register)
router.post('/login', login)

router.get('/logout', logout)

router.post('/forgotpassword', forgotPassword)
router.patch('/resetpassword/:resetToken', resetPassword)

router.get('/profile', authentication, getUserProfile)

module.exports = router
