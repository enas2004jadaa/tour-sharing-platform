import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../CreateTour/createTours.css'

// Configure leaflet marker icons
try {
  delete L.Icon.Default.prototype._getIconUrl;
} catch (e) {}
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

function EditLocationPicker({ onLocationSelect, position }) {
  const [markerPosition, setMarkerPosition] = useState(position);
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);
      try {
        const address = await reverseGeocode(lat, lng);
        const locName = extractLocationName(address);
        onLocationSelect(locName, lat, lng);
      } catch (err) {
        onLocationSelect(`Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`, lat, lng);
      }
    }
  });
  return markerPosition ? (
    <Marker position={markerPosition}>
      <Popup>
        <div><strong>Selected Location</strong><br />{markerPosition[0].toFixed(6)}, {markerPosition[1].toFixed(6)}</div>
      </Popup>
    </Marker>
  ) : null;
}

const reverseGeocode = async (lat, lng) => {
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
  if (!response.ok) throw new Error('Geocoding failed');
  const data = await response.json();
  return data.display_name || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
};

const extractLocationName = (fullAddress) => {
  if (!fullAddress) return 'Unknown Location';
  const parts = fullAddress.split(',').map(p => p.trim());
  const filtered = parts.filter(part => {
    if (/^[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d/.test(part)) return false;
    if (/^\d{5}/.test(part)) return false;
    if (/^\d+$/.test(part)) return false;
    if (part.includes('Street') || part.includes('Avenue') || part.includes('Road')) return false;
    return true;
  });
  if (filtered.length >= 2) return `${filtered[0]}, ${filtered[filtered.length - 1]}`;
  return fullAddress;
};

function EditTourDialog({ tour, onClose, onUpdated }) {
  const [formData, setFormData] = useState(() => ({
    name: tour?.name || '',
    description: tour?.description || '',
    images: tour?.images ? tour.images.slice() : [],
    videos: tour?.videos ? tour.videos.slice() : [],
    location: tour?.location || '',
    coordinates: tour?.coordinates || { lat: null, lng: null },
    category: tour?.category?._id || ''
  }));
  const [imagePreviews, setImagePreviews] = useState(tour?.images ? tour.images.slice() : []);
  const [videoPreview, setVideoPreview] = useState(tour?.videos?.[0] || null);
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [categories, setCategories] = useState([]);
  const [updating, setUpdating] = useState(false);
  useEffect(() => {
    if (tour) {
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        const dialogElement = document.querySelector('.create-tour-dialog');
        if (dialogElement) {
          dialogElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 50);
    }
  }, [tour]);

  useEffect(() => {
    fetchCategories();
  }, []);

    useEffect(() => {
      if (!tour) return;
      setFormData({
        name: tour.name || '',
        description: tour.description || '',
        images: Array.isArray(tour.images) ? tour.images.slice() : [],
        videos: Array.isArray(tour.videos) ? tour.videos.slice() : [],
        location: tour.location || '',
        coordinates: tour.coordinates || { lat: null, lng: null },
        category: tour.category?._id || ''
      });
      setImagePreviews(Array.isArray(tour.images) ? tour.images.slice() : []);
      setVideoPreview(tour.videos?.[0] || null);
      setShowMapDialog(false);
      setUpdating(false);
    }, [tour]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imagePreviews.length > 5) {
      alert('You can only have up to 5 images');
      return;
    }
    const newPreviews = [];
    const fileObjects = [];
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 5 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        newPreviews.push(ev.target.result);
        if (newPreviews.length === files.length) {
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
      fileObjects.push(file);
    });
    setFormData(prev => ({ ...prev, images: [...prev.images, ...fileObjects] }));
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) { alert('Select a video file'); return; }
    if (file.size > 50 * 1024 * 1024) { alert('Video must be < 50MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setVideoPreview(ev.target.result);
    reader.readAsDataURL(file);
    setFormData(prev => ({ ...prev, videos: [file] }));
  };

  const removeVideo = () => {
    setVideoPreview(null);
    setFormData(prev => ({ ...prev, videos: [] }));
  };

  const handleLocationSelect = (location, lat, lng) => {
    setFormData(prev => ({ ...prev, location, coordinates: { lat, lng } }));
    setShowMapDialog(false);
  };

  const getInitialMapLocation = () => {
    if (formData.coordinates.lat && formData.coordinates.lng) {
      return { lat: formData.coordinates.lat, lng: formData.coordinates.lng };
    }
    return null;
  };

  const uploadToCloudinary = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', 'tours_media');
    const response = await axios.post('https://api.cloudinary.com/v1_1/dorpys3di/upload', fd);
    return response.data.secure_url;
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const existingImageUrls = formData.images.filter(i => typeof i === 'string');
      const newImageFiles = formData.images.filter(i => typeof i !== 'string');
      const uploadedImageUrls = [];
      for (const img of newImageFiles) {
        const url = await uploadToCloudinary(img);
        uploadedImageUrls.push(url);
      }
      const finalImages = existingImageUrls.concat(uploadedImageUrls);
      const existingVideoUrls = formData.videos.filter(v => typeof v === 'string');
      const newVideoFiles = formData.videos.filter(v => typeof v !== 'string');
      const uploadedVideoUrls = [];
      for (const vid of newVideoFiles) {
        const url = await uploadToCloudinary(vid);
        uploadedVideoUrls.push(url);
      }
      const finalVideos = existingVideoUrls.concat(uploadedVideoUrls).slice(0, 1);
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5000/tours/${tour._id}`,
        {
          name: formData.name,
          description: formData.description,
          images: finalImages,
          videos: finalVideos,
          location: formData.location,
          coordinates: formData.coordinates,
          category: formData.category,
          status: 'pending',
          edited: true
        },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      const updatedTour = response.data;
      onUpdated && onUpdated(updatedTour);
      alert('Tour updated successfully. It has been sent back for admin approval.');
    } catch (err) {
      console.error('Error updating tour:', err);
      alert('Failed to update tour');
      setUpdating(false);
    }
    window.location.reload();
  };

  if (!tour) return null;

  return (
    <div className="dialog-overlay">
      <div className="create-tour-dialog">
        <div className="dialog-header">
          <h2>Edit Tour</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form className="tour-form" onSubmit={submitEdit}>
          <div className="form-group">
            <label className="form-label">Tour Name *</label>
            <input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select name="category" className="form-input" value={formData.category} onChange={handleInputChange} required>
              <option value="">Select a category</option>
              {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea name="description" className="form-textarea" rows="4" value={formData.description} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Images ({imagePreviews.length}/5)</label>
            <div className="upload-container">
              <input type="file" id="edit-image-upload" multiple accept="image/*" onChange={handleImageUpload} className="file-input-hidden" disabled={imagePreviews.length >= 5} />
              <label htmlFor="edit-image-upload" className={`upload-area ${imagePreviews.length >= 5 ? 'disabled' : ''}`}>
                <div className="upload-icon">📷</div>
                <div className="upload-text">Click to upload images (Max 5)</div>
                <div className="upload-subtext">PNG, JPG up to 5MB</div>
              </label>
            </div>
            {imagePreviews.length > 0 && (
              <div className="image-previews">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="image-preview">
                    <img src={preview} alt={`Preview ${idx+1}`} />
                    <button type="button" className="remove-image" onClick={() => removeImage(idx)}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Video (Optional)</label>
            <div className="upload-container">
              <input type="file" id="edit-video-upload" accept="video/*" onChange={handleVideoUpload} className="file-input-hidden" disabled={!!videoPreview} />
              <label htmlFor="edit-video-upload" className={`upload-area ${videoPreview ? 'disabled' : ''}`}>
                <div className="upload-icon">🎥</div>
                <div className="upload-text">Click to upload video</div>
                <div className="upload-subtext">MP4, MOV up to 50MB</div>
              </label>
            </div>
            {videoPreview && (
              <div className="video-preview">
                <video controls>
                  <source src={videoPreview} />
                </video>
                <button type="button" className="remove-video" onClick={removeVideo}>×</button>
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Location *</label>
            <div className="location-section">
              <input type="text" className="form-input" readOnly value={formData.location} placeholder="Select location from map..." />
              <button type="button" className="map-button" onClick={() => setShowMapDialog(true)}>🗺️ Select from Map</button>
            </div>
            {formData.coordinates.lat && (
              <div className="coordinates">
                <div className="location-address">{formData.location}</div>
                <div className="location-coords">Coordinates: {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}</div>
              </div>
            )}
          </div>
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={updating}>Cancel</button>
            <button type="submit" className="submit-btn" disabled={updating || !formData.name || !formData.description || !formData.category || !formData.location || imagePreviews.length === 0}>{updating ? 'Updating...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
      {showMapDialog && (
        <div className="map-dialog-overlay">
          <div className="map-dialog">
            <div className="map-dialog-header">
              <h3>Select Location on Map</h3>
              <button className="close-button" onClick={() => setShowMapDialog(false)}>×</button>
            </div>
            <div className="map-dialog-content">
              <div className="map-instructions"><p>📍 Click anywhere on the map to select a location</p></div>
              <div className="map-container">
                <MapContainer center={getInitialMapLocation() ? [getInitialMapLocation().lat, getInitialMapLocation().lng] : [51.505, -0.09]} zoom={13} style={{ height: '400px', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                  <EditLocationPicker onLocationSelect={handleLocationSelect} position={formData.coordinates.lat ? [formData.coordinates.lat, formData.coordinates.lng] : null} />
                </MapContainer>
              </div>
              <div className="map-dialog-actions">
                <button className="cancel-btn" onClick={() => setShowMapDialog(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditTourDialog;
