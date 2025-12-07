
const express = require("express");
const router = express.Router();

const usersController = require("../controllers/admin/users");
const categoryController = require("../controllers/admin/categories");
const orderController = require("../controllers/admin/orders");
const productController = require("../controllers/admin/products");

router.get("/users/count", usersController.getUserCount);
router.delete("/users/:id", usersController.deleteUser);


router.post("/category", categoryController.addCategory);
router.put("/category/:id", categoryController.editCategory);
router.delete("/category/:id", categoryController.deleteCategory);

router.get("/products/count", productController.getProductsCount);
router.get("/products", productController.getProducts);
router.post("/product", productController.addProduct);
router.put("/product/:id", productController.editProduct);
router.delete("/product/:id/images", productController.deleteProductImages);
router.delete("/product/:id", productController.deleteProduct); 

router.get("/orders", orderController.getOrders);
router.get("/orders/count", orderController.getOrderCount);
router.put("/orders/:id", orderController.changeOrderStatus);
router.delete("/orders/:id", orderController.deleteOrder);

module.exports = router;