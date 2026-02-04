import React from 'react'
import './rightSide.css';

function RightSide({ popularTours, topCategories, onTourSelect ,selectedCategory, setSelectedCategory }) {

    const getAverageRating = (ratings) => {
        if (!ratings || ratings.length === 0) return 0;
        const total = ratings.reduce((sum, r) => sum + r.rating, 0);
        return (total / ratings.length).toFixed(1);
    };

    const handleClickTour = (tour) => {
        if (onTourSelect) {
            onTourSelect(tour);
        }
    };
    
    return (
        <div className='container-right'>
            <div className='card-top-categories' style={{ cursor: 'default' }}>
                <div className='header-top-categories'>
                    <div className='header-content-quick-link'>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className='header-icon'>
                            <path d="M10 3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM9 9H5V5h4v4zm11 4h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1zm-1 6h-4v-4h4v4zM17 3c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4zm0 6c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2zM7 13c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4zm0 6c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2z"/>
                        </svg>
                        Top Categories
                    </div>
                </div>
                <div className='body-top-categories'>
                    {topCategories && topCategories.length > 0 ? (
                        topCategories.map((category, index) => (
                            <div key={index} className='category-item'>
                                <div className='category-content' onClick={() => setSelectedCategory(category.name)}>
                                    <div 
                                        className='icon-category'
                                        style={{ backgroundColor: `${getCategoryColor(index)}20` }}
                                    >
                                        <img 
                                            src={category.image} 
                                            alt={category.name} 
                                            className='category-image'
                                        />
                                    </div>
                                    <div className='category-info'>
                                        <div className='category-name'>{category.name}</div>
                                    </div>
                                </div>
                                <div className='category-count'>{category.count}</div>
                            </div>
                        ))
                    ) : (
                        <div className='no-data'>No categories available</div>
                    )}                              
                </div>
            </div>

            <div className='card-recommended-tours'>
                <div className='header-top-tours'>
                    <div className='header-content-quick-link'>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className='header-icon'>
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        Top Tours
                    </div>
                </div>
                <div className='body-top-tours'>
                    {popularTours.tours && popularTours.tours.length > 0 ? (
                        popularTours.tours.map((tour, index) => (
                            <div key={index} className='tour-item' onClick={() => handleClickTour(tour)}>
                                <div className='image-tour-item'>
                                    <img src={tour.images[0]} alt={tour.title} className='tour-image-right-side' />
                                    <div className='tour-overlay'></div>
                                </div>
                                <div className='tour-item-info'>
                                    <div className='title-tour-top'>{tour.name}</div>
                                    <div className='rating-tour-top'>
                                        <span className='rating-star'>★</span>
                                        {getAverageRating(tour.ratings)}
                                        <span className='rating-total'>({tour.ratings?.length || 0})</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className='no-data'>No tours available</div>
                    )}
                </div>
            </div>
        </div>
    );

    function getCategoryColor(index) {
        const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];
        return colors[index % colors.length];
    }
}

export default RightSide;