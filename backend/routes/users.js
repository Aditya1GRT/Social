const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { users, posts, notifications } = require('../db');
const { verifyToken } = require('../middleware/auth');
const { deleteFile } = require('../services/storage');

const sanitize = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

// GET user by username — must come before /:query
router.get('/user/:username', async (req, res) => {
  try {
    const user = await users.findOneAsync({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(sanitize(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET followers list for a user
router.get('/followers/:username', async (req, res) => {
  try {
    const user = await users.findOneAsync({ username: req.params.username });
    if (!user) return res.status(200).json([]);
    const ids = [...new Set((user.followers || []).filter(Boolean))];
    const list = await Promise.all(ids.map(id => users.findOneAsync({ _id: id })));
    res.status(200).json(list.filter(Boolean).map(sanitize));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET following list for a user
router.get('/friends/:username', async (req, res) => {
  try {
    const user = await users.findOneAsync({ username: req.params.username });
    if (!user) return res.status(200).json([]);
    const ids = [...new Set((user.following || []).filter(Boolean))];
    const list = await Promise.all(ids.map(id => users.findOneAsync({ _id: id })));
    res.status(200).json(list.filter(Boolean).map(sanitize));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST get multiple users by ID array (for conversations / friend requests)
router.post('/users-details', async (req, res) => {
  try {
    const ids = req.body.data || [];
    if (!ids.length) return res.status(200).json([]);
    const list = await users.findAsync({ _id: { $in: ids } });
    res.status(200).json(list.map(u => ({
      userId: u._id,
      _id: u._id,
      name: u.name,
      username: u.username,
      profilePicture: u.profilePicture,
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT change theme preference
router.put('/theme/:userId', verifyToken, async (req, res) => {
  try {
    await users.updateAsync({ _id: req.params.userId }, { $set: { prefersDarkTheme: req.body.prefersDarkTheme } });
    res.status(200).json({ message: 'Theme updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT send follow request — :id = target, body.userId = sender
router.put('/follow-request/:id', verifyToken, async (req, res) => {
  try {
    const { id: targetId } = req.params;
    const { userId: senderId } = req.body;
    await users.updateAsync({ _id: senderId }, { $push: { reqSent: targetId } });
    await users.updateAsync({ _id: targetId }, { $push: { reqRecieved: senderId } });
    res.status(200).json({ message: 'Follow request sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT unsend follow request
router.put('/unsend-follow-request/:id', verifyToken, async (req, res) => {
  try {
    const { id: targetId } = req.params;
    const { userId: senderId } = req.body;
    await users.updateAsync({ _id: senderId }, { $pull: { reqSent: targetId } });
    await users.updateAsync({ _id: targetId }, { $pull: { reqRecieved: senderId } });
    res.status(200).json({ message: 'Follow request unsent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT approve follow request — :id = requester, body.userId = approver
router.put('/approve-follow-request/:id', verifyToken, async (req, res) => {
  try {
    const requesterId = req.params.id;
    const { userId: approverId } = req.body;
    // Mutual follow: both users follow each other
    const [approver] = await Promise.all([
      users.findOneAsync({ _id: approverId }),
      users.updateAsync({ _id: approverId }, { $push: { followers: requesterId, following: requesterId }, $pull: { reqRecieved: requesterId } }),
      users.updateAsync({ _id: requesterId }, { $push: { following: approverId, followers: approverId }, $pull: { reqSent: approverId } }),
    ]);
    notifications.insertAsync({
      userId: requesterId,
      fromUserId: approverId,
      fromUsername: approver?.username || '',
      fromName: approver?.name || '',
      fromPicture: approver?.profilePicture || '',
      type: 'follow',
      postId: '',
      postDescription: '',
      read: false,
      createdAt: new Date(),
    }).catch(() => {});
    res.status(200).json({ message: 'Follow request approved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT reject follow request
router.put('/reject-follow-request/:id', verifyToken, async (req, res) => {
  try {
    const requesterId = req.params.id;
    const { userId: rejecterId } = req.body;
    await users.updateAsync({ _id: rejecterId }, { $pull: { reqRecieved: requesterId } });
    await users.updateAsync({ _id: requesterId }, { $pull: { reqSent: rejecterId } });
    res.status(200).json({ message: 'Follow request rejected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT unfollow — :id = target, body.userId = unfollower
router.put('/unfollow/:id', verifyToken, async (req, res) => {
  try {
    const targetId = req.params.id;
    const { userId } = req.body;
    await users.updateAsync({ _id: userId }, { $pull: { following: targetId, followers: targetId } });
    await users.updateAsync({ _id: targetId }, { $pull: { followers: userId, following: userId } });
    res.status(200).json({ message: 'Unfollowed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update user profile — :id = userId
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { password, _id, ...updateData } = req.body;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    await users.updateAsync({ _id: req.params.id }, { $set: updateData });
    const updated = await users.findOneAsync({ _id: req.params.id });
    res.status(200).json(sanitize(updated));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE user account — cascades to posts, social graph, and notifications
router.delete('/:id', verifyToken, async (req, res) => {
  const id = req.params.id;
  try {
    // 1. Delete all posts and their Cloudinary media
    const userPosts = await posts.findAsync({ userId: id });
    await Promise.all(userPosts.map(async (p) => {
      if (p.postMedia && p.postMedia !== 'null') deleteFile(p.postMedia).catch(() => {});
      await posts.removeAsync({ _id: p._id }, {});
    }));

    // 2. Remove the deleted user's likes and comments from all other posts
    const allPosts = await posts.findAsync({});
    await Promise.all(allPosts.map(p => {
      const hadLike    = (p.likes    || []).includes(id);
      const hadComment = (p.comments || []).some(c => c.userId === id);
      if (!hadLike && !hadComment) return Promise.resolve();
      return posts.updateAsync({ _id: p._id }, { $set: {
        likes:    (p.likes    || []).filter(lid => lid !== id),
        comments: (p.comments || []).filter(c  => c.userId !== id),
      }});
    }));

    // 3. Scrub the deleted user from every other user's followers/following/followRequests
    const affected = await users.findAsync({});
    await Promise.all(affected.map(u => {
      const inFollowers     = (u.followers     || []).includes(id);
      const inFollowing     = (u.following     || []).includes(id);
      const inFollowReq     = (u.followRequests || []).includes(id);
      if (!inFollowers && !inFollowing && !inFollowReq) return Promise.resolve();
      return users.updateAsync({ _id: u._id }, { $set: {
        followers:      (u.followers     || []).filter(x => x !== id),
        following:      (u.following     || []).filter(x => x !== id),
        followRequests: (u.followRequests || []).filter(x => x !== id),
      }});
    }));

    // 4. Delete notifications involving this user
    const allNotifs = await notifications.findAsync({});
    await Promise.all(
      allNotifs
        .filter(n => n.userId === id || n.fromUserId === id)
        .map(n => notifications.removeAsync({ _id: n._id }, {}))
    );

    // 5. Delete the user's profile picture from Cloudinary
    const user = await users.findOneAsync({ _id: id });
    if (user?.profilePicture) deleteFile(user.profilePicture).catch(() => {});

    // 6. Remove user record
    await users.removeAsync({ _id: id }, {});
    res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET search users by name/username — catch-all, must be last
router.get('/:query', async (req, res) => {
  try {
    const re = new RegExp(req.params.query, 'i');
    const found = await users.findAsync({ $or: [{ username: re }, { name: re }] });
    res.status(200).json(found.map(u => ({ ...sanitize(u), userId: u._id })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
