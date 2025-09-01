const express = require('express');
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const router = express.Router();

// Create a post
router.post('/', auth, async (req, res) => {
  try {
    const { image, description, review } = req.body;
    
    const newPost = new Post({
      user: req.user.id,
      name: req.user.name,
      image,
      description,
      review
    });

    const post = await newPost.save();
    res.json(post);
  } catch (err) {
    console.error('Post creation error:', err.message);
    res.status(500).json({ message: 'Server error while creating post' });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error('Posts fetch error:', err.message);
    res.status(500).json({ message: 'Server error while fetching posts' });
  }
});

// Get posts by user
router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId }).sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error('User posts fetch error:', err.message);
    res.status(500).json({ message: 'Server error while fetching user posts' });
  }
});

module.exports = router;