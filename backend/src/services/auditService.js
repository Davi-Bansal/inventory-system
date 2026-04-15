const AuditLog = require("../models/AuditLog");

const logAudit = async ({ action, entityType, entityId, metadata, actor }) => {
  await AuditLog.create({
    action,
    entityType,
    entityId,
    metadata,
    actor
  });
};

module.exports = { logAudit };
