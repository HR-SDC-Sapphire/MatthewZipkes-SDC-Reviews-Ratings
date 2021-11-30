const mongoose = require("mongoose");
const { awaitReviews } = require("../review-parse.js");

//Schema for products to show on mongosh
const reviewSchema = new mongoose.Schema({
  id: Number,
  product_id: Number,
  rating: Number,
  date: Date,
  summary: String,
  body: String,
  recommend: Boolean,
  reported: Boolean,
  reviewer_name: String,
  reviewer_name: String,
  response: String,
  helpfulness: Number,
  photos: [
    {
      id: Number,
      review_id: Number,
      url: String
    },
  ],
  characteristics: [
    {
      id: Number,
      characteristic_id: Number,
      review_id: Number,
      value: Number
    }
  ],
});

const Review = mongoose.model("reviews", reviewSchema);

async function addReviewCollection() {
  awaitReviews().then(async (reviews) => {
    let toInsert = [];
    const lastItem = reviews.length - 1;
    for (let i = 0; i < reviews.length; i++) {
      toInsert.push(reviews[i]);
      if (i % 1000 === 0) {
        await Review.insertMany(toInsert);
        toInsert = [];
        console.log("There goes another 1000");
      } else if (i === lastItem) {
        await Review.insertMany(toInsert);
        console.log("Done");
      }
    }
  });
}

addReviewCollection()
