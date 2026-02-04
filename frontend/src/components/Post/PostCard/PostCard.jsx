import React, { use, useEffect, useRef, useState } from "react";
import "./postcard.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import EditTourDialog from './EditTourDialog';
import TourItem from './TourItem';

// (Leaflet assets no longer needed here after refactor)
function PostCard({ tours, selectedCategory , setSelectedCategory}) {
  const navigate = useNavigate();
  const [expandedComments, setExpandedComments] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [toursState, setToursState] = useState(tours);
  const commentsEndRef = useRef(null);
  const [filteredTours, setFilteredTours] = useState(tours);
  const [activeImageIndexes, setActiveImageIndexes] = useState({});
  const [savedTours, setSavedTours] = useState(() => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    return user.savedTours || [];
  });
  const [showRatingDialog, setShowRatingDialog] = useState({});
  const [userRatings, setUserRatings] = useState({});
  const [ratingScores, setRatingScores] = useState({});
  const [expanded, setExpanded] = useState(false);
  const [editingTour, setEditingTour] = useState(null);

  const userLocal = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(()=>{
  if(selectedCategory){
     setFilteredTours(tours.filter(t => t.category?.name === selectedCategory))
  } else {
     setFilteredTours(tours)
  }
}, [selectedCategory, tours])

  useEffect(() => {
    setToursState(tours);
    setFilteredTours(tours);
    setComments(
      tours.reduce((acc, tour) => {
        acc[tour._id] = tour.comments || [];
        return acc;
      }, {})
    );

    const initialUserRatings = {};
    const initialRatingScores = {};
    tours.forEach((tour) => {
      initialUserRatings[tour._id] = getUserRatingForTour(tour);
      initialRatingScores[tour._id] = 0;
    });
    setUserRatings(initialUserRatings);
    setRatingScores(initialRatingScores);
  }, [tours]);

  const getUserRatingForTour = (tour) => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const userRating = tour.ratings?.find((rating) => rating.user._id === user.id);
    return userRating || null;
  };

  // average rating now computed inside TourItem; helper removed

  const handleViewOnMap = (coordinates) => {
    const { lat, lng } = coordinates;
    const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(mapUrl, "_blank");
  };

  const handleSearchByCategory = (categoryName) => {
    if (selectedCategory === categoryName) {
      setFilteredTours(tours);
      setSelectedCategory(null);
    } else {
      const filtered = tours.filter(
        (tour) =>
          tour.category.name.toLowerCase() === categoryName.toLowerCase()
      );
      setFilteredTours(filtered);
      setSelectedCategory(categoryName);
    }
  };

  // getYouTubeId removed (handled inside TourItem)

  const toggleComments = (tourId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [tourId]: !prev[tourId],
    }));
    scrollToBottom();
  };

  const toggleRatingDialog = (tourId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
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

  const handleRatingChange = (tourId, score) => {
    setRatingScores((prev) => ({
      ...prev,
      [tourId]: score,
    }));
  };

  const submitRating = (tourId) => {
    const rating = ratingScores[tourId];
    if (!rating || rating < 1 || rating > 5) {
      alert("Please select a rating between 1 and 5 stars");
      return;
    }

    axios
      .post(
        "http://localhost:5000/ratings/",
        {
          tourId,
          rating,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((response) => {
        const updatedTour = response.data.data;

        setToursState((prev) =>
          prev.map((t) => (t._id === tourId ? updatedTour : t))
        );
        setFilteredTours((prev) =>
          prev.map((t) => (t._id === tourId ? updatedTour : t))
        );

        const userId = JSON.parse(localStorage.getItem("user")).id;
        const userRating = updatedTour.ratings.find(
          (r) => r.user._id === userId
        );

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

        setToursState((prev) =>
          prev.map((t) => (t._id === tourId ? updatedTour : t))
        );
        setFilteredTours((prev) =>
          prev.map((t) => (t._id === tourId ? updatedTour : t))
        );

        setUserRatings((prev) => ({ ...prev, [tourId]: null }));
        setRatingScores((prev) => ({ ...prev, [tourId]: 0 }));

        setShowRatingDialog((prev) => ({ ...prev, [tourId]: false }));

        alert("Rating removed successfully!");
      })
      .catch((error) => {
        console.error("Error deleting rating:", error);
        alert("Error deleting rating. Please try again.");
      });
  };

  const openEditDialog = (tour) => setEditingTour(tour);
  const closeEditDialog = () => setEditingTour(null);
  const handleTourUpdated = (updatedTour) => {
    setToursState(prev => prev.map(t => t._id === updatedTour._id ? updatedTour : t));
    setFilteredTours(prev => prev.map(t => t._id === updatedTour._id ? updatedTour : t));
    closeEditDialog();
  };
  const handleDeleteTour = (tourId) => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    if (!window.confirm('Are you sure you want to delete this tour?')) return;
    axios.delete(`http://localhost:5000/tours/${tourId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        setToursState(prev => prev.filter(t => t._id !== tourId));
        setFilteredTours(prev => prev.filter(t => t._id !== tourId));
        alert('Tour deleted');
      })
      .catch(err => {
        console.error('Delete tour error', err);
        alert('Failed to delete tour');
      });
  };

  const handleSaveTour = (tourId) => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    axios
      .get(`http://localhost:5000/tours/save/${tourId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        if (response.data.action === "unsaved") {
          let user = JSON.parse(localStorage.getItem("user")) || {};
          user.savedTours = user.savedTours || [];
          user.savedTours = user.savedTours.filter((id) => id !== tourId);
          localStorage.setItem("user", JSON.stringify(user));
          setSavedTours(user.savedTours);
          return;
        }
        let user = JSON.parse(localStorage.getItem("user")) || {};
        user.savedTours = user.savedTours || [];
        if (!user.savedTours.includes(tourId)) {
          user.savedTours.push(tourId);
        }
        localStorage.setItem("user", JSON.stringify(user));
        setSavedTours(user.savedTours);
      })
      .catch((error) => {
        console.error("Error saving tour:", error);
      });
  };

  // class helper replaced by boolean prop isSaved in TourItem

  const handlePostComment = (tourId) => {
    if (!newComment.trim()) return;

    axios
      .post(
        `http://localhost:5000/comments/`,
        { tourId, content: newComment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((response) => {
        const savedComment = response.data.data;

        setToursState((prevTours) =>
          prevTours.map((tour) => {
            if (tour._id === tourId) {
              return {
                ...tour,
                comments: [...(tour.comments || []), savedComment],
              };
            }
            return tour;
          })
        );

        setComments((prev) => ({
          ...prev,
          [tourId]: [...(prev[tourId] || []), savedComment],
        }));
        scrollToBottom();
        setNewComment("");
      })
      .catch((error) => {
        console.error("Error posting comment:", error);
      });
  };

  const clearFilter = () => {
    setFilteredTours(tours);
    setSelectedCategory(null);
  };

  const scrollToBottom = () => {
    commentsEndRef?.current?.scrollTo({
      top: commentsEndRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

const nextImage = (tourId, tourLength) => {
  setActiveImageIndexes(prev => ({
    ...prev,
    [tourId]: prev[tourId] === undefined
      ? 1
      : prev[tourId] === tourLength - 1
      ? 0
      : prev[tourId] + 1
  }));
};

const prevImage = (tourId, tourLength) => {
  setActiveImageIndexes(prev => ({
    ...prev,
    [tourId]: prev[tourId] === undefined
      ? tourLength - 1
      : prev[tourId] === 0
      ? tourLength - 1
      : prev[tourId] - 1
  }));
};

  return (
    <div className="post-card">
      {selectedCategory && (
        <div className="category-filter-header">
          <h3>Showing tours in: {selectedCategory}</h3>
          <button onClick={clearFilter} className="clear-filter-btn">
            Back to main page 
          </button>
        </div>
      )}
      
      {filteredTours?.map((tour) => (
        <TourItem
          key={tour._id}
          tour={tour}
          userLocal={userLocal}
          activeImageIndex={activeImageIndexes[tour._id] || 0}
          onPrevImage={prevImage}
          onNextImage={nextImage}
          onToggleRatingDialog={toggleRatingDialog}
          showRatingDialog={showRatingDialog[tour._id]}
          userRating={userRatings[tour._id]}
          ratingScore={ratingScores[tour._id] || 0}
          onRatingChange={handleRatingChange}
          onSubmitRating={submitRating}
          onDeleteRating={deleteRating}
          onSearchByCategory={handleSearchByCategory}
          onSaveTour={handleSaveTour}
          isSaved={savedTours.includes(tour._id)}
          onOpenEdit={openEditDialog}
          onDeleteTour={handleDeleteTour}
          onViewOnMap={handleViewOnMap}
          expandedDescription={expanded[tour._id]}
          onToggleDescription={(id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))}
          navigate={navigate}
          commentsExpanded={expandedComments[tour._id]}
          onToggleComments={toggleComments}
          comments={comments[tour._id]}
          commentsEndRef={commentsEndRef}
          newComment={newComment}
          onNewCommentChange={setNewComment}
          onPostComment={handlePostComment}
        />
      ))}
      <EditTourDialog tour={editingTour} onClose={closeEditDialog} onUpdated={handleTourUpdated} />
    </div>
  );
}

export default PostCard;
