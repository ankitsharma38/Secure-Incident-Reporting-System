import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, User, Bell } from 'lucide-react';
import socket from '../services/socket';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!user) return;

    const handleNewIncident = (incident) => {
      console.log('New incident event received:', incident, 'User role:', user.role);
      if (user.role === 'admin' || user.role === 'superadmin') {
        setNotifications(prev => [{
          id: Date.now(),
          message: `New incident: ${incident.title}`,
          time: new Date().toLocaleTimeString(),
          read: false
        }, ...prev]);
      }
    };

    const handleUserIncidentUpdated = (incident) => {
      console.log('User incident updated event received:', incident);
      if (user.role === 'user') {
        setNotifications(prev => [{
          id: Date.now(),
          message: `Your incident "${incident.title}" was updated to ${incident.status}`,
          time: new Date().toLocaleTimeString(),
          read: false
        }, ...prev]);
      }
    };

    socket.on('newIncident', handleNewIncident);
    socket.on('userIncidentUpdated', handleUserIncidentUpdated);

    const handleClickOutside = (e) => {
      if (showNotifications && !e.target.closest('.notification-container')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      socket.off('newIncident');
      socket.off('userIncidentUpdated');
      document.removeEventListener('click', handleClickOutside);
    };
  }, [user, showNotifications]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const markAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-primary" />
            <Link to="/dashboard" className="ml-2 text-xl font-bold text-gray-900">
              SecureReport
            </Link>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <Link to="/dashboard" className="hidden md:block text-gray-700 hover:text-primary">Dashboard</Link>
            {user?.role !== 'user' && (
              <Link to="/incidents" className="hidden md:block text-gray-700 hover:text-primary">All Incidents</Link>
            )}
            {user?.role === 'superadmin' && (
              <>
                <Link to="/users" className="hidden md:block text-gray-700 hover:text-primary">Users</Link>
                <Link to="/audit" className="hidden md:block text-gray-700 hover:text-primary">Audit Logs</Link>
              </>
            )}
            
            <div className="flex items-center space-x-4">
              <div className="relative notification-container">
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications) markAsRead();
                  }}
                  className="relative text-gray-700 hover:text-primary"
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">No notifications</div>
                    ) : (
                      <div>
                        {notifications.map(notif => (
                          <div key={notif.id} className={`p-4 border-b hover:bg-gray-50 ${!notif.read ? 'bg-blue-50' : ''}`}>
                            <p className="text-sm text-gray-900">{notif.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 border-l pl-2 md:pl-4">
                <User className="h-5 w-5 text-gray-600" />
                <span className="hidden sm:block text-sm text-gray-700">{user?.name}</span>
                <span className="text-xs bg-primary text-white px-2 py-1 rounded">{user?.role}</span>
                <button onClick={handleLogout} className="text-danger hover:text-red-700">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
