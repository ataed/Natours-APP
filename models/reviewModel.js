const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a tour'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },

  {
    toJSON: { validate: true },
    toObject: { validate: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  // this.populate({ path: 'tour', select: 'name' }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });
  this.populate({ path: 'user', select: 'name photo' });
  next();
});

reviewSchema.statics.calculAverageRating = async function (tourId) {
  //this points to the Model (in statics methods)
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 0,
      ratingsQuantity: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  //this points to current review
  //this.constructor points to the current Model
  this.constructor.calculAverageRating(this.tour);
});

//findByIdAndUpdate & findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.rev = await this.findOne();
  console.log(this.rev);
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  //this.findOne() do NOT work here, beacause query has already executed
  await this.rev.constructor.calculAverageRating(this.rev.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
