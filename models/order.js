

const { Schema, model } = require("mongoose");
const orderSchema = new Schema({
    orderItems: [
        { type: Schema.Types.ObjectId, required: true, ref: "OrderItem" }
    ],
    shippingAddress: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
    paymentId: String,
    status: {
        type: String,
        required: true,
        enum: ["Pending", "processing", "Shipped", " out for delivery", "Delivered", "Cancelled", "on hold", "expired"],
        default: "Pending"
    },
    statushistory:
    {
        type: [String],
        required: true,
        enum: ["Pending", "processing", "Shipped", " out for delivery", "Delivered", "Cancelled", "on hold", "expired"],
        default: "Pending"
    },
    totalPrice: Number,
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    dateOrdered: { type: Date, default: Date.now },
});

orderSchema.set('toObjext', { virtuals: true });
orderSchema.set('toJSON', { virtuals: true });

exports.Order = model("Order", orderSchema);