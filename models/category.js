

const { Schema, model } = require("mongoose");
const categorySchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        colour: { type: String, default: "#000000" },
        image: { type: String, required: true },
        markedfordeletion: { type: Boolean, default: false },
    }
);

exports.Category = model("Category", categorySchema); 