const { Schema, model } = require("mongoose");

const reviewSchema = new Schema({
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    userName: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

reviewSchema.set('toObject', { virtuals: true });
reviewSchema.set('toJSON', { virtuals: true });

exports.Review = model("Review", reviewSchema);