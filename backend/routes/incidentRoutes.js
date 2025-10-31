const express = require('express');
const {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncident,
  deleteIncident,
  bulkUpdateStatus,
  getAnalytics
} = require('../controllers/incidentController');
const { protect, authorize } = require('../middleware/auth');
const { logAction } = require('../middleware/auditLogger');
const upload = require('../utils/fileUpload');

const router = express.Router();

router.post('/', protect, upload.array('evidence', 5), logAction('CREATE', 'Incident'), createIncident);
router.get('/', protect, getIncidents);
router.get('/analytics', protect, authorize('admin', 'superadmin'), getAnalytics);
router.get('/:id', protect, getIncidentById);
router.put('/:id', protect, authorize('admin', 'superadmin'), logAction('UPDATE', 'Incident'), updateIncident);
router.delete('/:id', protect, authorize('superadmin'), logAction('DELETE', 'Incident'), deleteIncident);
router.post('/bulk-update', protect, authorize('admin', 'superadmin'), logAction('BULK_UPDATE', 'Incident'), bulkUpdateStatus);

module.exports = router;
