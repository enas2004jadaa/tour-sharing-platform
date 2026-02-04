import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';
import TicketsManagement from './TicketsManagement/TicketsManagement';
import { useNavigate } from 'react-router-dom';
import UsersManagement from './UsersManagement/UsersManagement';
import ToursManagement from './ToursManagement/ToursManagement';
import UserModal from './Modal/UserModal';
import TourModal from './Modal/TourModal';
import StatCard from './StatCard/StatCard';
import DashboardOverview from './Overview/DashboardOverview';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTours: 0,
    pendingTours: 0,
    openTickets: 0
  });
  const [users, setUsers] = useState([]);
  const [tours, setTours] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTour, setSelectedTour] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showTourModal, setShowTourModal] = useState(false);
  const [logs, setLogs] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    
    const token = localStorage.getItem('token');
    const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
    
    if(!token) {
      navigate('/login');
      return;
    }
    if(payload.role !== 'admin' && payload.role !== 'moderator') {
      navigate('/');
      return;
    }
    if(payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }
      setCurrentUserId(payload.userId);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [usersRes, toursRes, ticketsRes, logsRes] = await Promise.all([
        axios.get('http://localhost:5000/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/admin/tours', {
          headers: { Authorization: `Bearer ${token}` }
        }),
         axios.get('http://localhost:5000/admin/tickets', {
            headers: { Authorization: `Bearer ${token}` }
         }),
         axios.get('http://localhost:5000/admin/logs', {
            headers: { Authorization: `Bearer ${token}` }
         })
      ]);

      setUsers(usersRes.data);
      setTours(toursRes.data);
      setTickets(ticketsRes.data);
      setLogs(logsRes.data);
      
      setStats({
        totalUsers: usersRes.data.length,
        totalTours: toursRes.data.length,
        pendingTours: toursRes.data.filter(tour => tour.status === 'pending').length,
        openTickets: ticketsRes.data.filter(ticket => ticket.status === 'open').length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {    
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleDeleteTour = async (tourId, action, status) => {
    if (!window.confirm('Are you sure you want to delete this tour?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/admin/tours/${tourId}`, {
        data: { action },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (action === true) {
        setTours(tours.filter(tour => tour._id !== tourId));
        setStats(prev => ({ ...prev, totalTours: prev.totalTours - 1 }));
      } else {
        setTours(tours.map(tour => 
          tour._id === tourId ? { ...tour, isDeleted: false, status: status } : tour
        ));
      }
    } catch (error) {
      console.error('Error deleting tour:', error);
    }
};

  const handleApproveTour = async (tourId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/admin/tours/${tourId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTours(tours.map(tour => 
        tour._id === tourId ? { ...tour, status: 'approved' } : tour
      ));
      setStats(prev => ({ ...prev, pendingTours: prev.pendingTours - 1 }));
    } catch (error) {
      console.error('Error approving tour:', error);
    }
  };

  const handleRejectTour = async (tourId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/admin/tours/${tourId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTours(tours.map(tour => 
        tour._id === tourId ? { ...tour, status: 'rejected' } : tour
      ));
      setStats(prev => ({ ...prev, pendingTours: prev.pendingTours - 1 }));
    } catch (error) {
      console.error('Error rejecting tour:', error);
    }
  };

  const updateUserRole = async (userId, roleId) => {
    console.log(`user Id=> ${userId} , Role => ${roleId}`);
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/admin/users/${userId}/role`, 
        { role : roleId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: roleId } : user
      ));
      setShowUserModal(false);
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="header-content-admin">
          <h1>Admin Dashboard</h1>
          <p>Manage your platform efficiently</p>
        </div>
        <div className="admin-actions">
          <button className="admin-btn primary" onClick={()=> navigate('/')}>
              Go to Main Site
          </button>
        </div>
      </div>



      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
          </svg>
          Dashboard
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A2.01 2.01 0 0 0 18.06 7h-2.12c-.93 0-1.76.53-2.18 1.37L11.5 16H8v-4c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v4H0v6h6v-4c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v4h6z"/>
          </svg>
          Users ({users.length})
        </button>
        <button 
          className={`tab ${activeTab === 'tours' ? 'active' : ''}`}
          onClick={() => setActiveTab('tours')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          Tours ({tours.length})
        </button>
        <button 
          className={`tab ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
          </svg>
          Support Tickets
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'dashboard' && 
        <>
      <div className="stats-grid">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon="👥"
          color="#667eea"
          trend="+12%"
        />
        <StatCard
          title="Total Tours"
          value={stats.totalTours}
          icon="🗺️"
          color="#764ba2"
          trend="+8%"
        />
        <StatCard
          title="Pending Tours"
          value={stats.pendingTours}
          icon="⏳"
          color="#f093fb"
          trend={stats.pendingTours > 0 ? "Needs Attention" : "All Clear"}
        />
        <StatCard
          title="Open Tickets"
          value={stats.openTickets}
          icon="🎫"
          color="#4fd1c5"
          trend={stats.openTickets > 0 ? "Needs Review" : "All Clear"}
        />
      </div>
        <DashboardOverview logs={logs} /></>}
        {activeTab === 'users' && (
          <UsersManagement 
            users={users}
            onDeleteUser={handleDeleteUser}
            onEditUser={(user) => {
              setSelectedUser(user);
              setShowUserModal(true);
            }}
          />
        )}
       {activeTab === 'tours' && (
  <ToursManagement 
    tours={tours}
    onDeleteTour={handleDeleteTour}
    onApproveTour={handleApproveTour}
    onRejectTour={handleRejectTour}
    onViewTour={(tour) => {
      setSelectedTour(tour);
      setShowTourModal(true);
    }}
    currentUserRole={JSON.parse(atob(localStorage.getItem('token').split('.')[1])).role}
  />
)}
        {activeTab === 'tickets' && <TicketsManagement tickets={tickets} />}
      </div>

      {showUserModal && (
        <UserModal
          user={selectedUser}
          onClose={() => setShowUserModal(false)}
          onUpdateRole={updateUserRole}
        />
      )}

      {showTourModal && (
        <TourModal
          tour={selectedTour}
          onClose={() => setShowTourModal(false)}
        />
      )}
    </div>
  );
};





export default AdminDashboard;