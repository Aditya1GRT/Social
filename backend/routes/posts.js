const express = require('express');
const router = express.Router();
const { posts, users, notifications } = require('../db');
const { verifyToken } = require('../middleware/auth');
const { deleteFile } = require('../services/storage');

// Helper: enrich post with author info; returns null if author was deleted
const enrichPost = async (post) => {
  const author = await users.findOneAsync({ _id: post.userId });
  if (!author) return null;
  return {
    ...post,
    username: author.username,
    name: author.name,
    profilePicture: author.profilePicture,
  };
};

// GET feed posts for a user (own posts + posts from people they follow)
// NOTE: /profile/:userId must be defined before /:userId
router.get('/profile/:userId', async (req, res) => {
  try {
    const userPosts = await posts.findAsync({ userId: req.params.userId });
    userPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const enriched = (await Promise.all(userPosts.map(enrichPost))).filter(Boolean);
    res.status(200).json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const user = await users.findOneAsync({ _id: req.params.userId });
    if (!user) return res.status(200).json([]);

    const followingIds = [...(user.following || []), req.params.userId];
    const feedPosts = await posts.findAsync({ userId: { $in: followingIds } });
    feedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const enriched = (await Promise.all(feedPosts.map(enrichPost))).filter(Boolean);
    res.status(200).json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a new post
router.post('/create-post', verifyToken, async (req, res) => {
  try {
    const { userId, description, postMedia, mediaType } = req.body;
    const author = await users.findOneAsync({ _id: userId });

    const newPost = {
      userId,
      description: description || '',
      postMedia: postMedia || 'null',
      mediaType: mediaType || '',
      likes: [],
      comments: [],
      username: author ? author.username : '',
      name: author ? author.name : '',
      profilePicture: author ? author.profilePicture : null,
      createdAt: new Date(),
    };

    const created = await posts.insertAsync(newPost);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT react (like/unlike) a post
router.put('/reactions/:postId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await posts.findOneAsync({ _id: req.params.postId });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const liked = post.likes.includes(userId);
    if (liked) {
      await posts.updateAsync({ _id: req.params.postId }, { $pull: { likes: userId } });
    } else {
      await posts.updateAsync({ _id: req.params.postId }, { $push: { likes: userId } });
      if (userId !== post.userId) {
        users.findOneAsync({ _id: userId }).then(actor => {
          notifications.insertAsync({
            userId: post.userId,
            fromUserId: userId,
            fromUsername: actor?.username || '',
            fromName: actor?.name || '',
            fromPicture: actor?.profilePicture || '',
            type: 'like',
            postId: post._id,
            postDescription: post.description || '',
            read: false,
            createdAt: new Date(),
          });
        }).catch(() => {});
      }
    }
    res.status(200).json({ message: liked ? 'Unliked' : 'Liked' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT add comment to post
router.put('/comment/:postId', verifyToken, async (req, res) => {
  try {
    const { commentData } = req.body;
    const comment = { ...commentData, id: Date.now().toString() };
    const post = await posts.findOneAsync({ _id: req.params.postId });
    await posts.updateAsync({ _id: req.params.postId }, { $push: { comments: comment } });
    if (post && commentData.userId !== post.userId) {
      notifications.insertAsync({
        userId: post.userId,
        fromUserId: commentData.userId,
        fromUsername: commentData.username || '',
        fromName: commentData.name || '',
        fromPicture: commentData.profilePicture || '',
        type: 'comment',
        postId: post._id,
        postDescription: post.description || '',
        comment: commentData.comment || '',
        read: false,
        createdAt: new Date(),
      }).catch(() => {});
    }
    res.status(200).json({ message: 'Comment added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT delete a comment from post
router.put('/delete-comment/:postId', verifyToken, async (req, res) => {
  try {
    const { commentId } = req.body;
    const post = await posts.findOneAsync({ _id: req.params.postId });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const updatedComments = post.comments.filter(c => c.id !== commentId);
    await posts.updateAsync({ _id: req.params.postId }, { $set: { comments: updatedComments } });
    res.status(200).json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a post
router.delete('/delete-post/:postId', verifyToken, async (req, res) => {
  try {
    const post = await posts.findOneAsync({ _id: req.params.postId });
    await posts.removeAsync({ _id: req.params.postId }, {});
    // Fire-and-forget: remove the media file from Cloudinary so it doesn't linger
    if (post?.postMedia && post.postMedia !== 'null') {
      deleteFile(post.postMedia).catch(() => {});
    }
    res.status(200).json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
