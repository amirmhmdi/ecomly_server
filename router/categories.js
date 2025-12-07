const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categories");

router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoriesById);

module.exports = router;