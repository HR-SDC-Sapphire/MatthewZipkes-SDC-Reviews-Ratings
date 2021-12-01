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
  const readStream = fs.createReadStream("./photos.csv")
    .pipe(csv.parse({ headers: true, skipRows: toSkip }))
    .on("error", (error) => console.error(error))
    .on("data", (row) => {
      let rowId = parseInt(row.id);
      let review_id = parseInt(row.review_id);
      console.log(row)
      if (!data[review_id]) {
        data[review_id] = [row];
      } else {
        data[review_id].push(row);
      }

      if (review_id === batchSize + 1) {
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
  const readStream = fs.createReadStream("./charact.csv")
    .pipe(csv.parse({ headers: true, skipRows: toSkip }))
    .on("error", (error) => console.error(error))
    .on("data", (row) => {
      let rowId = parseInt(row.id);
      let review_id = parseInt(row.review_id);
      let characteristic_id = parseInt(row.characteristic_id);
      let value = parseInt(row.value);
      console.log(data)
      if (!data[review_id]) {
        data[review_id] = [row];
      } else {
        data[review_id].push(row);
      }
      if (review_id === batchSize + 1) {
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
  const data = [];
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
      console.log(row);
      data.push(row);
      if (row.id === batchSize) {
        console.log(data)
        Review.insertMany(data)
        batchSize += 100;

        data = [];
        readPhotos(currentPhotosCounter)
        readStream.destroy();
      } else {
        console.log('done');
        readStream.destroy();
      }
    })
    .on("end", (rowCount) => console.log(rowCount));
}

module.exports = { readPhotos }