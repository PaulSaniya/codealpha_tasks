const express = require("express");
const router = express.Router();

const Product = require("../models/Product");

// Get all products
router.get("/", async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// Get single product
router.get("/:id", async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.json(product);
});

// Add product (NO auth now)
router.post("/", async (req, res) => {
    const product = new Product(req.body);
    await product.save();

    res.json(product);
});

// DELETE product
router.delete("/:id", async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting product" });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
});

module.exports = router;