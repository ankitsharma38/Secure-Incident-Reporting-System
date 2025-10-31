import { useState } from 'react';
import { incidentAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Search, Filter } from 'lucide-react';
import IncidentForm from './IncidentForm';
import IncidentTable from './IncidentTable';

const UserDashboard = ({ incidents, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');

  const filteredIncidents = incidents
    .filter(incident => {
      const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !filterStatus || incident.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const handleCreateIncident = async (formData) => {
    try {
      await incidentAPI.create(formData);
      toast.success('Incident reported successfully!');
      setShowForm(false);
      onRefresh();
    } catch (error) {
      toast.error('Failed to create incident');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Incidents</h1>
        <p className="text-gray-600">Report and track your security incidents</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Report New Incident
        </button>

        <div className="flex-1 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search incidents..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="input-field w-48"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            className="input-field w-48"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="-createdAt">Sort by Date</option>
            <option value="priority">Sort by Priority</option>
          </select>
        </div>
      </div>

      <IncidentTable incidents={filteredIncidents} />

      {showForm && (
        <IncidentForm
          onSubmit={handleCreateIncident}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default UserDashboard;
