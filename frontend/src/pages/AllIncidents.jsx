import { useState, useEffect } from 'react';
import { incidentAPI } from '../services/api';
import socket from '../services/socket';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import IncidentTable from '../components/IncidentTable';
import { useAuth } from '../context/AuthContext';

const AllIncidents = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [filters, setFilters] = useState({ status: '', category: '', priority: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();

    socket.on('newIncident', (incident) => {
      setIncidents(prev => [incident, ...prev]);
    });

    socket.on('incidentUpdated', (incident) => {
      setIncidents(prev => prev.map(i => i._id === incident._id ? incident : i));
    });

    return () => {
      socket.off('newIncident');
      socket.off('incidentUpdated');
    };
  }, []);

  const fetchIncidents = async () => {
    try {
      const { data } = await incidentAPI.getAll();
      setIncidents(data);
    } catch (error) {
      toast.error('Failed to fetch incidents');
    } finally {
      setLoading(false);
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    return (!filters.status || incident.status === filters.status) &&
           (!filters.category || incident.category === filters.category) &&
           (!filters.priority || incident.priority === filters.priority);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">All Incidents</h1>

        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              className="input-field"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select
              className="input-field"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              <option value="Phishing">Phishing</option>
              <option value="Malware">Malware</option>
              <option value="Ransomware">Ransomware</option>
              <option value="Unauthorized Access">Unauthorized Access</option>
              <option value="Data Breach">Data Breach</option>
              <option value="DDoS">DDoS</option>
            </select>

            <select
              className="input-field"
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <IncidentTable incidents={filteredIncidents} isAdmin onRefresh={fetchIncidents} />
      </div>
    </div>
  );
};

export default AllIncidents;
