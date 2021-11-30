const express = require('express')
const mongoose = require('mongoose')
const app = express()
const Review = require('../schema/reviews.js')

mongoose.connect('mongodb://127.0.0.1:27017/reviews')
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to DB!'))

app.listen(3000, () => console.log('Listening on port 3000'))
