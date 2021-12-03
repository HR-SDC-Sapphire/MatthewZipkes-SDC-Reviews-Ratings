const express = require('express')
const mongoose = require('mongoose')
const app = express()
const { readPhotos } = require('../review-parse');
const { Review } = require('../schema/reviews');
const { readCharacteristics } = require('../characteristics-parser')

mongoose.connect('mongodb://127.0.0.1:27017/reviews')
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to DB!'))

app.get('/reviews/', (req, res) => {
  console.log(req.params)

  // let productID = req.query.product_id;
  // let pageCount = req.query.page ? req.query.page : 1
  // let countOfReviews = req.query.count ? req.query.count : 5
  // let sort = req.query.sort ? req.query.sort : 'relevant'

// //   var number = Review.count({}, function(err, count) {
// //     console.log(count); // this will print the count to console
// // });

// console.log(number); // This will NOT print the count to console
  Review.find({product_id: 1})
  .then(result => {
    res.status(200).send(result)
  })
  .catch(err => {
    res.status(400)
    res.send(err)
  })
})



app.listen(3000, () => console.log('Listening on port 3000'))
