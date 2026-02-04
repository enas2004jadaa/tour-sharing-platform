import React from 'react';
import StarRating from './StarRating';

function RatingDialog({
  tour,
  visible,
  userRating,
  ratingScore,
  onClose,
  onChange,
  onSubmit,
  onDelete
}) {
  if (!visible) return null;
  return (
    <div className="rating-dialog-overlay">
      <div className="rating-dialog">
        <div className="rating-dialog-header">
          <h3>Rate this Tour</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="rating-dialog-content">
          <p>How would you rate "{tour.name}"?</p>
          <div className="interactive-rating">
            <StarRating
              tourId={tour._id}
              interactive={true}
              size={32}
              currentRating={userRating ? userRating.rating : 0}
              ratingScore={ratingScore || 0}
              onChange={onChange}
            />
            <div className="rating-score">{ratingScore || 0} / 5</div>
          </div>
          <div className="rating-actions">
            {userRating && (
              <button className="delete-rating-btn" onClick={() => onDelete(tour._id)}>
                Remove My Rating
              </button>
            )}
            <button
              className="submit-rating-btn"
              onClick={() => onSubmit(tour._id)}
              disabled={!ratingScore}
            >
              {userRating ? 'Update Rating' : 'Submit Rating'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RatingDialog;
