const { User } = require("../models/user");
const stripe = require("stripe")(process.env.STRIPE_KEY);
exports.getUsers = async function (_, res) {
    try {
        const users = await User.find().select('name email id isAdmin ');
        if (!users) return res.status(404).json({ message: "Users not found" });
        return res.json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ errorstype: error.name, message: error.message });
    }
};

exports.getUserById = async function (req, res) {
    try {
        const user = await User.findById(req.params.id).select('-passwordHash -resetPasswordOtp -resetPasswordOtpExpire -cart');
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ errorstype: error.name, message: error.message });
    }
};

exports.updateUser = async function (req, res) {
    try {
        const { name, email, phone } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { name, email, phone }, { new: true });
        if (!user) return res.status(404).json({ message: "User not found" });
        user.passwordHash = undefined;
        user.cart = undefined;
        return res.json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ errorstype: error.name, message: error.message });
    }
};

exports.getPaymentProfile = async function (req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (!user.paymentCustomerId) {
            return res.status(404).json({ message: "You don't have a payment profile, complete and order to see your payment profile" });
        }

        const session = stripe.billingPortal.sessions.create({
            customer: user.paymentCustomerId,
            return_url: 'https://dbestech.biz/ecomly',
        });
        return res.json({ url: session.url });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ errorstype: error.name, message: error.message });
    }
};