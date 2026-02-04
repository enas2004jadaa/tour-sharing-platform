import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
        const locationName = extractProvinceCountry(address);
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


const extractProvinceCountry = (fullAddress) => {
  if (!fullAddress) return 'Unknown Location';
  
  const parts = fullAddress.split(',').map(part => part.trim());
  
  if (parts.length >= 2) {
    const province = parts[parts.length - 2];
    const country = parts[parts.length - 1];
    return `${province}, ${country}`;
  }
  
  return parts[parts.length - 1] || 'Unknown Location';
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

const handleLocationSelect = (address, lat, lng) => {
  const locationName = extractProvinceCountry(address);
  setSelectedLocation({ address: locationName, lat, lng });
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
  const locationName = extractProvinceCountry(location.name);
  
  setSelectedLocation({
    address: locationName,
    lat: location.lat,
    lng: location.lng
  });
  setSearchResults([]);
  setSearchTerm('');
};

const extractProvinceCountry = (fullAddress) => {
  if (!fullAddress) return 'Unknown Location';
  
  const parts = fullAddress.split(',').map(part => part.trim());
  
  if (parts.length >= 2) {
    const province = parts[parts.length - 2];
    const country = parts[parts.length - 1];
    return `${province}, ${country}`;
  }
  
  return parts[parts.length - 1] || 'Unknown Location';
};

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation.address, selectedLocation.lat, selectedLocation.lng);
      log("selectedLocation =>", selectedLocation);
    }
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
                className="search-button"
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
                    <div className="result-name">{result.name}</div>
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
          
          {selectedLocation && (
            <div className="selected-location-info">
              <div className="location-details">
                <strong>Selected Location:</strong>
                <div className="location-address">{selectedLocation.address}</div>
                <div className="location-coordinates">
                  Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </div>
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
              disabled={!selectedLocation}
            >
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapDialog;