

const { Schema, model } = require("mongoose");

const orderItemSchema = new Schema({
    product : { type: Schema.Types.ObjectId, required: true, ref: "Product" },
    productName : { type: String, required: true },  
    productImage : { type: String, required: true },
    productPrice : { type: Number, required: true },
    quantity : { type: Number, default: 1 },
    selectedSize : String,
    selectedColour : String
});

exports.OrderItem = model("OrderItem", orderItemSchema);