const AuditLog = require('../models/AuditLog');

exports.logAction = (action, targetType) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    res.send = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        let targetId = req.params.id;
        
        // For CREATE action, extract ID from response
        if (action === 'CREATE' && !targetId) {
          try {
            const responseData = JSON.parse(data);
            targetId = responseData._id;
          } catch (e) {
            targetId = 'unknown';
          }
        }

        const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || 
                          req.socket.remoteAddress || 
                          req.connection.remoteAddress || 
                          req.ip || 
                          'Unknown';
        
        AuditLog.create({
          action,
          performedBy: req.user._id,
          targetType,
          targetId: targetId || 'unknown',
          details: JSON.stringify({ 
            method: req.method, 
            path: req.path,
            body: action === 'UPDATE' ? req.body : undefined
          }),
          ipAddress: ipAddress.replace('::ffff:', '').replace('::1', '127.0.0.1')
        }).catch(err => console.error('Audit log error:', err));
      }
      originalSend.call(this, data);
    };
    next();
  };
};
