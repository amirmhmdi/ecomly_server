const { Token } = require("../models/token");
const { User } = require("../models/user");

async function errorHandler(error, req, res, next) {
    if (error.name === "UnauthorizedError") {
        if (!error.message.includes("jwt expired")) {
            return res.status(error.status).json({ type: error.name, message: error.message });
        }

        try {
            const tokenHeader = req.headers("authorization");
            const accessToken = tokenHeader?.split(" ")[1];
            const token = await Token.findOne({ accessToken, refreshToken: { $exists: true } });

            if (!token) return res.status(401).json({ type: "Unauthorized", message: "Token does not exist" });

            const userDate = jwt.verify(token.refreshToken, process.env.REFRESH_TOKEN_SECRET);

            const user = await User.findbyid(userDate.id);
            if (!user) return res.status(404).json({ message: "User does not exist" });

            const newAccessToken = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
            const newRefreshToken = jwt.sign({}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "60d" });

            req.headers("authorization") = `Bearer ${newAccessToken}`;

            await token.updateOne({ _id: token._id }, { accessToken: newAccessToken }).exec();

            res.set("Authorization", `Bearer ${newAccessToken}`);

            return next();

        } catch (RefreshError) {
            return res.status(401).json({ type: "Unauthorized", message: RefreshError.message });
        }
    }
    return res.status(400).json({ type: error.name, message: error.message });
};

module.exports = errorHandler;