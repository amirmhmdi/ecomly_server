const { default: mongoose } = require("mongoose");
const { Product } = require("../models/product");
const { CartProduct } = require("../models/cart_product");
const { OrderItem } = require("../models/order_item");
const { Order } = require("../models/order");
const { User } = require("../models/user");


exports.addOrder = async function (orderData) {
    if (!mongoose.isValidObjectId(orderData.user)) {
        return console.error("User Varification Failed: Invalid User");
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const user = await User.findById(orderData.user);
        if (!user) {
            await session.abortTransaction();
            return console.trace("Order creation failed: User Not Found");
        }
        const orderItems = orderData.orderItems;
        const orderItemIds = [];

        for (const orderItem of orderItems) {
            if (
                !mongoose.isValidObjectId(orderItem) ||
                !(await Product.findById(orderItem.product))
            ) {
                await session.abortTransaction();
                return console.trace("Order creation failed: Invalid product in Order");
            }

            const product = await Product.findById(orderItem.product);
            const cartProduct = await CartProduct.findById(orderItem.cartProductId);
            if (!cartProduct) {
                await session.abortTransaction();
                return console.trace("Order creation failed: Invalid cart product in Order");
            }

            let orderItemModel = await new OrderItem(orderItem).save({ session });

            if (!orderItemModel) {
                await session.abortTransaction();
                return console.trace("Order creation failed:", `An Order for porduct ${product.name} could not be created`);
            }

            if (!cartProduct.reserved) {
                product.countInStock -= orderItemModel.quantity;
                await product.save({ session });
            }

            orderItemIds.push(orderItemModel._id);

            await CartProduct.findByIdAndDelete(orderItem.cartProductId).session(session);
            user.cart.pull(cartProduct.id);
            await user.save({ session });
        }

        orderData["orderItems"] = orderItemIds;

        let order = new Order(orderData);
        order.status = "Processed";
        order.statushistory.push("Processed");
        order = await order.save({ session });

        if (!order) {
            await session.abortTransaction();
            return console.trace("Order creation failed:", "The Order could not be created");
        }

        await session.commitTransaction();
        return order;


    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return console.trace(error);
    } finally {
        session.endSession();
    }
}

exports.getUserOrders = async function (req, res) {
    try {
        const orders = await Order.find({ user: req.params.userId })
            .select("orderItems status totalPrice dateOrdered")
            .populate({ path: "orderItems", select: "productName, productImage" })
            .sort({ dateOrdered: -1 });

        if (!orders) return res.status(404).json({ message: "Product not found" });

        const complete = [];
        const cancelled = [];
        const active = [];
        for (const order of orders) {
            if (order.status === "delivered") {
                complete.push(order);
            } else if (["cancelled", "expired"].includes(order.status)) {
                cancelled.push(order);
            } else {
                active.push(order);
            }
        }
        return res.status(200).json({ total: orders.length, complete, cancelled, active });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.getOrderById = async function (req, res) {
    try {
        const order = await Order.findById(req.params.id).populate({ path: "orderItems" });
        if (!order) return res.status(404).json({ message: "Order not found" });
        return res.status(200).json(order);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}