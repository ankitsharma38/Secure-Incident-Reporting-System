const Incident = require('../models/Incident');

exports.createIncident = async (req, res) => {
  try {
    const { title, description, category, priority, date } = req.body;
    const evidence = req.files?.map(file => file.path) || [];

    const incident = await Incident.create({
      title,
      description,
      category,
      priority,
      date,
      evidence,
      reportedBy: req.user._id
    });

    const populatedIncident = await Incident.findById(incident._id)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email');

    const io = req.app.get('io');
    io.emit('newIncident', populatedIncident);

    res.status(201).json(populatedIncident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getIncidents = async (req, res) => {
  try {
    const { status, category, priority, sortBy = '-createdAt' } = req.query;
    const filter = {};

    if (req.user.role === 'user') {
      filter.reportedBy = req.user._id;
    }

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const incidents = await Incident.find(filter)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort(sortBy);

    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    if (req.user.role === 'user' && incident.reportedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(incident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    Object.assign(incident, req.body);
    await incident.save();

    const populatedIncident = await Incident.findById(incident._id)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email');

    const io = req.app.get('io');
    // Emit to specific user for notification
    io.to(incident.reportedBy.toString()).emit('userIncidentUpdated', populatedIncident);
    // Emit to all for dashboard refresh
    io.emit('incidentUpdated', populatedIncident);

    res.json(populatedIncident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    res.json({ message: 'Incident deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;
    await Incident.updateMany({ _id: { $in: ids } }, { status });
    
    const updatedIncidents = await Incident.find({ _id: { $in: ids } })
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email');

    const io = req.app.get('io');
    updatedIncidents.forEach(incident => {
      io.to(incident.reportedBy._id.toString()).emit('userIncidentUpdated', incident);
      io.emit('incidentUpdated', incident);
    });

    res.json({ message: 'Incidents updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const totalIncidents = await Incident.countDocuments();
    const openIncidents = await Incident.countDocuments({ status: 'Open' });
    const resolvedIncidents = await Incident.countDocuments({ status: 'Resolved' });

    const categoryStats = await Incident.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const avgResolutionTime = await Incident.aggregate([
      { $match: { status: 'Resolved', resolvedAt: { $exists: true } } },
      { $project: { resolutionTime: { $subtract: ['$resolvedAt', '$createdAt'] } } },
      { $group: { _id: null, avgTime: { $avg: '$resolutionTime' } } }
    ]);

    res.json({
      totalIncidents,
      openIncidents,
      resolvedIncidents,
      categoryStats,
      avgResolutionTime: avgResolutionTime[0]?.avgTime || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
