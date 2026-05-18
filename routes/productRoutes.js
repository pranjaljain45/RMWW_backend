const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// Search products by name or subcategory
router.get("/search/:query", async (req, res) => {
    try {
        const { query } = req.params;
        
        if (!query || query.trim() === '') {
            return res.json([]);
        }

        const products = await Product.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { subcategory: { $regex: query, $options: 'i' } }
            ]
        }).limit(50); // Limit results to 50 products

        res.json(products);

    } catch (err) {
        console.error("Error searching products:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// GET single product by ID
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(product);

    } catch (err) {
        console.error("Error fetching product:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// GET products by category
router.get("/:gender/:category/:subcategory", async (req, res) => {
    try {
        const { gender, category, subcategory } = req.params;

        const products = await Product.find({
            gender,
            category,
            subcategory
        });

        res.json(products);

    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ message: "Server error" });
    }
});




module.exports = router;