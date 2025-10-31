import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { incidentAPI } from '../services/api';
import socket from '../services/socket';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import UserDashboard from '../components/UserDashboard';
import AdminDashboard from '../components/AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();

    socket.on('newIncident', (incident) => {
      if (user.role !== 'user') {
        setIncidents(prev => [incident, ...prev]);
      }
    });

    socket.on('incidentUpdated', (incident) => {
      setIncidents(prev => prev.map(i => i._id === incident._id ? incident : i));
    });

    return () => {
      socket.off('newIncident');
      socket.off('incidentUpdated');
    };
  }, [user]);

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
        {user.role === 'user' ? (
          <UserDashboard incidents={incidents} onRefresh={fetchIncidents} />
        ) : (
          <AdminDashboard incidents={incidents} onRefresh={fetchIncidents} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
