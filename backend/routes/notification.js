const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { isAuthenticated } = require('../middleware/auth');

// All notification routes require authentication
router.use(isAuthenticated);

// GET / - get user's notifications (newest first)
router.get('/', notificationController.getNotifications);

// GET /unread-count - get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// PUT /read-all - mark all as read
router.put('/read-all', notificationController.markAllRead);

// PUT /:id/read - mark as read
router.put('/:id/read', notificationController.markRead);

module.exports = router;
