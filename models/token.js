const { Schema, model } = require("mongoose");

const tokenSchema = Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        refreshToken: {
            type: String,
            required: true,
        },
        accessToken: String,
        createdAt: {
            type: Date,
            required: true,
            default: Date.now,
            expires: 60 * 60 * 24,
        },
    }
);

exports.Token = model("Token", tokenSchema);