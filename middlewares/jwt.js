const { expressjwt: expjwt } = require('express-jwt');
const { Token } = require('../models/token');

function authJwt() {
    const apiVersion = process.env.API_URL;
    return expjwt({
        secret: process.env.ACCESS_TOKEN_SECRET,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }
    ).unless({
        path: [
            { url: `${apiVersion}/login`, methods: ['POST'] },
            { url: `${apiVersion}/register`, methods: ['POST'] },
            { url: `${apiVersion}/forgot-password`, methods: ['POST'] },
            { url: `${apiVersion}/varify-otp`, methods: ['POST'] },
            { url: `${apiVersion}/reset-password`, methods: ['POST'] }
        ]
    });
}


function isRevoked(req, jwt) {
    const authHeader = req.headers("authorization");

    if (!authHeader.startsWith('Bearer ')) {
        return true;
    }

    const accessToken = authHeader.replace('Bearer ', '').trim();
    const token = Token.findOne({ accessToken });

    const adminRouteRegex = /^\/api\/v1\/admin\//i;
    const adminFault = !jwt.payload.isAdmin && adminRouteRegex.test(req.originalUrl);

    return adminFault || !token;
}

module.exports = authJwt;