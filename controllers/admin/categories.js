const media_helper = require("../../helper/media_helper");
const util = require("util");
const { Category } = require("../../models/category");

exports.addCategory = async function (req, res) {
    try {
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
        let category = new Category(req.body);

        category = category.save();
        if (!category) return res.status(500).json({ message: "Could not create category" });

        return res.status(201).json(category);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.editCategory = async function (req, res) {
    try {
        const { name, icon, colour } = req.body;
        const category = await Category.findByIdAndUpdate(req.params.id, { name, icon, colour }, { new: true });
        if (!category) return res.status(404).json({ message: "Category not found" });
        return res.json(category);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.deleteCategory = async function (req, res) {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: "Category not found" });
        category.markedfordeletion = true;
        await category.save();
        return res.status(204).end();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
} 