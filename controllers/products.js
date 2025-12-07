const { Product } = require("../models/product");

exports.getProducts = async function (req, res) {
    try {
        let products;
        const page = req.query.page || 1;
        const pageSize = 10;

        if (req.query.criteria) {
            let query = {};
            if (req.query.category) {
                query["category"] = req.query.category;
            }
            switch (req.query.criteria) {
                case 'newArrivals':
                    const twoWeeks = new Date();
                    twoWeeks.setDate(twoWeeks.getDate() - 14);
                    query["dateAdded"] = { $gte: twoWeeks };
                    break;
                case 'popular':
                    query["rating"] = { $gte: 4.5 };
                    break
                default:
                    break;
            }
            products = await Product.find(query)
                .select("-images -reviews -size")
                .limit(pageSize)
                .skip(pageSize * (page - 1));
            if (!products) return res.status(404).json({ message: "could not get products" });
            return res.status(200).json(products);
        } else if (req.query.category) {
            products = await Product.find({ category: req.query.category })
                .select("-images -reviews -size")
                .limit(pageSize)
                .skip(pageSize * (page - 1));
        } else {
            products = await Product.find()
                .select("-images -reviews -size")
                .limit(pageSize)
                .skip(pageSize * (page - 1));
        }

        if (!products) return res.status(404).json({ message: "could not get products" });
        return res.status(200).json(products);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.searchProduct = async function (req, res) {
    try {
        const searchTerm = req.query.q;

        const page = req.query.page || 1;
        const pageSize = 10;

        let query = {};
        if (req.query.category) {
            query = { category: req.query.category };
            if (req.query.genderAgeCategory) {
                query["genderAgeCategory"] = req.query.genderAgeCategory.toLowerCase();
            }

        } else if (req.query.genderAgeCategory) {
            query = { genderAgeCategory: req.query.genderAgeCategory.toLowerCase() };

        }

        if (searchTerm) {
            query = {
                ...query,
                $text: {
                    $search: searchTerm,
                    $language: "english",
                    $caseSensitive: false
                }
            };
        }
        const searchResult = await Product.find(query)
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        return res.status(200).json(searchResult);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.getProductById = async function (req, res) {
    try {
        const product = await Product.findById(req.params.id).select("-reviews");
        if (!product) return res.status(404).json({ message: "Product not found" });
        return res.status(200).json(product);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.leaveReview = async function (req, res) {
    try {

    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.getProductReviews = async function (req, res) {
    try {

    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}