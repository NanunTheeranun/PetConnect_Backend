const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const petSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
      min: 9,
      max: 9,
      required: true,
    },
    pin: {
      type: String,
      trim: true,
      min: 9,
      max: 9,
      required: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    breed: {
      type: String,
    },
    age: {
      type: Number,
    },
    blood: {
      type: String,
    },
    weight: {
      type: Number,
    },
    photo: {
      data: Buffer,
      contentType: String,
    },
    categories: [{type: ObjectId, ref: 'Category', required: true}],
    postedBy: {
      type: ObjectId,
      ref: 'User',
    },
    role: {
      type: Number,
      default: 0,
    },
    lost: {
      type: String,
      default: 'Live with me',
    },
    gender: {
      type: String,
    },
  },
  {timestamps: true},
);

module.exports = mongoose.model('Pet', petSchema);
