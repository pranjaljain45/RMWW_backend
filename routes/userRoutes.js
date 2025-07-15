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


router.post("/address", authenticateToken, async (req, res) => {
  const uid = req.user.uid;
  const {
    addressLine1, addressLine2, city, state, zip, country,
    firstName, lastName, email, mobile, pinCode
  } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { uid },
      {
        address: {
          firstName,
          lastName,
          email,
          mobile,
          addressLine1,
          addressLine2,
          city,
          state,
          country,
          pinCode
        },
      },
      { new: true }
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
    heightFeet,
    heightInches,
    weight,
    bustSize,
    bodyType,
    primaryDressSize
  } = req.body;

  const updates = {
    heightFeet,
    heightInches,
    weight,
    bustSize,
    bodyType,
    primaryDressSize
  };

  await User.findOneAndUpdate({ uid }, updates, { new: true });
  res.json({ message: "Updated successfully" });
});


router.post("/userinfo", authenticateToken, async (req, res) => {
  const { uid, email, name } = req.user;
  const [firstName, ...lastArr] = name.split(" ");
  const lastName = lastArr.join(" ");

  try {
    let user = await User.findOne({ uid });

    if (!user) {
      user = new User({ uid, email, firstName, lastName });
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
