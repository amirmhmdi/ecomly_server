const { validationResult } = require("express-validator");
const { User } = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Token } = require("../models/token");
const mailsender = require("../helper/email_sender");

exports.register = async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errormessages = errors.array().map((error) => ({ field: error.path, message: error.msg }));
        return res.status(400).json({ errors: errormessages });
    }
    try {
        let user = new User(
            {
                ...req.body,
                passwordHash: bcrypt.hashSync(req.body.password, 8),
            }
        );
        user = await user.save();
        if (!user) {
            return res.status(500).json({ errors: [{ type: "Inernal Server Error", message: "Could not create user" }] });
        }
        return res.status(201).json(user);
    } catch (error) {
        console.error(error);
        if (error.message.includes("email_1 dup key")) {
            return res.status(400).json({ errors: [{ type: "AuthError", message: "User with that email already exists." }] });
        }
        return res.status(500).json({ errors: [{ type: error.name, message: error.message }] });
    }
};

exports.login = async function (req, res) {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ errors: [{ type: "AuthError", message: "User not found\ncheck your email and try again" }] });
        }
        if (!bcrypt.compareSync(password, user.passwordHash)) {
            return res.status(400).json({ errors: [{ type: "AuthError", message: "Invalid password" }] });
        }

        const accessToken = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1d" }
        );
        const refreshToken = jwt.sign(
            {},
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "60d" }
        );

        const token = Token.findOne({ userId: user._id });
        if (token) token.deleteOne();
        await new Token({ userId: user._id, accessToken, refreshToken: refreshToken }).save();

        user.passwordHash = undefined;
        return res.status(200).json({ ...user._doc, accessToken });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ errors: [{ type: error.name, message: error.message }] });
    }
};

exports.varifyToken = async function (req, res) {
    try {
        let accessToken = req.headers.authorization;
        if (!accessToken) return res.json(false);
        accessToken = accessToken.replace("Bearer ", "").trim();

        const token = await Token.findOne({ accessToken });
        if (!token) return res.json(false);

        const tokenData = jwt.decode(token.refreshToken);

        const user = await User.findOnebyId(tokenData.id);
        if (!user) return res.json(false);

        const isValid = jwt.verify(token.refreshToken, process.env.REFRESH_TOKEN_SECRET);
        if (!isValid) return res.json(false);

        return res.json(true);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ errors: [{ type: error.name, message: error.message }] });
    }
};

exports.forgotPassword = async function (req, res) {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ errors: [{ type: "AuthError", message: "User not found\ncheck your email and try again" }] });
        }

        const opt = Math.floor(1000 + Math.random() * 9000);
        user.resetPasswordOtp = opt;
        user.resetPasswordOtpExpire = Date.now() + 60 * 1000 * 10;

        await user.save();
        const response = await mailsender.sendMail(email, "Reset Password", `Your otp is ${opt}`);
        return res.status(200).json({ message: response.message });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ errors: [{ type: error.name, message: error.message }] });
    }
};

exports.varifyOtp = async function (req, res) {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found\ncheck your email and try again" });
        }
        if (Date.now() > user.resetPasswordOtpExpire) {
            return res.status(400).json({ message: "OTP Expired" });
        }
        if (user.resetPasswordOtp !== +otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        user.resetPasswordOtp = 1;
        user.resetPasswordOtpExpire = undefined;
        return res.status(200).json({ message: "OTP confirmed successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ errors: [{ type: error.name, message: error.message }] });
    }
};

exports.resetPassword = async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errormessages = errors.array().map((error) => ({ field: error.path, message: error.msg }));
        return res.status(400).json({ errors: errormessages });
    }
    try {
        const { email, newPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found\ncheck your email and try again" });
        }
        if (user.resetPasswordOtp !== 1) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        user.passwordHash = bcrypt.hashSync(newPassword, 8);
        user.resetPasswordOtp = undefined;
        await user.save();
        return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ errors: [{ type: error.name, message: error.message }] });
    }
};