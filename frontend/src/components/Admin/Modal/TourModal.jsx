import React from 'react'
import './tourModal.css';
function TourModal({ tour, onClose }) {
return (
  <div className="modal-overlay">
    <div className="modal large">
      <div className="modal-header">
        <h2>Tour Details</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      <div className="modal-content">
        <div className="tour-details">
          <div className="tour-images">
            {tour.images && tour.images.map((img, index) => (
              <img className='tour-image' key={index} src={img} alt={`Tour ${index + 1}`} />
            ))}
          </div>
          <div className="tour-info-modal">
            <h3>{tour.name}</h3>
            <p>{tour.description}</p>
            <div className="tour-meta">
              <span><strong>Location:</strong> {tour.location}</span>
              <span><strong>Category:</strong> {tour.category?.name}</span>
              <span><strong>Status:</strong> {tour.status}</span>
              <span><strong>Created:</strong> {new Date(tour.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}

export default TourModal