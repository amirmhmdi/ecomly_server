const cron = require("node-cron");
const { Product } = require("../models/product");
const { Category } = require("../models/category");

cron.schedule("0 0 0 * * *", async () => {
    try {
        const categoriesTobeDeleted = await Category.find({
            markedfordeletion: true,
        });
        for (const category of categoriesTobeDeleted) {
            const categoryProductsCount = await Product.countDocuments({
                category: category._id
            });
            if (categoryProductsCount < 1) await category.deleteOne();
        }
        console.log("Cron job executed");
    } catch (error) {
        console.error("Cron job error :", error);
    }

});

cron.schedule("*/30 * * * *", async () => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        console.log("Reservation Cron Job Start at", new Date());

        const expiredReservations = await CartProduct.find({
            reserved: true,
            reservedUntil: { $lte: new Date() }
        }).session(session);

        for (const cartProduct of expiredReservations) {
            const product = await Product.findById(cartProduct.product).session(session);
            if (product) {
                const updatedProduct = await Product.findByIdAndUpdate(
                    { _id: product._id },
                    { $inc: { countInStock: cartProduct.quantity } },
                    { new: true, runValidators: true, session }
                );
                if (!updatedProduct) {
                    console.log("Error eccured while updating product. potential concurrency issue.");
                    await session.abortTransaction();
                    return;
                }
            }

            await cartProduct.findByIdAndUpdate(
                cartProduct._id,
                { reserved: false },
                { session }
            );
        }

        await session.commitTransaction();
        console.log("Reservation Cron Job Completed at", new Date());
    } catch (error) {
        await session.abortTransaction();
        console.error("Cron job error :", error);
    } finally {
        session.endSession();
    }
})