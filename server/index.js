const express = require('express')
const mongoose = require('mongoose')
const app = express()
const { readPhotos } = require('../review-parse');
const { Review } = require('../schema/reviews');
const { Characteristics } = require('../schema/characteristics');
const { readCharacteristics } = require('../characteristics-parser');

app.use(express.json())

mongoose.connect('mongodb://127.0.0.1:27017/reviews')
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to DB!'))

app.get('/reviews/', (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let count= parseInt(req.query.count) || 5;
  let sort = req.query.sort || 'relevant';
  let productId = req.query.product_id;

    Review.find({product_id: productId}).sort([['id', 'ascending']])
    .then(result => {
      if ( page * count >= result.length) {
        console.log(result.slice(page * count - count, result.length))
        res.status(200).send(result.slice(page * count - count, result.length))
      } else {
        console.log(result.slice(page * count - count, page * count))
        res.status(200).send(result.slice(page * count - count, page * count))
      }
    })
    .catch(err => {
      res.status(400)
      res.send(err)
    })
})
app.post('/reviews', (req, res) => {
  console.log(req.body)
      res.status(200).send()
})

app.get('/reviews/meta', (req, res) => {
  let productId = req.query.product_id;

  Review.find({product_id: productId})
  .then(result => {
    Characteristics.find({product_id: productId})
    .then(characteristicsResult => {
      let metaObject = {
        product_id: parseInt(productId),
        rating: {
          1: result.filter(item => item.rating === 1).length,
          2: result.filter(item => item.rating === 2).length,
          3: result.filter(item => item.rating === 3).length,
          4: result.filter(item => item.rating === 4).length,
          5: result.filter(item => item.rating === 5).length
        },
        recommended: {
          0: result.filter(item => item.recommend === true || 1).length
        },
        characteristics: {

        }
      }
      characteristicsResult.forEach( characteristic => {
        metaObject.characteristics[characteristic.name] = {id : characteristic.id, value: 0};
      })
      console.log(metaObject)
    })
  })
})

app.get('/characteristics', (req, res) => {
  let productId = req.query.product_id;
  Characteristics.find({product_id: productId})
  .then(response => {
    res.status(200).send(response)
  })
  .catch(err => {
    res.status(400).send(err)
  })
})



app.listen(3000, () => console.log('Listening on port 3000'))
