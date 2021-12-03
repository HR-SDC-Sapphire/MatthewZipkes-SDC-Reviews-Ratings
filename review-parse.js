const fs = require('fs');
const csv = require('@fast-csv/parse');
const { Review } = require("./schema/reviews");

let batchSize = 100;
let currentPhotosCounter = 0;
let currentCharacteristicsCounter = 0;
let currentReviewsCounter = 0;

function readPhotos (toSkip) {
  toSkip = toSkip ? toSkip : 0
  let data = {};
  const readStream = fs.createReadStream("./reviews_photos.csv")
    .pipe(csv.parse({ headers: true, skipRows: toSkip }))
    .on("error", (error) => console.error(error))
    .on("data", (row) => {
      let rowId = parseInt(row.id);
      let review_id = parseInt(row.review_id);
      if (!data[review_id]) {
        data[review_id] = [row];
      } else {
        data[review_id].push(row);
      }
      if (review_id  > batchSize) {
        currentPhotosCounter = rowId;
        readCharacteristics(data, currentCharacteristicsCounter)
        data = {};
        readStream.destroy()
      }
    })
    .on("end", () => {
      console.log('done');
    });
}

function readCharacteristics (photosData, toSkip) {
  toSkip = toSkip ? toSkip : 0
  let data = {};
  const readStream = fs.createReadStream("./characteristic_reviews.csv")
    .pipe(csv.parse({ headers: true, skipRows: toSkip }))
    .on("error", (error) => console.error(error))
    .on("data", (row) => {
      let rowId = parseInt(row.id);
      let review_id = parseInt(row.review_id);
      let characteristic_id = parseInt(row.characteristic_id);
      let value = parseInt(row.value);
      if (!data[review_id]) {
        data[review_id] = [row];
      } else {
        data[review_id].push(row);
      }
      if (review_id > batchSize) {
        currentCharacteristicsCounter = rowId;
        readReviews(photosData, data, currentReviewsCounter)
        data = {};
        readStream.destroy()
      }
    })
    .on("end", () => {
      console.log('done');
    });
}

function readReviews (photosData, characteristicsData, toSkip) {
  toSkip = toSkip ? toSkip : 0
  let data = [];
  const readStream = fs.createReadStream("./reviews.csv")
    .pipe(csv.parse({ headers: true, skipRows: toSkip }))
    .on("error", (error) => console.error(error))
    .on("data", (row) => {
      row.id = parseInt(row.id);
      row.product_id = parseInt(row.product_id);
      row.rating = parseInt(row.rating);
      row.helpfulness = parseInt(row.helpfulness);
      row.photos = photosData[row.id];
      row.characteristics = characteristicsData[row.id];
      data.push(row);
      if (row.id === batchSize) {
        currentReviewsCounter = row.id
        console.log(data)
        Review.insertMany(data)
        .then(res => {
          batchSize += 100;
          data = [];
          readPhotos(currentPhotosCounter);
          readStream.destroy();
        })
        .catch(err => {
          console.log(err);
        });
      } else if (row.id === 5777922 || row.id > 5777922) {
        Review.insertMany(data)
        .then(res => {
        console.log('done');
        readStream.destroy();
        })
        .catch( err => {
          console.log(err)
        })
      }
    })
    .on("end", (rowCount) => console.log('this is the end', rowCount));
}

module.exports = { readPhotos }