import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './createTours.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationPicker({ onLocationSelect, position }) {
  const [markerPosition, setMarkerPosition] = useState(position);

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);
      
      try {
        const address = await reverseGeocode(lat, lng);
        const locationName = extractLocationName(address);
        onLocationSelect(locationName, lat, lng);
      } catch (error) {
        console.error('Geocoding error:', error);
        onLocationSelect(`Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`, lat, lng);
      }
    },
  });

  return markerPosition ? (
    <Marker position={markerPosition}>
      <Popup>
        <div>
          <strong>Selected Location</strong>
          <br />
          {markerPosition[0].toFixed(6)}, {markerPosition[1].toFixed(6)}
        </div>
      </Popup>
    </Marker>
  ) : null;
}

const extractLocationName = (fullAddress) => {
  if (!fullAddress) return 'Unknown Location';
  
  const parts = fullAddress.split(',').map(part => part.trim());
  
  const filteredParts = parts.filter(part => {
    if (/^[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d/.test(part)) return false; 
    if (/^\d{5}/.test(part)) return false; 
    if (/^\d+$/.test(part)) return false; 
    if (part.includes('Street') || part.includes('Avenue') || part.includes('Road')) return false;
    return true;
  });
  
  if (filteredParts.length >= 2) {
    return `${filteredParts[0]}, ${filteredParts[filteredParts.length - 1]}`;
  }
  
  return fullAddress;
};

const reverseGeocode = async (lat, lng) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
  );
  
  if (!response.ok) {
    throw new Error('Geocoding failed');
  }
  
  const data = await response.json();
  return data.display_name || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
};

const searchLocations = async (query) => {
  if (!query.trim()) return [];
  
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
  );
  
  if (!response.ok) {
    throw new Error('Search failed');
  }
  
  const data = await response.json();
  return data.map(item => ({
    name: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon)
  }));
};

