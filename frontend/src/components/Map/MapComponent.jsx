import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../LeftSide/CreateTour.css';
const MapComponent = ({ onLocationSelect, initialLocation }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const searchBoxRef = useRef(null);

  useEffect(() => {
    if (!window.google) {
      console.error('Google Maps API not loaded');
      return;
    }

    const map = new window.google.maps.Map(mapRef.current, {
      center: initialLocation || { lat: 40.7128, lng: -74.0060 },
      zoom: 10,
      styles: [
        {
          featureType: 'all',
          elementType: 'geometry',
          stylers: [{ color: '#f5f5f5' }]
        },
        {
          featureType: 'all',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#666666' }]
        },
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    mapInstanceRef.current = map;

    map.addListener('click', (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const address = results[0].formatted_address;
          onLocationSelect(address, lat, lng);
          
          if (markerRef.current) {
            markerRef.current.setPosition({ lat, lng });
          } else {
            markerRef.current = new window.google.maps.Marker({
              position: { lat, lng },
              map: map,
              animation: window.google.maps.Animation.DROP
            });
          }
        }
      });
    });

    const input = document.getElementById('map-search-input');
    if (input) {
      searchBoxRef.current = new window.google.maps.places.SearchBox(input);
      
      map.controls[window.google.maps.ControlPosition.TOP_LEFT].push(input);

      searchBoxRef.current.addListener('places_changed', () => {
        const places = searchBoxRef.current.getPlaces();

        if (places.length === 0) return;

        const place = places[0];
        if (!place.geometry) return;

        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else {
          map.setCenter(place.geometry.location);
          map.setZoom(17);
        }

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address;

        onLocationSelect(address, lat, lng);

        if (markerRef.current) {
          markerRef.current.setPosition({ lat, lng });
        } else {
          markerRef.current = new window.google.maps.Marker({
            position: { lat, lng },
            map: map,
            animation: window.google.maps.Animation.DROP
          });
        }
      });
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [onLocationSelect, initialLocation]);

  return (
    <div className="map-container">
      <input
        id="map-search-input"
        type="text"
        placeholder="Search for locations..."
        className="map-search-input"
      />
      <div ref={mapRef} className="map" style={{ height: '400px', width: '100%' }} />
    </div>
  );
};


export default MapComponent;