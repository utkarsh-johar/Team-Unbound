const { Notification } = require('../models');

/**
 * Get all notifications for current user (newest first)
 */
const getNotifications = async (req, res) => {
  try {
    if (!Notification) {
      return res.json({ notifications: [] });
    }

    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    return res.json({ notifications });
  } catch (error) {
    console.error('Error in getNotifications:', error);
    return res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
};

/**
 * Get unread notifications count for current user
 */
const getUnreadCount = async (req, res) => {
  try {
    if (!Notification) {
      return res.json({ unreadCount: 0 });
    }

    const count = await Notification.count({
      where: {
        userId: req.user.id,
        read: false
      }
    });

    return res.json({ unreadCount: count });
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    return res.status(500).json({ error: 'Failed to get unread count' });
  }
};

/**
 * Mark a single notification as read
 */
const markRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!Notification) {
      return res.status(404).json({ error: 'Notification service unavailable' });
    }

    const notification = await Notification.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    return res.json({
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Error in markRead:', error);
    return res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

/**
 * Mark all notifications as read for current user
 */
const markAllRead = async (req, res) => {
  try {
    if (!Notification) {
      return res.json({ message: 'All notifications marked as read', updatedCount: 0 });
    }

    const [updatedCount] = await Notification.update(
      { read: true },
      {
        where: {
          userId: req.user.id,
          read: false
        }
      }
    );

    return res.json({
      message: 'All notifications marked as read',
      updatedCount
    });
  } catch (error) {
    console.error('Error in markAllRead:', error);
    return res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead
};
