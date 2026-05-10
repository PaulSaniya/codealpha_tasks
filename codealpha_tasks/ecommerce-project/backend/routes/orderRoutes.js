const express = require("express");
const router = express.Router();

const Order = require("../models/Order");

// Place order (NO auth for now)
router.post("/", async (req, res) => {
    const order = new Order({
        userId: req.body.userId,
        products: req.body.products,
        total: req.body.total
    });

    await order.save();
    res.json({ message: "Order placed" });
});

// Get all orders
router.get("/", async (req, res) => {
    const orders = await Order.find();
    res.json(orders);
});

module.exports = router;