const { Product } = require("../../models/product");
const { Review } = require("../../models/review");
const media_helper = require("../../helper/media_helper");
const util = require("util");
const multer = require("multer");
const { default: mongoose } = require("mongoose");

exports.getProductsCount = async function (req, res) {
    try {
        const count = await Product.countDocuments();
        if (!count) return res.status(500).json({ message: "could not count products" });
        return res.status(200).json(count);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.getProducts = async function (req, res) {
    try {
        const page = req.query.page || 1;
        const pageSize = 10;

        const products = await Product.find()
            .select("-reviews -rating")
            .limit(pageSize)
            .skip(pageSize * (page - 1));
        if (!products) return res.status(404).json({ message: "could not get products" });
        return res.status(200).json(products);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.addProduct = async function (req, res) {
    try {
        const uploadImage = util.promisify(media_helper.upload.fields([
            { name: "image", maxCount: 1 },
            { name: "images", maxCount: 10 },
        ]));
        try {
            await uploadImage(req, res);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                type: error.code,
                message: `${error.message}{${error.field}}`,
                storageErrors: error.storageError,
            });
        }

        const category = await Category.findById(req.body.category);
        if (!category) return res.status(404).json({ message: "Category not found" });
        if (category.markedfordeletion) return res.status(404).json({ message: "Category marked for deletion, you can not add products to this category" });

        const image = req.fields["image"][0];
        if (!image) return res.status(404).json({ message: "Image not found" });

        req.body["image"] = `${req.protocol}://${req.get("host")}/${image.path}`;
        const gallary = req.fields["images"];
        const imagePaths = [];

        if (gallary) {
            for (const image of gallary) {
                const imagePath = `${req.protocol}://${req.get("host")}/${image.path}`;
                imagePaths.push(imagePath);
            }
        }
        if (imagePaths.length > 0) req.body["images"] = imagePaths;

        const product = await new Product(req.body).save();

        if (!product) return res.status(500).json({ message: "Could not create product" });

        return res.status(201).json(product);


    } catch (error) {
        console.error(error);
        if (err instanceof multer.MulterError) {
            return res.status(err.code).json({ message: err.message });
        }
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.editProduct = async function (req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id) ||
            !(await product.findById(req.params.id))) {
            return res.status(404).json({ message: "Invalis product id" })
        };
        if (req.body.category) {
            const category = await Category.findById(req.body.category);
            if (!category) return res.status(404).json({ message: "Category not found" });
            if (category.markedfordeletion) return res.status(404).json({ message: "Category marked for deletion, you can not add products to this category" });
        };
        const product = await Product.findById(req.params.id);

        if (req.body.images) {
            let limit = 10 - product.images.length;
            const uploadGallary = util.promisify(
                media_helper.upload.fields([{ name: "images", maxCount: limit },])
            );
            try {
                await uploadGallary(req, res);
            } catch (error) {
                console.error(error);
                return res.status(500).json({
                    type: error.code,
                    message: `${error.message}{${error.field}}`,
                    storageErrors: error.storageError,
                });
            }
            const imageFiles = req.fields["images"];
            const updateGallary = imageFiles && imageFiles.length > 0;

            if (updateGallary) {
                const imagePaths = [];
                for (const image of gallary) {
                    const imagePath = `${req.protocol}://${req.get("host")}/${image.path}`;
                    imagePaths.push(imagePath);
                }
                req.body["images"] = [...product.images, ...imagePaths];
            }
        }
        if (req.body.image) {
            const uploadImage = util.promisify(media_helper.upload.fields([
                { name: "image", maxCount: 1 },
            ]));
            try {
                await uploadImage(req, res);
            } catch (error) {
                console.error(error);
                return res.status(500).json({
                    type: error.code,
                    message: `${error.message}{${error.field}}`,
                    storageErrors: error.storageError,
                });
            }
            const image = req.fields["image"][0];
            if (!image) return res.status(404).json({ message: "Image not found" });

            req.body["image"] = `${req.protocol}://${req.get("host")}/${image.path}`;
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
        return res.json(updatedProduct);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.deleteProductImages = async function (req, res) {
    try {
        const productId = req.params.id;
        const { deleteImageUrls } = req.body;

        if (mongoose.isValidObjectId(productId) || !Array.isArray(deleteImageUrls)) {
            return res.status(400).json({ message: "Invalid request data" })
        }

        await media_helper.deleteImages(deleteImageUrls);
        const product = await Product.findById(productId);

        if (!product) return res.status(404).json({ message: "Product not found" });

        product.images = product.images.filter((image) => !deleteImageUrls.includes(image));

        await product.save();
        return res.json(product);

    } catch (error) {
        console.error(`Error deleting product images: ${error.message}`);

        if (error.code === "ENOENT") {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(500).json({ message: error.message });
    }
}

exports.deleteProduct = async function (req, res) {
    try {
        const productId = req.params.id;
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ message: "Invalid request data" })
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        media_helper.deleteImages([...product.images, product.image], "ENOENT");

        Review.deleteMany({ _id: { $in: product.reviews } });

        await Product.findByIdAndDelete(productId);
        return res.status(204).end();

    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}
