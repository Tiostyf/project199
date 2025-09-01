const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { appointmentLimiter } = require('../middleware/rateLimit');
const Post = require('../models/Post');

// Create a new post (appointment/review)
router.post('/', auth, appointmentLimiter, async (req, res) => {
  try {
    const { image, description, review, appointmentType, preferredDate } = req.body;
    
    const newPost = new Post({
      user: req.user.id,
      image,
      description,
      review,
      appointmentType,
      preferredDate: preferredDate || Date.now()
    });
    
    const post = await newPost.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all posts for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id }).sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get a single post
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    // Check if the post belongs to the user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server error');
  }
});

// Update a post
router.put('/:id', auth, async (req, res) => {
  try {
    const { image, description, review, appointmentType, preferredDate } = req.body;
    
    let post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    // Check if the post belongs to the user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    post = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: { image, description, review, appointmentType, preferredDate } },
      { new: true }
    );
    
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete a post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    // Check if the post belongs to the user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    await Post.findByIdAndRemove(req.params.id);
    
    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;