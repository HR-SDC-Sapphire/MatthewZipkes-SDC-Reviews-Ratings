const express = require('express')
const mongoose = require('mongoose')
const app = express()
const { readPhotos } = require('../review-parse');
const { Review } = require('../schema/reviews');
const { Characteristics } = require('../schema/characteristics');
const { readCharacteristics } = require('../characteristics-parser');

app.use(express.json())

mongoose.connect('mongodb://127.0.0.1:27017/RatingAndReviews')
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to DB!'))

app.get('/reviews/', (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let count= parseInt(req.query.count) || 5;
  let sort = req.query.sort || 'relevant';
  let productId = req.query.product_id;

  if (sort === 'newest') {
    Review.find({product_id: productId}).sort({date: -1})
      .then(result => {
        if ( page * count >= result.length) {
          res.status(200).send(result.slice(page * count - count, result.length))
        } else {
          res.status(200).send(result.slice(page * count - count, page * count))
        }
      })
      .catch(err => {
        res.status(400)
        res.send(err)
      })
  } else if (sort === 'helpfulness') {
    Review.find({product_id: productId}).sort([['helpfulness', 'descending']])
    .then(result => {
      if ( page * count >= result.length) {
        res.status(200).send(result.slice(page * count - count, result.length))
      } else {
        res.status(200).send(result.slice(page * count - count, page * count))
      }
    })
    .catch(err => {
      res.status(400)
      res.send(err)
    })
  } else {
    Review.find({product_id: productId}).sort([['id', 'ascending']])
    .then(result => {
      if ( page * count >= result.length) {
        res.status(200).send(result.slice(page * count - count, result.length))
      } else {
        res.status(200).send(result.slice(page * count - count, page * count))
      }
    })
    .catch(err => {
      res.status(400)
      res.send(err)
    })
  }
})

app.get('/reviews/meta', (req, res) => {
  let productId = req.query.product_id;
  let sizeArray = [];
  let widthArray = [];
  let comfortArray = [];
  let qualityArray = [];
  let lengthArray = [];
  let fitArray = [];

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

      result.forEach(review => {
        for (let key in metaObject.characteristics) {
          review.reviewCharacteristics.forEach(reviewCharacteristic => {
            if (key === 'Fit') {
              if (reviewCharacteristic.characteristic_id === metaObject.characteristics[key].id) {
                fitArray.push(reviewCharacteristic.value)
              }
            } else if (key === 'Length') {
              if (reviewCharacteristic.characteristic_id === metaObject.characteristics[key].id) {
                lengthArray.push(reviewCharacteristic.value)
              }
            } else if (key === 'Comfort') {
              if (reviewCharacteristic.characteristic_id === metaObject.characteristics[key].id) {
                comfortArray.push(reviewCharacteristic.value)
              }
            } else if (key === 'Quality') {
              if (reviewCharacteristic.characteristic_id === metaObject.characteristics[key].id) {
                qualityArray.push(reviewCharacteristic.value)
              }
            } else if (key === 'Width') {
              if (reviewCharacteristic.characteristic_id === metaObject.characteristics[key].id) {
                widthArray.push(reviewCharacteristic.value)
              }
            } else {
              if (reviewCharacteristic.characteristic_id === metaObject.characteristics[key].id) {
                sizeArray.push(reviewCharacteristic.value)
              }
            }
          })
        }
      })
      for (let key in metaObject.characteristics) {
        if (key === 'Fit') {
          metaObject.characteristics[key].value = fitArray.reduce((a, b) => a + b) / fitArray.length;
        } else if (key === 'Length') {
          metaObject.characteristics[key].value = lengthArray.reduce((a, b) => a + b) / lengthArray.length;
        } else if (key === 'Comfort') {
          metaObject.characteristics[key].value = comfortArray.reduce((a, b) => a + b) / comfortArray.length;
        } else if (key === 'Quality') {
          metaObject.characteristics[key].value = qualityArray.reduce((a, b) => a + b) / qualityArray.length;
        } else if (key === 'Width') {
          metaObject.characteristics[key].value = widthArray.reduce((a, b) => a + b) / widthArray.length;
        } else {
          metaObject.characteristics[key].value = sizeArray.reduce((a, b) => a + b) / sizeArray.length;
      }
      }
      res.status(200).send(metaObject)
    })
    .catch(err => {
      res.status(404).send(err)
    })
  })
})

app.post('/reviews', (req, res) => {
  Review.find().sort([['id', 'descending']]).limit(1)
  .then(latestDoc => {
    let id = latestDoc[0].id + 1
    const newReview = new Review({
      id: id,
      product_id: req.body.product_id,
      rating: parseInt(req.body.rating),
      date: new Date(),
      summary: req.body.summary,
      body: req.body.body,
      recommend: req.body.recommend,
      reported: false,
      reviewer_name: req.body.name,
      reviewer_email: req.body.email,
      response: '',
      helpfulness: 0,
      photos: [],
      reviewCharacteristics: []

    })
      req.body.photos.forEach(photo => {
        newReview.photos.push({review_id: id, url: photo})
      })

      for(let key in req.body.characteristics) {
        newReview.reviewCharacteristics.push({characteristic_id: key, review_id: id, value: req.body.characteristics[key]})
      }

      newReview.save()
      .then(()=> {
        res.status(201).send()
      })
      .catch(err => {
        res.status(400).send(err)
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

app.put('/reviews/:review_id/helpful', (req, res) => {
  Review.find({review_id: req.params.review_id})
  .then((result) =>{
    console.log(result)
    // res.status(200).send()
  })
  .catch(err => {
    // res.status(204).send(err)
  })
})



app.listen(3000, () => console.log('Listening on port 3000'))
