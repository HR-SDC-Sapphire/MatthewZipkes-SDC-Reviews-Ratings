const fs = require('fs');
const csv = require('@fast-csv/parse');

function readPhotos () {
  return new Promise((resolve, reject) => {
    const data = {};
    fs.createReadStream("./reviews_photos.csv")
      .pipe(csv.parse({ headers: true }))
      .on("error", (error) => console.error(error))
      .on("data", (row) => {
        row.id = parseInt(row.id);
        row.review_id = parseInt(row.review_id);
        console.log(row);
        if (!data[row.review_id]) {
          data[row.review_id] = [row];
        } else {
          data[row.review_id].push(row);
        }
      })
      .on("end", (rowCount) => resolve(data));
  });
}

function readCharacteristics () {
  return new Promise((resolve, reject) => {
    const data = {};
    fs.createReadStream("./characteristic_reviews.csv")
      .pipe(csv.parse({ headers: true }))
      .on("error", (error) => console.error(error))
      .on("data", (row) => {
        row.id = parseInt(row.id);
        row.review_id = parseInt(row.review_id);
        row.characteristic_id = parseInt(row.characteristic_id);
        row.value = parseInt(row.value);
        console.log(row)
        if (!data[row.review_id]) {
          data[row.review_id] = [row];
        } else {
          data[row.review_id].push(row);
        }
      })
      .on("end", (rowCount) => resolve(data));
  });
}

function readReviews (photos, characteristics) {
  return new Promise((resolve, reject) => {
    var data = [];
    fs.createReadStream("./reviews.csv")
      .pipe(csv.parse({ headers: true }))
      .on("error", (error) => console.error(error))
      .on("data", (row) => {
        row.id = parseInt(row.id);
        row.product_id = parseInt(row.product_id);
        row.rating = parseInt(row.rating);
        row.helpfulness = parseInt(row.helpfulness);
        row.photos = photos[row.id];
        row.characteristics = characteristics[row.id];
        console.log(row);
        data.push(row);
      })
      .on("end", (rowCount) => resolve(data));
  });
}

async function awaitReviews () {
  console.log('start')
  let photos = await readPhotos();
  let characteristics = await readCharacteristics();
  let reviews = await readReviews(photos, characteristics);
  console.log(reviews)
  console.log('done')
  return reviews;
}

awaitReviews()

module.exports = { awaitReviews };