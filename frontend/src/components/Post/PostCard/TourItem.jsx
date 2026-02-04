import React, { useState } from 'react';
import RatingDialog from './RatingDialog';
import StarRating from './StarRating';

function TourItem({
  tour,
  userLocal,
  activeImageIndex,
  onPrevImage,
  onNextImage,
  onToggleRatingDialog,
  showRatingDialog,
  userRating,
  ratingScore,
  onRatingChange,
  onSubmitRating,
  onDeleteRating,
  onSearchByCategory,
  onSaveTour,
  isSaved,
  onOpenEdit,
  onDeleteTour,
  onViewOnMap,
  expandedDescription,
  onToggleDescription,
  navigate,
  commentsExpanded,
  onToggleComments,
  comments,
  commentsEndRef,
  newComment,
  onNewCommentChange,
  onPostComment
}) {
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0);
  console.log("tour =>", tour.publisher._id , "userLocal =>", userLocal._id);
  
  const openFullscreenImage = (index) => {
    setFullscreenImageIndex(index);
    setIsImageFullscreen(true);
  };

  const closeFullscreenImage = () => {
    setIsImageFullscreen(false);
  };

  const navigateFullscreenImage = (direction) => {
    if (direction === 'prev') {
      setFullscreenImageIndex(prev => 
        prev === 0 ? tour.images.length - 1 : prev - 1
      );
    } else {
      setFullscreenImageIndex(prev => 
        prev === tour.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  return (
    <div className="container-tour">
      <div className="head-tour">
        <div className="tour-title-location">
          <div className="title-tour">{tour.name}</div>
          <div className="locations">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-geo-alt-fill" viewBox="0 0 16 16">
              <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
            </svg>
            <span className="location-tour" onClick={() => onViewOnMap(tour.coordinates)}>{tour.location}</span>
          </div>
        </div>
        <div className="actions">
        {userLocal?._id !== tour.publisher._id && (
          <div className="rating-container" onClick={() => onToggleRatingDialog(tour._id)} title='Rate Tour'>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ffc107" className="bi bi-star-fill" viewBox="0 0 16 16">
              <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
            </svg>
            <div className="rating" >{(() => {
              const ratings = tour.ratings || []; if (!ratings.length) return '0.0'; const total = ratings.reduce((sum, r) => sum + r.rating, 0); return (total / ratings.length).toFixed(1);
            })()}</div>
            <span className="rating-count">({tour.ratings?.length || 0})</span>
          </div>
        )}
          <div className="category" onClick={() => onSearchByCategory(tour.category.name)} title='Category'>{tour.category?.name}</div>
          {userLocal?._id !== tour.publisher._id && (
          <div className={isSaved ? 'action-buttons saved' : 'action-buttons'} onClick={() => onSaveTour(tour._id)}
          title={isSaved ? "unSaved" : "Save"}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-bookmark-plus" viewBox="0 0 16 16">
              <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.549a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z" />
              <path d="M8 4a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 4zM6.5 5.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1h2z" />
            </svg>

          </div>
        )}
          {userLocal?._id === tour.publisher._id && (
            <>
              <div className="action-buttons edit" onClick={() => onOpenEdit(tour)} title="Edit Tour">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293z"/>
                  <path d="M14.459 4.396l-2-2L4.939 9.916a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l7.52-7.52z"/>
                  <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5V6a.5.5 0 0 0-1 0v7.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V2.5a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                </svg>
              </div>
              <div className="action-buttons delete" onClick={() => onDeleteTour(tour._id)} title="Delete Tour">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                  <path d="M5.5 5.5A.5.5 0 0 1 6 5h4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5v-7z"/>
                  <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1H0v-1h4.5l.5-.5h6l.5.5H16v1h-1.5z"/>
                </svg>
              </div>
            </>
          )}
        </div>
      </div>

      <RatingDialog
        tour={tour}
        visible={!!showRatingDialog}
        userRating={userRating}
        ratingScore={ratingScore}
        onClose={() => onToggleRatingDialog(tour._id)}
        onChange={onRatingChange}
        onSubmit={onSubmitRating}
        onDelete={onDeleteRating}
      />

      {/* Fullscreen Image Viewer */}
      {isImageFullscreen && (
        <div className="fullscreen-image-overlay" onClick={closeFullscreenImage}>
          <div className="fullscreen-image-container" onClick={(e) => e.stopPropagation()}>
            <button className="fullscreen-close-btn" onClick={closeFullscreenImage}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854z"/>
              </svg>
            </button>
            <img 
              className="fullscreen-image" 
              src={tour.images[fullscreenImageIndex]} 
              alt={`Tour image ${fullscreenImageIndex + 1}`} 
            />
            {tour.images.length > 1 && (
              <>
                <button className="fullscreen-nav prev" onClick={() => navigateFullscreenImage('prev')}>
                  ‹
                </button>
                <button className="fullscreen-nav next" onClick={() => navigateFullscreenImage('next')}>
                  ›
                </button>
                <div className="fullscreen-counter">
                  {fullscreenImageIndex + 1} / {tour.images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="container-info-tour">
        <div className="large-content">
          <div className="large-image">
            <img 
              className="l-image" 
              src={tour.images[activeImageIndex || 0]} 
              alt={`Tour image ${(activeImageIndex || 0) + 1}`} 
              onClick={() => openFullscreenImage(activeImageIndex || 0)}
              style={{ cursor: 'pointer' }}
            />
            {tour.images.length > 1 && (
              <>
                <button className="image-nav prev" onClick={() => onPrevImage(tour._id, tour.images.length)}>‹</button>
                <button className="image-nav next" onClick={() => onNextImage(tour._id, tour.images.length)}>›</button>
                <div className="image-counter">{(activeImageIndex || 0) + 1} / {tour.images.length}</div>
              </>
            )}
            <div className="image-overlay">
              <div className="publish-date">Published on: {new Date(tour.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
          <div className="author-details">
            <div
              className="description-tour"
              style={{
                WebkitLineClamp: expandedDescription ? 'unset' : 4,
                overflow: expandedDescription ? 'visible' : 'hidden',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical'
              }}
            >
              {tour.description}
            </div>
            {tour.description.length > 300 && (
              <button onClick={() => onToggleDescription(tour._id)} className="read-more-btn">
                {expandedDescription ? 'Show less' : 'Read more...'}
              </button>
            )}
            <div className="author-info" onClick={() => navigate(`/profile/${tour.publisher._id}`)}>
              <img className="author-avatar" src={tour.publisher.image} alt="Author Avatar" />
              <div className="author-details-text">
                <div className="author-name">{tour.publisher.firstName} {tour.publisher.lastName}</div>
                <div className="author-role">Travel Creator</div>
              </div>
            </div>
          </div>
        </div>
        <div className="small-info">
          <div className="map-location-tour">
            <iframe
              title="Location Map"
              src={`https://www.google.com/maps?q=${tour?.coordinates.lat},${tour?.coordinates.lng}&hl=es;z=14&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
          {tour.videos[0] && (tour.videos[0].includes('youtube.com') || tour.videos[0].includes('youtu.be')) ? (
            <iframe
              className="video-embed"
              src={`https://www.youtube.com/embed/${(() => { const regExp = /(?:v=|youtu\.be\/)([^&#]+)/; const match = tour.videos[0].match(regExp); return match ? match[1] : null; })()}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : tour.videos[0] ? (
            <video className="video-embed" controls>
              <source src={tour.videos[0]} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : null}
          {tour.images.length > 1 && (
            <div className="small-image" onClick={() => onNextImage(tour._id, tour.images.length)}>
              <img className="s-image" src={tour.images[((activeImageIndex || 0) + 1) % tour.images.length]} alt="Small" />
            </div>
          )}
        </div>
      </div>

      <div className="comments-section">
        <div className="comments-header" onClick={() => onToggleComments(tour._id)}>
          <span>Comments ({tour.comments?.length || 0})</span>
          <svg width="16" height="16" fill="currentColor" className={`comments-chevron ${commentsExpanded ? 'expanded' : ''}`} viewBox="0 0 16 16">
            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
          </svg>
        </div>
        {commentsExpanded && (
          <>
            <div className="comments-list" ref={commentsEndRef}>
              {comments?.map(comment => (
                <div key={comment._id || comment.id} className="comment-item">
                  <img className="comment-avatar" src={comment?.user.image} alt="Comment Avatar" />
                  <div className="comment-content">
                    <div className="comment-header">
                      <div className="comment-author">{comment.user.firstName} {comment.user.lastName}</div>
                      <span className="comment-date">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="comment-text">{comment.content}</div>
                  </div>
                </div>
              ))}
              {(!comments || comments.length === 0) && (
                <div className="no-comments">No comments yet. Be the first to comment!</div>
              )}
            </div>
            {localStorage.getItem('token') ? (
              <div className="add-comment">
                <textarea className="comment-input" placeholder="Share your thoughts..." rows="3" value={newComment} onChange={(e) => onNewCommentChange(e.target.value)} />
                <button className="submit-comment" onClick={() => onPostComment(tour._id)}>Post Comment</button>
              </div>
            ) : (
              <div className="login-prompt-comment">Please log in to post a comment.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default TourItem;