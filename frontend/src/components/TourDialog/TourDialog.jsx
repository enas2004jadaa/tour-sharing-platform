import React, { useState, useRef, useEffect, use } from 'react';
import './tourdialog.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
function TourDialog({ tour, onClose, onSaveTour }) {
    const [toursState, setToursState] = useState(tour);
    const [expandedComments, setExpandedComments] = useState(false);
    const [comments, setComments] = useState(toursState.comments || []);
    const [newComment, setNewComment] = useState("");
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [saved, setSaved] = useState(false);
    const dialogRef = useRef(null);
    const commentsEndRef = useRef(null);
    const user = JSON.parse(localStorage.getItem('user'));
    const [showRatingDialog, setShowRatingDialog] = useState({});
    const [ratingScores, setRatingScores] = useState(toursState.ratings);
    const [userRatings, setUserRatings] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        if (user.role !== 'Visitor') {
        const savedTours = user.savedTours || [];
        setSaved(savedTours.includes(toursState._id));
        };
        const handleClickOutside = (event) => {
            if (dialogRef.current && !dialogRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (toursState.ratings) {
            const userId = user.id;
            const existingUserRating = toursState.ratings.find(rating => rating.user._id === userId);
            if (existingUserRating) {
                setUserRatings(prev => ({ ...prev, [toursState._id]: existingUserRating }));
            }
        }
        
        
        document.addEventListener('mousedown', handleClickOutside);
        document.body.style.overflow = 'hidden';     

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [toursState._id, onClose]);

    const getAverageRating = (ratings) => {
        if (!ratings || ratings.length === 0) return 0.0;
        const total = ratings.reduce((sum, r) => sum + r.rating, 0);
        return (total / ratings.length).toFixed(1);
    };

    const handleViewOnMap = (coordinates) => {
        const { lat, lng } = coordinates;
        const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        window.open(mapUrl, '_blank');
    };

    const handleSaveTour = () => {
        axios.get(`http://localhost:5000/tours/save/${toursState._id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            setSaved(true);
            
            let user = JSON.parse(localStorage.getItem('user')) || {};
            user.savedTours = user.savedTours || [];
            if (!user.savedTours.includes(toursState._id)) {
                user.savedTours.push(toursState._id);
            }else{
                user.savedTours = user.savedTours.filter(id => id !== toursState._id);
                setSaved(false);
            }
            localStorage.setItem('user', JSON.stringify(user));
            
            if (onSaveTour) {
                onSaveTour(toursState._id);
            }
        })
        .catch(error => {
            console.error("Error saving tour:", error);
        });
    };

    const handlePostComment = () => {
        if (!newComment.trim()) return;

        axios.post(`http://localhost:5000/comments/`, { tourId: toursState._id, content: newComment }, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            const savedComment = response.data.data;
            setComments(prev => [...prev, savedComment]);
            setNewComment("");
            scrollToBottom();
        })
        .catch(error => {
            console.error("Error posting comment:", error);
        });
    };

    const getYouTubeId = (url) => {
        const regExp = /(?:v=|youtu\.be\/)([^&#]+)/;
        const match = url.match(regExp);
        return match ? match[1] : null;
    };

    const scrollToBottom = () => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const toggleComments = () => {
        setExpandedComments(!expandedComments);
        if (!expandedComments) {
            setTimeout(scrollToBottom, 100);
        }
    };

    const nextImage = () => {
        setActiveImageIndex((prev) => 
            prev === toursState.images.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = () => {
        setActiveImageIndex((prev) => 
            prev === 0 ? toursState.images.length - 1 : prev - 1
        );
    };

    const toggleRatingDialog = (tourId) => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        onClose();
        return;
      }
      setShowRatingDialog((prev) => ({
        ...prev,
        [tourId]: !prev[tourId],
      }));
      
    
      if (userRatings[tourId]) {
        setRatingScores((prev) => ({
          ...prev,
          [tourId]: userRatings[tourId].rating,
        }));
      }
    };

    const submitRating = (tourId) => {
        const rating = ratingScores[tourId];
        if (!rating || rating < 1 || rating > 5) {
          alert("Please select a rating between 1 and 5 stars");
          return;
        }

        axios.post("http://localhost:5000/ratings/",{tourId,rating},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }).then((response) => {
            const updatedTour = response.data.data;
            
            const userId = JSON.parse(localStorage.getItem("user")).id;
            const userRating = updatedTour.ratings.find(
              (r) => r.user._id === userId
            );
            setToursState(updatedTour);
            
            setUserRatings((prev) => ({
              ...prev,
              [tourId]: userRating,
            }));

            setShowRatingDialog((prev) => ({
              ...prev,
              [tourId]: false,
            }));

            alert("Rating submitted successfully!");
          })
          .catch((error) => {
            console.error("Error submitting rating:", error);
            alert("Error submitting rating. Please try again.");
          });
    };

  const deleteRating = (tourId) => {
    if (!userRatings[tourId]) return;   
    
    const ratingId = userRatings[tourId]._id;

    axios
      .post(
        "http://localhost:5000/ratings/delete",
        { tourId, ratingId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      )
      .then((response) => {
        const updatedTour = response.data.data;

        setToursState(updatedTour);


        setUserRatings((prev) => ({ ...prev, [tourId]: null }));
        setRatingScores((prev) => ({ ...prev, [tourId]: 0 }));

        setShowRatingDialog((prev) => ({ ...prev, [tourId]: false }));

      })
      .catch((error) => {
        console.error("Error deleting rating:", error);
      });
  };
    const handleRatingChange = (tourId, score) => {
    setRatingScores((prev) => ({
      ...prev,
      [tourId]: score,
    }));
  };

    const StarRating = ({ tourId, interactive = false, size = 16 }) => {
        const currentRating = userRatings[tourId] ? userRatings[tourId].rating : 0;
        const displayRating = interactive ? ratingScores[tourId] : currentRating;    

    return (
      <div className={`star-rating ${interactive ? "interactive" : ""}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            fill={star <= displayRating ? "#ffc107" : "#e4e5e9"}
            className="bi bi-star-fill"
            viewBox="0 0 16 16"
            onClick={() => interactive && handleRatingChange(tourId, star)}
            style={{
              cursor: interactive ? "pointer" : "default",
              marginRight: "2px",
            }}
          >
            <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
          </svg>
        ))}
      </div>
    );
  };

    return (
        <div className="tour-dialog-overlay">
            <div className="tour-dialog" ref={dialogRef}>
                <div className="tour-dialog-header">
                    <button className="close-button" onClick={onClose}>
                        ×
                    </button>
                    <div className="tour-dialog-title-section">
                        <h2 className="tour-dialog-title">{toursState.name}</h2>
                        <div className="tour-dialog-location" onClick={() => handleViewOnMap(toursState.coordinates)}>
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                            </svg>
                            {toursState.location}
                        </div>
                    </div>
                    <div className="tour-dialog-actions">
                        <div className="rating-container" onClick={() => toggleRatingDialog(toursState._id)}>
                            <svg width="18" height="18" fill="#ffc107" viewBox="0 0 16 16">
                                <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                            </svg>
                            <span className="rating">{getAverageRating(toursState.ratings)}</span>
                        </div>
                        <div className="category-badge">
                            {toursState.category?.name}
                        </div>
                        <button 
                            className={`save-button ${saved ? 'saved' : ''}`}
                            onClick={handleSaveTour}
                        >
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                {saved ? (
                                    <path d="M2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>
                                ) : (
                                    <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.549a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/>
                                )}
                            </svg>
                            {saved ? 'Saved' : 'Save'}
                        </button>
                    </div>
                </div>

                {showRatingDialog[toursState._id] && (
                  <div className="rating-dialog-overlay">
                    <div className="rating-dialog">
                      <div className="rating-dialog-header">
                        <h3>Rate this Tour</h3>
                        <button
                          className="close-button"
                          onClick={() => toggleRatingDialog(toursState._id)}
                        >
                          ×
                        </button>
                      </div>
                      <div className="rating-dialog-content">
                        <p>How would you rate "{toursState.name}"?</p>
                        <div className="interactive-rating">
                          <StarRating
                            tourId={toursState._id}
                            interactive={true}
                            size={32}
                          />
                          <div className="rating-score">
                            {ratingScores[toursState._id] || 0} / 5
                          </div>
                        </div>
                        <div className="rating-actions">
                          {userRatings[toursState._id] && (
                            <button
                              className="delete-rating-btn"
                              onClick={() => deleteRating(toursState._id)}
                            >
                              Remove My Rating
                            </button>
                          )}
                          <button
                            className="submit-rating-btn"
                            onClick={() => submitRating(toursState._id)}
                            disabled={!ratingScores[toursState._id]}
                          >
                            {userRatings[toursState._id]
                              ? "Update Rating"
                              : "Submit Rating"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="tour-dialog-content">
                    <div className="tour-dialog-gallery">
                        <div className="main-image">
                            <img 
                                src={toursState.images[activeImageIndex]} 
                                alt={`Tour image ${activeImageIndex + 1}`}
                            />
                            {toursState.images.length > 1 && (
                                <>
                                    <button className="image-nav prev" onClick={prevImage}>
                                        ‹
                                    </button>
                                    <button className="image-nav next" onClick={nextImage}>
                                        ›
                                    </button>
                                    <div className="image-counter">
                                        {activeImageIndex + 1} / {toursState.images.length}
                                    </div>
                                </>
                            )}
                        </div>
                        {toursState.images.length > 1 && (
                            <div className="image-thumbnails">
                                {toursState.images.map((image, index) => (
                                    <img
                                        key={index}
                                        src={image}
                                        alt={`Thumbnail ${index + 1}`}
                                        className={`thumbnail ${index === activeImageIndex ? 'active' : ''}`}
                                        onClick={() => setActiveImageIndex(index)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="tour-dialog-details">
                        <div className="description-section">
                            <h3>About this tour</h3>
                            <p className="tour-description">{toursState.description}</p>
                        </div>

                        <div className="details-grid">
                            <div className="detail-item">
                                <strong>Published:</strong>
                                <span>{new Date(toursState.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="detail-item">
                                <strong>Category:</strong>
                                <span>{toursState.category?.name}</span>
                            </div>
                            <div className="detail-item">
                                <strong>Ratings:</strong>
                                <span>{toursState.ratings?.length || 0} reviews</span>
                            </div>
                        </div>

                        <div className="author-section">
                            <h3>Created by</h3>
                            <div className="author-info" onClick={() => { navigate(`/profile/${toursState.publisher?._id}`); onClose(); }}>
                                <img 
                                    src={toursState.publisher?.image} 
                                    alt={toursState.publisher?.firstName}
                                    className="author-avatar"
                                />
                                <div className="author-details">
                                    <div className="author-name">
                                        {toursState.publisher?.firstName} {toursState.publisher?.lastName}
                                    </div>
                                    <div className="author-role">Travel Creator</div>
                                </div>
                            </div>
                        </div>

                        <div className="map-section">
                            <h3>Location</h3>
                            <div className="map-container">
                                <iframe
                                    title="Location Map"
                                    src={`https://www.google.com/maps?q=${toursState.coordinates?.lat},${toursState.coordinates?.lng}&hl=es;z=14&output=embed`}
                                    width="100%"
                                    height="200"
                                    style={{ border: 0, borderRadius: '8px' }}
                                    allowFullScreen=""
                                    loading="lazy"
                                ></iframe>
                            </div>
                        </div>

                        {toursState.videos?.[0] && (
                            <div className="video-section">
                                <h3>Video</h3>
                                {toursState.videos[0].includes('youtube.com') || toursState.videos[0].includes('youtu.be') ? (
                                    <iframe
                                        className="video-embed"
                                        src={`https://www.youtube.com/embed/${getYouTubeId(toursState.videos[0])}`}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <video className="video-embed" controls>
                                        <source src={toursState.videos[0]} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className='comments-section'>
                    <div className='comments-header' onClick={toggleComments}>
                        <span>Comments ({comments.length})</span>
                        <svg 
                            width="16" 
                            height="16" 
                            fill="currentColor" 
                            className={`comments-chevron ${expandedComments ? 'expanded' : ''}`}
                            viewBox="0 0 16 16"
                        >
                            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                        </svg>
                    </div>
                    
                    {expandedComments && (
                        <>
                            <div className='comments-list'>
                                {comments.map((comment) => (
                                    <div key={comment._id} className='comment-item'>
                                        <img className='comment-avatar' src={comment.user?.image} alt="Comment Avatar" />
                                        <div className='comment-content'>
                                            <div className='comment-header'>
                                                <div className='comment-author'>{comment.user?.firstName} {comment.user?.lastName}</div>
                                                <span className='comment-date'>
                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className='comment-text'>{comment.content}</div>
                                        </div>
                                    </div>
                                ))}
                                {comments.length === 0 && (
                                    <div className='no-comments'>No comments yet. Be the first to comment!</div>
                                )}
                                <div ref={commentsEndRef} />
                            </div>
                            {user.role !== 'Visitor' && (
                            <div className='add-comment'>
                                <textarea 
                                    className='comment-input' 
                                    placeholder='Share your thoughts...'
                                    rows="3"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                ></textarea>
                                <button className='submit-comment' onClick={handlePostComment}>
                                    Post Comment
                                </button>
                            </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TourDialog;