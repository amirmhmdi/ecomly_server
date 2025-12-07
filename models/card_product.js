const { Schema, model } = require('mongoose');

const cardProductSchema = new Schema({
    product: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
    quantity: { type: Number, default: 1 },
    selectedSize: String,
    selectedColour: String,
    productName: { type: String, required: true },
    productImage: { type: String, required: true },
    productPrice: { type: Number, required: true },
    reservationExpiry: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 60 * 1000),
    },
    reserved: { type: Boolean, default: true },
});

cardProductSchema.set('toObject', { virtuals: true });
cardProductSchema.set('toJSON', { virtuals: true });

exports.CardProduct = model('CardProduct', cardProductSchema);