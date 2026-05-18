const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");
const Booking = require("../models/Booking");
const { checkAvailability } = require("../controllers/bookingController");

// PLACE ORDER
router.post("/place-order", async (req, res) => {
    try {
        const {
            uid,
            email,
            items,
            totalAmount,
            address,
            refundableDeposit,
            paymentMethod
        } = req.body;

        // Validate required fields
        if (!uid || !email || !items || !Array.isArray(items) || items.length === 0) {
            console.error("Validation failed: Missing required fields");
            return res.status(400).json({
                message: "Missing required fields: uid, email, or items"
            });
        }

        // Check availability for all items BEFORE creating order
        const availabilityResults = await Promise.all(
            items.map(item => 
                checkAvailability(
                    item.productId,
                    item.size,
                    item.rentalStartDate,
                    item.rentalEndDate
                )
            )
        );

        const allAvailable = availabilityResults.every(result => result.available);
        
        if (!allAvailable) {
            const unavailableItems = availabilityResults
                .map((result, idx) => ({ result, item: items[idx] }))
                .filter(({ result }) => !result.available)
                .map(({ result, item }) => ({
                    name: item.name,
                    size: item.size,
                    reason: result.message
                }));

            return res.status(400).json({
                message: "Some items are not available",
                unavailableItems
            });
        }

        // Save Order to DB
        const order = new Order({
            uid,
            email: email,
            items,
            totalAmount,
            refundableDeposit,
            address,
            payment: { method: paymentMethod, status: "pending" },
            orderStatus: "placed",
            placedAt: new Date()
        });

        await order.save();

        // Create bookings for each item
        const bookings = [];
        for (const item of items) {
            // Validate dates
            if (!item.rentalStartDate || !item.rentalEndDate) {
                console.error(`Missing rental dates for item: ${item.name}`);
                continue;
            }

            const booking = new Booking({
                productId: item.productId,
                size: item.size,
                rentalStartDate: new Date(item.rentalStartDate),
                rentalEndDate: new Date(item.rentalEndDate),
                uid,
                email: email,
                orderId: order._id,
                status: 'active'
            });

            await booking.save();
            bookings.push(booking);
        }

        // Push order into user's rentalHistory
        const userUpdate = await User.findOneAndUpdate(
            { uid },
            { $push: { rentalHistory: order._id } },
            { new: true }
        );
        
        if (!userUpdate) {
            console.warn(`User not found with uid: ${uid}, but order was created`);
        } 

        res.status(201).json({
            message: "Order placed successfully",
            order,
            bookings
        });

    } catch (err) {
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
        res.status(500).json({
            message: "Server error",
            error: err.message,
        });
    }
});


// GET USER ORDERS
router.get("/user-orders/:uid", async (req, res) => {
    try {
        const { uid } = req.params;

        const orders = await Order.find({ uid });

        if (!orders || orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No orders found for this user",
            });
        }

        res.json({ success: true, orders });
    } catch (err) {
        console.error("Get user orders error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


//fetch current order from db
router.get("/curr-order/:uid", async (req, res) => {
    try {
        const { uid } = req.params;

        const order = await Order.findOne({ uid }).sort({ createdAt: -1 });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "No order found"
            });
        }

        res.json({
            success: true,
            order,
        });

    } catch (err) {
        console.error("Get current order error:", err);
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
});


module.exports = router;
