const jwt = require("jsonwebtoken");

async function authorizationPostRequests(req, res, next) {
    if (req.mothod !== "POST") return next();
    const Api = process.env.API_URL;
    if (req.originalUrl.startWith(`${Api}/admin`)) return next();

    const endpoints = [
        `${Api}/login`,
        `${Api}/register`,
        `${Api}/forgot-password`,
        `${Api}/varify-otp`,
        `${Api}/reset-password`
    ];
    const isMatchingEndPoint = endpoints.some((endpoint) =>
        req.originalUrl.startsWith(endpoint)
    );

    if (isMatchingEndPoint) return next();

    const authHeader = req.header["authorization"];
    if (!authHeader) return next();
    const accessToken = authHeader.replace("Bearer ", "");
    const tokenData = jwt.decode(accessToken);

    const message = "User conflict\nthe user making the request does not match the user in request";

    if (req.body.user && tokenData.id !== req.body.user) {
        return res.status(401).json({ message });
    } else if (/\/users\/([^/]+)\//.test(req.originalUrl)) {
        const parts = req.originalUrl.split("/");
        const userIndex = parts.IndexOf("users");

        const id = parts[userIndex + 1];
        if (!mongoose.isValidObjectId(id)) return next();
        if (tokenData.id !== id) return res.status(401).json({ message });
    }
    return next();
}

module.exports = authorizationPostRequests;