import React, { useState, useRef, useEffect } from 'react'
import './navbar.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Navbar({ onSearchResults = null, onTourSelect = null }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [userId, setUserId] = useState(null);
  const profileDialogRef = useRef(null);
  const editDialogRef = useRef(null);
  const searchResultsRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchResultsLength , setSearchResultsLength] = useState(5);
  

  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    image: user?.image || ''
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDialogRef.current && !profileDialogRef.current.contains(event.target)) {
        setShowProfileDialog(false);
      }
      if (editDialogRef.current && !editDialogRef.current.contains(event.target)) {
        setShowEditDialog(false);
      }
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    const token = localStorage.getItem('token');
    if (!token) {
      setUserId(null);
    } else {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.userId);
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (user) {
      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        image: user.image || ''
      });
    }
  }, [user]);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      if (onSearchResults) {
        onSearchResults([]);
      }
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(`http://localhost:5000/tours/search?keyword=${encodeURIComponent(query)}`);

      setSearchResults(response.data.tours || []);
      setShowSearchResults(true);
      
      if (onSearchResults) {
        onSearchResults(response.data.tours || []);
      }
    } catch (error) {
      console.error('Error searching tours:', error);
      setSearchResults([]);
      if (onSearchResults) {
        onSearchResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchResultsLength(5)
    const query = e.target.value;
    setSearchQuery(query);
    
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(query);
    }, 300);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      handleSearch(searchQuery);
    }
  };

  const handleTourClick = (tour) => {
    setShowSearchResults(false);
    setSearchQuery('');
    if (onTourSelect) {
        onTourSelect(tour);
    }
};

  const handleViewAllResults = () => {
    setShowSearchResults(false);
    navigate(`/search?keyword=${encodeURIComponent(searchQuery)}`);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    if (onSearchResults) {
      onSearchResults([]);
    }
  };



  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowProfileDialog(false);
    navigate('/login');
  };

  const handleEditProfile = () => {
    setShowProfileDialog(false);
    setShowEditDialog(true);
  };

  const handleEditFormChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
        axios.put(`http://localhost:5000/users/${userId}`, editForm, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
        })
        .then((response) => {
        })
        .catch((error) => {
            console.error('Error updating profile:', error);
        });
        const updatedUser = { ...user, ...editForm };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setShowEditDialog(false);
    } catch (error) {
        console.error('Error updating profile:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      //please loading here
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'tours_media');
      axios.post('https://api.cloudinary.com/v1_1/dorpys3di/upload', formData)
        .then((response) => {
          setEditForm({
            ...editForm,
            image: response.data.secure_url
          });
          setIsUploading(false);
        })
        .catch((error) => {
          console.error('Error uploading image:', error);
          setIsUploading(false);
        });

    }
  };


  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className='navbar'>
      <div className='title-nav' onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
        Tour
      </div>

      <div className='search-box' ref={searchResultsRef}>
        <div className="search-input-container">
          <input 
            className='search-input' 
            type="text" 
            placeholder='Search tours, locations, categories...' 
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyPress={handleSearchSubmit}
            onFocus={() => searchQuery && setShowSearchResults(true)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={clearSearch}>
              ×
            </button>
          )}
          <button 
            className="search-button"
            onClick={handleSearchSubmit}
            disabled={isSearching}
          >
            {isSearching ? '...' : '🔍'}
          </button>
        </div>

        {showSearchResults && searchResults.length > 0 && (
          <div className="search-results-dropdown">
            <div className="search-results-header">
              <span>Search Results ({searchResults.length})</span>
            </div>
            {searchResults.slice(0, searchResultsLength).map((tour) => (
              <div 
                key={tour._id} 
                className="search-result-item"
                onClick={() => handleTourClick(tour)}
              >
                <img 
                  src={tour.images?.[0]} 
                  alt={tour.name}
                  className="search-result-image"
                />
                <div className="search-result-info">
                  <div className="search-result-title">{tour.name}</div>
                  <div className="search-result-location">{tour.location}</div>
                  <div className="search-result-category">{tour.category?.name}</div>
                </div>
              </div>
            ))}
            {searchResults.length > 5 && (
              <div 
                className="search-result-view-all"
                style={{display : searchResultsLength === searchResults.length ?  "none" : "block"}}
                onClick={()=> {setSearchResultsLength(searchResults.length)}}
              >
                View all {searchResults.length} results
              </div>
            )}
          </div>
        )}

        {showSearchResults && searchQuery && searchResults.length === 0 && !isSearching && (
          <div className="search-results-dropdown">
            <div className="no-results">No tours found for "{searchQuery}"</div>
          </div>
        )}
      </div>

      {user && user.role !== 'Visitor'  ? (
        <div className='user-info-nav'>
          <div 
            className='user-avatar-nav'
            onClick={() => setShowProfileDialog(!showProfileDialog)}
          >
            {user.image && user.image !== "https://i.ibb.co/HDy0pBt/user-1.png" ? (
              <img src={user.image} alt="Profile" className='avatar-image-nav' />
            ) : (
              <div className='avatar-initials'>
                {getInitials(user.firstName, user.lastName)}
              </div>
            )}
          </div>

          {showProfileDialog && (
            <div className="profile-dialog" ref={profileDialogRef}
            >
              <div className="dialog-header-nav" onClick={() => {navigate(`/profile/${userId}`); setShowProfileDialog(false)}}>
                <div className="dialog-avatar">
                  {user.image && user.image !== "https://i.ibb.co/HDy0pBt/user-1.png" ? (
                    <img src={user.image} alt="Profile" className='dialog-avatar-image' />
                  ) : (
                    <div className='dialog-avatar-initials'>
                      {getInitials(user.firstName, user.lastName)}
                    </div>
                  )}
                </div>
                <div className="dialog-user-info">
                  <h4>{user.firstName} {user.lastName}</h4>
                  <p>{user.email}</p>
                </div>
              </div>
              
              <div className="dialog-menu">
                <button 
                  className="dialog-item"
                  onClick={handleEditProfile}
                >
                  <span className="dialog-icon">👤</span>
                  Edit Profile
                </button>
                <div className="dialog-divider"></div>
                <button 
                  className="dialog-item logout-item"
                  onClick={handleLogout}
                >
                  <span className="dialog-icon">🚪</span>
                  Logout
                </button>
              </div>
            </div>
          )}

          {showEditDialog && (
            <div className="edit-dialog-overlay">
              <div className="edit-dialog" ref={editDialogRef}>
                <div className="edit-dialog-header">
                  <h3>Edit Profile</h3>
                  <button 
                    className="close-button"
                    onClick={() => setShowEditDialog(false)}
                  >
                    ×
                  </button>
                </div>

                <form className="edit-form" onSubmit={handleEditSubmit}>
                  <div className="form-section">
                    <h4>Profile Picture</h4>
                    <div className="image-upload-section">
                      <div className="current-avatar">
                        {editForm.image && editForm.image !== "https://i.ibb.co/HDy0pBt/user-1.png" ? (
                          <img src={editForm.image} alt="Current" className="current-avatar-image" />
                        ) : (
                          <div className="current-avatar-initials">
                            {getInitials(editForm.firstName, editForm.lastName)}
                          </div>
                        )}
                      </div>
                      <div className="upload-controls">
                        <input
                          type="file"
                          id="image-upload"
                          accept="image/*"
                          onChange={handleImageChange}
                          style={{ display: 'none' }}
                        />
                        <label htmlFor="image-upload" className="upload-button">
                          Change Photo
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        className="form-input"
                        value={editForm.firstName}
                        onChange={handleEditFormChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        className="form-input"
                        value={editForm.lastName}
                        onChange={handleEditFormChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea
                      name="bio"
                      className="form-textarea"
                      value={editForm.bio}
                      onChange={handleEditFormChange}
                      rows="3"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="cancel-button"
                      onClick={() => setShowEditDialog(false)}
                      disabled={isUploading}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="save-button"
                      disabled={isUploading}
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className='auth-buttons'>
          <button className='auth-button' onClick={() => navigate('/login')}>Login</button>
        </div>
      )}
    </div>
  )
}

export default Navbar;