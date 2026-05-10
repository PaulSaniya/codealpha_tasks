const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// =============================
// 🔐 REGISTER
// =============================
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashed
    });

    res.status(201).json({
      msg: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =============================
// 🔐 LOGIN
// =============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ msg: "Wrong password" });
    }

    // 🔥 IMPORTANT: SINGLE SOURCE OF TRUTH FOR SECRET
    const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});


// =============================
// 👥 FOLLOW
// =============================
router.put("/follow/:id", auth, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ msg: "You cannot follow yourself" });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (!userToFollow.followers.includes(req.user.id)) {
      userToFollow.followers.push(req.user.id);
      currentUser.following.push(req.params.id);

      await userToFollow.save();
      await currentUser.save();
    }

    res.json({ msg: "User followed" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =============================
// 👥 UNFOLLOW
// =============================
router.put("/unfollow/:id", auth, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== req.user.id
    );

    currentUser.following = currentUser.following.filter(
      id => id.toString() !== req.params.id
    );

    await userToUnfollow.save();
    await currentUser.save();

    res.json({ msg: "User unfollowed" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =============================
// 👤 PROFILE
// =============================
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "username")
      .populate("following", "username");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({
      user,
      followersCount: user.followers.length,
      followingCount: user.following.length
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;