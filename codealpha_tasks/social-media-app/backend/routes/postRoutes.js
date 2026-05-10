const express = require("express");
const Post = require("../models/Post");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();


// =============================
// ✅ CREATE POST
// =============================
router.post("/", auth, upload.single("file"), async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const newPost = new Post({
      user: req.user.id,
      content: req.body.content || "",
      image: req.file ? req.file.filename : null
    });

    const savedPost = await newPost.save();

    res.status(201).json(savedPost);

  } catch (err) {
    console.error("POST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// =============================
// ✅ GET ALL POSTS (FEED)
// =============================
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username")
      .populate("comments.user", "username")
      .sort({ createdAt: -1 });

    res.json(posts);

  } catch (err) {
    console.error("GET POSTS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// =============================
// ❤️ LIKE / UNLIKE
// =============================
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    const alreadyLiked = post.likes.some(
      id => id.toString() === req.user.id
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        id => id.toString() !== req.user.id
      );
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();

    res.json({
      message: alreadyLiked ? "Post unliked" : "Post liked",
      likeCount: post.likes.length
    });

  } catch (err) {
    console.error("LIKE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// =============================
// 💬 ADD COMMENT
// =============================
router.post("/comment/:id", auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ msg: "Comment cannot be empty" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    post.comments.push({
      user: req.user.id,
      text
    });

    await post.save();

    res.json(post);

  } catch (err) {
    console.error("COMMENT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// =============================
// ❌ DELETE COMMENT
// =============================
router.delete("/comment/:postId/:commentId", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) return res.status(404).json({ msg: "Post not found" });

    const comment = post.comments.id(req.params.commentId);

    if (!comment) return res.status(404).json({ msg: "Comment not found" });

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    comment.deleteOne();
    await post.save();

    res.json({ msg: "Comment deleted" });

  } catch (err) {
    console.error("DELETE COMMENT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// =============================
// ❌ DELETE POST
// =============================
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    await post.deleteOne();

    res.json({ msg: "Post deleted" });

  } catch (err) {
    console.error("DELETE POST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;