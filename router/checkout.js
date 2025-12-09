const express = require("express");
const router = express.Router();

const checkoutController = require("../controllers/checkout");

router.get("/", checkoutController.checkout);
router.get(
    "/webhook",
    express.raw({ type: "application/json" }),
    checkoutController.webhook 
);

module.exports = router;