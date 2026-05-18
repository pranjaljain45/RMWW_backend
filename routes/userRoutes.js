const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const User = require("../models/User");
const Order = require("../models/Order");


router.get("/orders", authenticateToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const orders = await Order.find({ uid }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    console.error("Order fetch error:", err);
    res.status(500).json({ message: "Server error fetching orders" });
  }
});

// no put req to add orders


router.post("/address", authenticateToken, async (req, res) => {
  const uid = req.user.uid;
  const {
    addressLine1, addressLine2, city, state, country, pinCode,
    name, email, mobile
  } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { uid },
      {
        address: {
          name,
          email,
          mobile,
          addressLine1,
          addressLine2,
          city,
          state,
          country: country || 'India',
          pinCode
        },
      },
      { new: true, upsert: false }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Address saved/updated successfully", address: user.address });
  } catch (err) {
    res.status(500).json({ message: "Error updating address", error: err.message });
  }

});


router.get("/address", authenticateToken, async (req, res) => {
  const { uid } = req.user;

  try {
    const user = await User.findOne({ uid });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ address: user.address });
  } catch (err) {
    res.status(500).json({ message: "Error fetching address", error: err.message });
  }
});


router.put('/updateUserProfile', authenticateToken, async (req, res) => {
  const uid = req.user.uid;
  const {
    phoneNumber,
    heightFeet,
    heightInches,
    weight,
    bustSize,
    bodyType,
    primaryDressSize
  } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  try {
    let user = await User.findOne({ uid });

    if (!user) {
      // If user doesn't exist yet, create one
      user = new User({ uid, phoneNumber, heightFeet, heightInches, weight, bustSize, bodyType, primaryDressSize });
      await user.save();
    } else {
      // Update existing user
      Object.assign(user, { phoneNumber, heightFeet, heightInches, weight, bustSize, bodyType, primaryDressSize });
      await user.save();
    }

    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(500).json({ message: "Server error updating profile", error: err.message });
  }
});

router.post("/userinfo", authenticateToken, async (req, res) => {
  const { uid, email, name } = req.user;

  try {
    let user = await User.findOne({ uid });

    if (!user) {
      user = new User({ uid, email, name });
      await user.save();
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/userinfo", authenticateToken, async (req, res) => {
  const { uid } = req.user;
  try {
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user", error: err.message });
  }
});

module.exports = router;
