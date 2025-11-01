import { useState, useEffect } from 'react';
import { incidentAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Edit, Trash2, UserPlus, ChevronDown, ChevronUp, Download } from 'lucide-react';

const IncidentTable = ({ incidents, isAdmin, onRefresh }) => {
  const [selectedIncidents, setSelectedIncidents] = useState([]);
  const [editingIncident, setEditingIncident] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  const getPriorityColor = (priority) => {
    const colors = {
      Low: 'bg-green-100 text-green-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      High: 'bg-orange-100 text-orange-800',
      Critical: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      Open: 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-purple-100 text-purple-800',
      Resolved: 'bg-green-100 text-green-800',
      Closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    if (isAdmin) {
      fetch('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      })
        .then(res => res.json())
        .then(data => {
          const adminUsers = data.filter(u => u.role === 'admin' || u.role === 'superadmin');
          setAdmins(adminUsers);
        })
        .catch(err => {
          console.error('Failed to fetch admins:', err);
          toast.error('Failed to load admin users');
        });
    }
  }, [isAdmin]);

  const handleBulkUpdate = async (status) => {
    try {
      await incidentAPI.bulkUpdate({ ids: selectedIncidents, status });
      toast.success('Incidents updated successfully');
      setSelectedIncidents([]);
      onRefresh();
    } catch (error) {
      toast.error('Failed to update incidents');
    }
  };

  const handleAssign = async (incidentId, adminId) => {
    try {
      await incidentAPI.update(incidentId, { assignedTo: adminId });
      toast.success('Incident assigned successfully');
      onRefresh();
    } catch (error) {
      toast.error('Failed to assign incident');
    }
  };

  const exportToCSV = () => {
    const headers = ['Title', 'Category', 'Priority', 'Status', 'Reported By', 'Assigned To', 'Date'];
    const rows = incidents.map(i => [
      i.title,
      i.category,
      i.priority,
      i.status,
      i.reportedBy?.name || 'N/A',
      i.assignedTo?.name || 'Unassigned',
      new Date(i.createdAt).toLocaleDateString()
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incidents_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('CSV exported successfully');
  };

  const handleUpdateIncident = async (id, updates) => {
    try {
      await incidentAPI.update(id, updates);
      toast.success('Incident updated successfully');
      setEditingIncident(null);
      onRefresh();
    } catch (error) {
      toast.error('Failed to update incident');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this incident?')) {
      try {
        await incidentAPI.delete(id);
        toast.success('Incident deleted successfully');
        onRefresh();
      } catch (error) {
        toast.error('Failed to delete incident');
      }
    }
  };

  return (
    <div className="card">
      {isAdmin && selectedIncidents.length > 0 && (
        <div className="mb-4 flex gap-2">
          <button onClick={() => handleBulkUpdate('In Progress')} className="btn-primary">
            Mark as In Progress
          </button>
          <button onClick={() => handleBulkUpdate('Resolved')} className="btn-primary">
            Mark as Resolved
          </button>
        </div>
      )}

      {isAdmin && incidents.length > 0 && (
        <div className="mb-4">
          <button onClick={exportToCSV} className="btn-secondary">
            Export to CSV
          </button>
        </div>
      )}

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {isAdmin && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIncidents(incidents.map(i => i._id));
                      } else {
                        setSelectedIncidents([]);
                      }
                    }}
                  />
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {incidents.map((incident) => (
              <>
              <tr key={incident._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedRow(expandedRow === incident._id ? null : incident._id)}>
                {isAdmin && (
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIncidents.includes(incident._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIncidents([...selectedIncidents, incident._id]);
                        } else {
                          setSelectedIncidents(selectedIncidents.filter(id => id !== incident._id));
                        }
                      }}
                    />
                  </td>
                )}
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    {expandedRow === incident._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {incident.title}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{incident.category}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(incident.priority)}`}>
                    {incident.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {editingIncident === incident._id ? (
                    <select
                      className="input-field text-sm"
                      defaultValue={incident.status}
                      onChange={(e) => handleUpdateIncident(incident._id, { status: e.target.value })}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(incident.status)}`}>
                      {incident.status}
                    </span>
                  )}
                </td>
                {isAdmin && (
                  <td className="px-6 py-4">
                    <select
                      className="input-field text-sm"
                      value={incident.assignedTo?._id || ''}
                      onChange={(e) => handleAssign(incident._id, e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {admins.map(admin => (
                        <option key={admin._id} value={admin._id}>{admin.name}</option>
                      ))}
                    </select>
                  </td>
                )}
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(incident.createdAt).toLocaleDateString()}
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingIncident(editingIncident === incident._id ? null : incident._id); }}
                        className="text-primary hover:text-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(incident._id); }}
                        className="text-danger hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
              {expandedRow === incident._id && (
                <tr key={`${incident._id}-details`}>
                  <td colSpan={isAdmin ? 8 : 6} className="px-6 py-4 bg-gray-50">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-1">Description:</h4>
                        <p className="text-sm text-gray-600">{incident.description}</p>
                      </div>
                      {incident.reportedBy && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-1">Reported By:</h4>
                          <p className="text-sm text-gray-600">{incident.reportedBy.name} ({incident.reportedBy.email})</p>
                        </div>
                      )}
                      {incident.evidence && incident.evidence.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-1">Evidence Files:</h4>
                          <div className="flex flex-wrap gap-2">
                            {incident.evidence.map((file, index) => (
                              <a
                                key={index}
                                href={`http://localhost:5000/${file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                              >
                                <Download className="h-3 w-3" />
                                {file.split('/').pop()}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {incidents.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No incidents found
        </div>
      )}
    </div>
  );
};

export default IncidentTable;
