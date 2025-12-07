const { Order } = require('../../models/order');
const { Product } = require('../../models/product');

exports.getOrders = async function (req, res) {
    try {
        const orders = await Order.find()
            .select("-statusHistory")
            .populate("user", "name email")
            .sort({ dateOrdered: -1 })
            .populate({
                path: "orderItems",
                populate: {
                    path: "product",
                    select: "name",
                    populate: {
                        path: "category",
                        select: "name",
                    },
                },
            });
        if (!orders) return res.status(404).json({ message: "Orders not found" });
        return res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.getOrderCount = async function (_, res) {
    try {
        const orderCount = await Order.countDocuments();
        if (!orderCount) return res.status(500).json({ message: "could not count orders" });
        res.json({ orderCount });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.changeOrderStatus = async function (req, res) {
    try {
        const orderID = req.params.id;
        const newStatus = req.body;
        let order = await Order.findById(orderID);
        if (!order) return res.status(404).json({ message: "Order not found" });

        if (!order.statushistory.includes(order.status)) {
            order.statushistory.push(order.status);
        };
        order.status = newStatus;
        order = await order.save();
        return res.json(order);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.deleteOrder = async function (req, res) {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        for (orderItemId of order.orderItems) {
            await orderItem.findByIdAndDelete(orderItemId);
        }
        return res.status(204).end();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}