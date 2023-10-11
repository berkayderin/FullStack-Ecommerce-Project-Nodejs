const express = require('express')
const app = express()

const cors = require('cors')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv')
const db = require('./config/db')
const cloudinary = require('cloudinary').v2

dotenv.config()

cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.API_KEY,
	api_secret: process.env.API_SECRET
})

app.use(cors())
app.use(bodyParser.json({ limit: '30mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))
app.use(cookieParser())

const productRoutes = require('./routes/product')
app.use('/', productRoutes)

const userRoutes = require('./routes/user')
app.use('/', userRoutes)

db()

const PORT = process.env.PORT || 4000

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
