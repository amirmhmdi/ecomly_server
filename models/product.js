const { Schema, model } = require("mongoose");

const productSchema = new Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    rating: { type: Number, default: 0.0 },
    colour: { type: String, default: "#000000" },
    image: { type: String, required: true },
    images: [{ type: String }],
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    numberOfReviews: { type: Number, default: 0 },
    Sizes: [{ type: String }],
    category: { type: Schema.Types.ObjectId, required: true, ref: "Category" },
    genderAgeCategory: { type: String, enum: ["men", "women", "unisex", "kids"] },
    countInStock: { type: Number, required: true, min: 0, max: 255 },
    dateAdded: { type: Date, default: Date.now },
});

productSchema.pre("save", async function (next) {
    if (this.reviews.length > 0) {
        await this.populate("reviews");

        const totalRating = this.reviews.reduce(
            (act, review) => act + review,
            0
        );

        this.rating = totalRating / this.reviews.length;
        this.reting = ParseFloat((totalRating / this.reviews.length).toFixed(1));
        this.numberOfReviews = this.reviews.length;
    }
    next();
});

productSchema.index({ name: "text", description: "text" });

productSchema.set('toObjext', { virtuals: true });
productSchema.set('toJSON', { virtuals: true });

exports.Product = model("Product", productSchema);