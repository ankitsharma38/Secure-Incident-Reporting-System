import { useState, useEffect } from 'react';
import { auditAPI } from '../services/api';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { FileText } from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ targetType: '', startDate: '', endDate: '' });

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      const { data } = await auditAPI.getLogs(filters);
      setLogs(data);
    } catch (error) {
      toast.error('Failed to fetch audit logs');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Audit Logs</h1>

        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              className="input-field"
              value={filters.targetType}
              onChange={(e) => setFilters({ ...filters, targetType: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="Incident">Incident</option>
              <option value="User">User</option>
            </select>

            <input
              type="date"
              className="input-field"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              placeholder="Start Date"
            />

            <input
              type="date"
              className="input-field"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              placeholder="End Date"
            />
          </div>
        </div>

        <div className="card">
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log._id} className="border-l-4 border-primary pl-4 py-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">{log.action}</p>
                      <p className="text-sm text-gray-600">
                        by {log.performedBy?.name} ({log.performedBy?.email})
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Target: {log.targetType} | IP: {log.ipAddress}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {logs.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No audit logs found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
