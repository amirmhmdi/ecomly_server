const express = require("express");

const router = express.Router();
const authController = require("../controllers/auth");
const { body } = require("express-validator");

const validateUser = [
    body("name").not().isEmpty().withMessage("Please enter a name"),
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
        .isStrongPassword().withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
    body("phone").isMobilePhone().withMessage("Please enter a valid phone number")
];
const validateNewPassword = [
    body("newPassword")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
        .isStrongPassword().withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
]
router.post("/register", validateUser, authController.register);

router.post("/login", authController.login);

router.get("/varify-token", authController.varifyToken);

router.post("/forgot-password", authController.forgotPassword);

router.post("/varify-otp", authController.varifyOtp);

router.post("/reset-password",validateNewPassword, authController.resetPassword);


module.exports = router;