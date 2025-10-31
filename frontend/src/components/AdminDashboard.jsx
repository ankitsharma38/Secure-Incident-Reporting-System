import { useState, useEffect } from 'react';
import { incidentAPI } from '../services/api';
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import IncidentTable from './IncidentTable';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const AdminDashboard = ({ incidents, onRefresh }) => {
  const [analytics, setAnalytics] = useState(null);
  const [filters, setFilters] = useState({ status: '', category: '', priority: '' });

  useEffect(() => {
    fetchAnalytics();
  }, [incidents]);

  const fetchAnalytics = async () => {
    try {
      const { data } = await incidentAPI.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics');
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    return (!filters.status || incident.status === filters.status) &&
           (!filters.category || incident.category === filters.category) &&
           (!filters.priority || incident.priority === filters.priority);
  });

  const statusData = [
    { name: 'Open', value: analytics?.openIncidents || 0 },
    { name: 'Resolved', value: analytics?.resolvedIncidents || 0 }
  ];

  const categoryData = analytics?.categoryStats?.map(stat => ({
    name: stat._id,
    count: stat.count
  })) || [];

  const avgResolutionHours = analytics?.avgResolutionTime 
    ? (analytics.avgResolutionTime / (1000 * 60 * 60)).toFixed(1) 
    : 0;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Incidents</p>
              <p className="text-3xl font-bold text-gray-900">{analytics?.totalIncidents || 0}</p>
            </div>
            <AlertCircle className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Open Incidents</p>
              <p className="text-3xl font-bold text-warning">{analytics?.openIncidents || 0}</p>
            </div>
            <Clock className="h-12 w-12 text-warning" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Resolved</p>
              <p className="text-3xl font-bold text-success">{analytics?.resolvedIncidents || 0}</p>
            </div>
            <CheckCircle className="h-12 w-12 text-success" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Resolution Time</p>
              <p className="text-3xl font-bold text-secondary">{avgResolutionHours}h</p>
            </div>
            <TrendingUp className="h-12 w-12 text-secondary" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Incidents by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

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

      <IncidentTable incidents={filteredIncidents} isAdmin onRefresh={onRefresh} />
    </div>
  );
};

export default AdminDashboard;
