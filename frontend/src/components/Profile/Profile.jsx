import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './style.css';
import TourCard from '../Post/PostCard/PostCard';
import { useNavigate, useParams } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate()
  const params = useParams();
  const [user, setUser] = useState(null);
  const [myTours, setMyTours] = useState([]);
  const [savedTours, setSavedTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('myTours');
  const [myUserId, setMyUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setMyUserId(payload.userId);
    }
    if (params.userId && params.userId !== myUserId) {
      setSavedTours([]);
      return;
    }
  }, [params.userId, myUserId]);

  const fetchUserData = async () => {
    try {
      const { userId } = params;
      if (userId) {
        const response = await axios.get(`http://localhost:5000/users/${userId}`, );
        setUser(response.data.user);
        return;
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchMyTours = async () => {
    try {
      const { userId } = params;
      
      const response = await axios.get(`http://localhost:5000/tours/user/${userId}`);      
      setMyTours(response.data.tours);
    } catch (error) {
      console.error('Error fetching my tours:', error);
    }
  };

  const fetchSavedTours = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/tours/saved`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSavedTours(response.data);
    } catch (error) {
      console.error('Error fetching saved tours:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchUserData(),
        fetchMyTours(),
        fetchSavedTours()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="error-state">
          <h2>User not found</h2>
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="user-profile-header-profile">
        <div className="user-avatar-section-profile">
          <img 
            src={user?.image || '/default-avatar.png'} 
            alt={`${user?.firstName} ${user?.lastName}`}
            className="user-avatar-profile"
          />

        </div>
        
        <div className="user-info-section-profile">
          <div className='container-name-stats'>
            <h1 className="user-name-profile">{user?.firstName} {user?.lastName}</h1>
            <div className="user-stats-profile">
              <div className="stat-profile">
                <span className="stat-number-profile">{myTours.length || 0}</span>
                <span className="stat-label-profile">Created Tours</span>
              </div>
              {myUserId === user?._id && (
              <div className="stat-profile">
                <span className="stat-number-profile">{savedTours.length}</span>
                <span className="stat-label-profile">Saved Tours</span>
              </div>
              )}
            </div>
          </div>    
          <p className="user-bio-profile">{user?.bio || 'No bio yet. Tell us about yourself!'}</p>      

        </div>
      </div>
      {myUserId === user?._id && (
      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'myTours' ? 'active' : ''}`}
          onClick={() => setActiveTab('myTours')}
        >
        Tours ({myTours.length})
        </button>
        
        <button 
          className={`tab-button ${activeTab === 'savedTours' ? 'active' : ''}`}
          onClick={() => setActiveTab('savedTours')}
        >
          Saved Tours ({savedTours.length})
        </button>
        
      </div>
      )}
      <div className="tours-section">
        {activeTab === 'myTours' && (
          <div className="tours-content">
            <h2 className="section-title">{myUserId === user?._id ? 'My Created Tours' : `${user?.firstName}'s Created Tours`}</h2>
            {myTours.length > 0 ? (
              <TourCard tours={myTours} />
            ) : (
              <div className="empty-state">
                <h3>No tours created yet</h3>
                {myUserId === user?._id && (
                  <>
                    <p>Start creating your first tour to share your travel experiences!</p>
                    <button className="create-tour-btn" onClick={() => navigate('/create-tour')}>Create Your First Tour</button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'savedTours' && (
          <div className="tours-content">
            <h2 className="section-title">My Saved Tours</h2>
            {savedTours.length > 0 ? (
              <TourCard tours={savedTours}  />
            ) : (
              <div className="empty-state">
                <h3>No saved tours</h3>
                <p>Save tours you're interested in to see them here!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;