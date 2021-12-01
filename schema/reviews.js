const mongoose = require("mongoose");

// const { awaitReviews } = require("../review-parse.js");

//Schema for products to show on mongosh
const reviewSchema = new mongoose.Schema({
  id: {type: Number, index: true},
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
  ]
});

const Review = mongoose.model("Reviews", reviewSchema, "reviews");

module.exports = { Review };