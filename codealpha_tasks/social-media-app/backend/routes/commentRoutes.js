const express = require("express");
const Comment = require("../models/Comment");
const auth = require("../middleware/auth");

const router = express.Router();


// ✅ Add Comment
router.post("/:postId", auth, async (req, res) => {
  try {
    const comment = await Comment.create({
      user: req.user.id,
      post: req.params.postId,
      text: req.body.text
    });

    res.status(201).json(comment);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ Get Comments for a Post
router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("user", "username")
      .sort({ createdAt: -1 });

    res.json(comments);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ Delete Comment (only owner)
router.delete("/:id", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ msg: "Comment not found" });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    await comment.deleteOne();

    res.json({ msg: "Comment deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;