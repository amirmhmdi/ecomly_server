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