const MapDialog = ({ onLocationSelect, onClose, initialLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [customLocationName, setCustomLocationName] = useState('');

  const handleLocationSelect = (address, lat, lng) => {
    setSelectedLocation({ address, lat, lng });
    if (!customLocationName) {
      setCustomLocationName(address);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    try {
      const results = await searchLocations(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleSearchResultClick = (location) => {
    const locationName = extractLocationName(location.name);
    setSelectedLocation({
      address: locationName,
      lat: location.lat,
      lng: location.lng
    });
    setCustomLocationName(locationName);
    setSearchResults([]);
    setSearchTerm('');
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      const finalLocationName = customLocationName.trim() || selectedLocation.address;
      onLocationSelect(finalLocationName, selectedLocation.lat, selectedLocation.lng);
    }
  };

  const handleCustomNameChange = (e) => {
    setCustomLocationName(e.target.value);
  };

  const initialPosition = initialLocation 
    ? [initialLocation.lat, initialLocation.lng] 
    : [51.505, -0.09]; 

  return (
    <div className="map-dialog-overlay">
      <div className="map-dialog">
        <div className="map-dialog-header">
          <h3>Select Location on Map</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="map-dialog-content">
          <div className="map-instructions">
            <p>📍 Click anywhere on the map to select a location</p>
          </div>

          <div className="map-search-section">
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Search for locations (city, address, landmark)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="map-search-input"
              />
              <button 
                onClick={handleSearch} 
                disabled={searching}
                className="search-button-map"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="search-result-item"
                    onClick={() => handleSearchResultClick(result)}
                  >
                    <div className="result-name">{extractLocationName(result.name)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="map-container">
            <MapContainer
              center={initialPosition}
              zoom={13}
              style={{ height: '400px', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationPicker 
                onLocationSelect={handleLocationSelect}
                position={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : null}
              />
            </MapContainer>
          </div>

          <div className="custom-location-section">
            <label className="form-label">Location Name *</label>
            <input
              type="text"
              placeholder="Enter a name for this location (e.g., Eiffel Tower, Paris)"
              value={customLocationName}
              onChange={handleCustomNameChange}
              className="form-input"
            />
            <div className="location-name-hint">
              You can customize the location name or use the auto-detected one
            </div>
          </div>
          
          {selectedLocation && (
            <div className="selected-location-info">
              <div className="location-details">
                <strong>Selected Coordinates:</strong>
                <div className="location-coordinates">
                  {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </div>
                {customLocationName && (
                  <div className="custom-name-preview">
                    <strong>Location Name:</strong> {customLocationName}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="map-dialog-actions">
            <button className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button 
              className="confirm-btn" 
              onClick={handleConfirm}
              disabled={!selectedLocation || !customLocationName.trim()}
            >
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function CreateTour() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [userId, setUserId] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    images: [],
    videos: [],
    location: '',
    coordinates: { lat: null, lng: null },
    category: '',
    publisher: userId
  });
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreview, setVideoPreview] = useState(null);
  const [mapDialog, setMapDialog] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState({ 
    show: false, 
    message: '', 
    type: '' 
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUserId(null);
    } else {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.userId);
    }

    fetchCategories();
  }, []);

  // Function to show notifications
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    // Auto hide after 5 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000);
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showNotification('Failed to load categories', 'error');
    }
  };

  const viewDialogCreateTour = () => {
    if (!user?.id) {
      navigate("/login");
      return;
    }
    setShowDialog(true);
  };

  const closeDialog = () => {
    navigate(-1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + imagePreviews.length > 5) {
      showNotification('You can only upload up to 5 images', 'error');
      return;
    }

    const newImagePreviews = [];
    const newImages = [];

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        showNotification('Please select only image files', 'error');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size should be less than 5MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        newImagePreviews.push(e.target.result);
        if (newImagePreviews.length === files.length) {
          setImagePreviews(prev => [...prev, ...newImagePreviews]);
        }
      };
      reader.readAsDataURL(file);

      newImages.push(file);
    });

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      showNotification('Please select a video file', 'error');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      showNotification('Video size should be less than 50MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setVideoPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    setFormData(prev => ({
      ...prev,
      videos: [file]
    }));
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeVideo = () => {
    setVideoPreview(null);
    setFormData(prev => ({
      ...prev,
      videos: []
    }));
  };

  const handleLocationSelect = (location, lat, lng) => {
    setFormData(prev => ({
      ...prev,
      location,
      coordinates: { lat, lng }
    }));
    setMapDialog(false);
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'tours_media');
    
    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dorpys3di/upload',
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      showNotification('Please log in to create a tour', 'error');
      return;
    }
    setLoading(true);
    try {
      const imageUrls = [];
      for (const image of formData.images) {
        const imageUrl = await uploadToCloudinary(image);
        imageUrls.push(imageUrl);
      }

      const videoUrls = [];
      for (const video of formData.videos) {
        const videoUrl = await uploadToCloudinary(video);
        videoUrls.push(videoUrl);
      }

      const tourData = {
        ...formData,
        images: imageUrls,
        videos: videoUrls,
        publisher: userId
      };

      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/tours', tourData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }).then((res) => {
        console.log('Tour created:', res.data);
        // Show success notification instead of alert
        showNotification('Tour submitted successfully! Your tour is now waiting for admin approval.', 'success');
        
        // Navigate home after a short delay
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 5000);
        
      }).catch((error) => {
        console.error('Error creating tour:', error);
        showNotification('Failed to create tour. Please try again.', 'error');
      });
      
    } catch (error) {
      console.error('Error creating tour:', error);
      showNotification('Error creating tour. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getInitialMapLocation = () => {
    if (formData.coordinates.lat && formData.coordinates.lng) {
      return { lat: formData.coordinates.lat, lng: formData.coordinates.lng };
    }
    return null;
  };

  return (
    <>
      <div className="create-tour-container">
        <div className="create-tour-form">
          <div className="dialog-header">
            <h2>Create New Tour</h2>
          </div>

          <form className="tour-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Tour Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Enter an engaging tour name..."
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                name="category"
                className="form-input"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                name="description"
                className="form-textarea"
                placeholder="Describe your tour experience in detail..."
                rows="4"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Images ({imagePreviews.length}/5) *
              </label>
              <div className="upload-container">
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file-input-hidden"
                  disabled={imagePreviews.length >= 5}
                />
                <label 
                  htmlFor="image-upload" 
                  className={`upload-area ${imagePreviews.length >= 5 ? 'disabled' : ''}`}
                >
                  <div className="upload-icon">📷</div>
                  <div className="upload-text">
                    Click to upload images (Max 5)
                  </div>
                  <div className="upload-subtext">
                    PNG, JPG up to 5MB
                  </div>
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <div className="image-previews">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="image-preview">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      <button 
                        type="button"
                        className="remove-image"
                        onClick={() => removeImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Video (Optional)</label>
              <div className="upload-container">
                <input
                  type="file"
                  id="video-upload"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="file-input-hidden"
                  disabled={videoPreview}
                />
                <label 
                  htmlFor="video-upload" 
                  className={`upload-area ${videoPreview ? 'disabled' : ''}`}
                >
                  <div className="upload-icon">🎥</div>
                  <div className="upload-text">
                    Click to upload video
                  </div>
                  <div className="upload-subtext">
                    MP4, MOV up to 50MB
                  </div>
                </label>
              </div>

              {videoPreview && (
                <div className="video-preview">
                  <video controls>
                    <source src={videoPreview} />
                    Your browser does not support the video tag.
                  </video>
                  <button 
                    type="button"
                    className="remove-video"
                    onClick={removeVideo}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Location *</label>
              <div className="location-section">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Select location from map..."
                  value={formData.location}
                  readOnly
                />
                <button 
                  type="button"
                  className="map-button"
                  onClick={() => setMapDialog(true)}
                >
                  🗺️ Select from Map
                </button>
              </div>
              {formData.coordinates.lat && (
                <div className="coordinates">
                  <div className="location-address">{formData.location}</div>
                  <div className="location-coords">
                    Coordinates: {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={closeDialog}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading || !formData.name || !formData.description || !formData.category || !formData.location || imagePreviews.length === 0}
              >
                {loading ? 'Creating Tour...' : 'Create Tour'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Notification Component */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <span className="notification-icon">
              {notification.type === 'success' ? '✅' : '❌'}
            </span>
            <span className="notification-text">{notification.message}</span>
            <button 
              className="notification-close"
              onClick={() => setNotification({ show: false, message: '', type: '' })}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {mapDialog && (
        <MapDialog 
          onLocationSelect={handleLocationSelect}
          onClose={() => setMapDialog(false)}
          initialLocation={getInitialMapLocation()}
        />
      )}
    </>
  );
}

export default CreateTour;