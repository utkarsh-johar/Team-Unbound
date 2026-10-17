const { Op } = require('sequelize');
const { AuditLog } = require('../models');

/**
 * List all audit logs with pagination and filters (Admin only)
 */
const getAuditLogs = async (req, res) => {
  try {
    if (!AuditLog) {
      return res.json({ total: 0, logs: [], page: 1, totalPages: 0 });
    }

    const {
      page = 1,
      limit = 50,
      entityType,
      action,
      actorId,
      startDate,
      endDate
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (parsedPage - 1) * parsedLimit;

    const where = {};
    if (entityType) where.entityType = entityType;
    if (action) where.action = action;
    if (actorId) where.actorId = actorId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      limit: parsedLimit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return res.json({
      total: count,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(count / parsedLimit),
      logs: rows
    });
  } catch (error) {
    console.error('Error in getAuditLogs:', error);
    return res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
};

/**
 * List audit logs related specifically to the currently authenticated user
 */
const getMyAuditLogs = async (req, res) => {
  try {
    if (!AuditLog) {
      return res.json({ total: 0, logs: [], page: 1, totalPages: 0 });
    }

    const { page = 1, limit = 50 } = req.query;
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (parsedPage - 1) * parsedLimit;

    const userId = req.user.id;

    // Logs where current user is actor OR entity
    const where = {
      [Op.or]: [
        { actorId: userId },
        { entityId: userId },
        {
          [Op.and]: [
            { entityType: 'User' },
            { entityId: userId }
          ]
        }
      ]
    };

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      limit: parsedLimit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return res.json({
      total: count,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(count / parsedLimit),
      logs: rows
    });
  } catch (error) {
    console.error('Error in getMyAuditLogs:', error);
    return res.status(500).json({ error: 'Failed to retrieve your audit logs' });
  }
};

module.exports = {
  getAuditLogs,
  getMyAuditLogs
};
