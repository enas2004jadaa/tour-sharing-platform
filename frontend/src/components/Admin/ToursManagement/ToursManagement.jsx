import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ToursManagement.css';

function ToursManagement({ tours, onDeleteTour, onApproveTour, onRejectTour, onViewTour, currentUserRole }) {
  const [categories, setCategories] = useState([]);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showCategoriesList, setShowCategoriesList] = useState(false);
  const [newCategory, setNewCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categoryList = [
    { id: 1, name: 'Adventure' , imageUrl: 'https://cdn-icons-png.freepik.com/512/5094/5094714.png' },
    { id: 2, name: 'Cultural' , imageUrl: 'https://cdn-icons-png.freepik.com/512/18036/18036009.png' },
    { id: 3, name: 'Historical' , imageUrl: 'https://cdn-icons-png.freepik.com/512/6102/6102737.png' },
    { id: 4, name: 'Nature' , imageUrl: 'https://cdn-icons-png.freepik.com/512/4773/4773874.png' },
    { id: 5, name: 'Food & Drink' , imageUrl: 'https://img.freepik.com/premium-vector/icon-food-drink-illustration-vector_643279-134.jpg' },
    { id: 6, name: 'Wildlife' , imageUrl: 'https://cdn-icons-png.flaticon.com/512/8653/8653081.png' },
    { id: 7, name: 'nope' }
  ]

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/categories');
      setCategories(response.data);
    } catch (err) {
      setError('Failed to fetch categories');
      console.error(err);
    }
  };

  const handleCreateCategory = async (e) => {
    console.log("categiory ==>", newCategory);
    
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/categories',
        { name: newCategory.name, imageUrl: newCategory.imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNewCategory(null);
      setShowCategoryDialog(false);
      fetchCategories(); // Refresh categories list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/categories/${categoryId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchCategories(); // Refresh categories list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="management-section">
      <div className="section-header">
        <div className="header-content">
          <div>
            <h2>Tour Management</h2>
            <p>Manage and moderate user-submitted tours</p>
          </div>
          <div className="header-actions">
  {currentUserRole === 'admin' && (
    <button 
      className="btn-primary-create"
      onClick={() => setShowCategoryDialog(true)}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
      </svg>
      Create Category
    </button>
  )}
  <div 
    className="btn-secondary-category"
    onClick={() => setShowCategoriesList(!showCategoriesList)}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0 4h2v-2H3v2zm4 0h14v-2H7v2zm0-4h14v-2H7v2zm0-4h14V7H7v2z"/>
    </svg>
    View Categories ({categories.length})
  </div>
</div>
        </div>
      </div>

      {/* Categories List Section */}
      {showCategoriesList && (
        <div className="categories-section">
          <div className="categories-header">
            <h3>Categories Management</h3>
            <button 
              className="btn-icon close"
              onClick={() => setShowCategoriesList(false)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
          <div className="categories-grid">
            {categories.map(category => (
              <div key={category._id} className="category-card">
                <div className="category-info">
                  <h4 className="category-name">{category.name}</h4>
                  <div className="category-meta">
                    <span>Created: {new Date(category.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {currentUserRole === 'admin' && (
  <button 
    className="btn-icon delete"
    onClick={() => handleDeleteCategory(category._id)}
    title="Delete Category"
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
    </svg>
  </button>
)}
              </div>
            ))}
            {categories.length === 0 && (
  <div className="empty-categories">
    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
    <p>No categories found</p>
    {currentUserRole === 'admin' && (
      <button 
        className="btn-primary"
        onClick={() => setShowCategoryDialog(true)}
      >
        Create First Category
      </button>
    )}
  </div>
)}
          </div>
        </div>
      )}

      {/* Create Category Dialog */}
      {showCategoryDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <div className="dialog-header">
              <h3>Create New Category</h3>
              <button 
                className="btn-icon close"
                onClick={() => setShowCategoryDialog(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            <div className="dialog-content">
              <form onSubmit={handleCreateCategory}>
                <div className="form-group">
                  <label className="form-label">Select Category</label>
                  <select
                    className="form-select"
                    value={newCategory?.name || ''}
                    onChange={(e) => setNewCategory({ name: e.target.value, imageUrl: categoryList.find(cat => cat.name === e.target.value)?.imageUrl || '' })}
                    disabled={loading}
                  >
                    {categoryList.map(category => (
                      <>
                      {categories.some(cat => cat.name === category.name) ? null : (
                      <option key={category._id} value={category.name}>
                        {category.name}
                      </option>
                      )}

                      </>
                    ))}
                  </select>
                </div>
                {error && <div className="error-message">{error}</div>}
              </form>
            </div>
            <div className="dialog-footer">
              <button
                type="button"
                className="btn-secondary-category"
                onClick={() => setShowCategoryDialog(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary-create"
                onClick={handleCreateCategory}
                disabled={loading || !newCategory}
              >
                {loading ? (
                  <>
                    <div className="button-spinner"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    Create Category
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tours Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tour</th>
              <th>Creator</th>
              <th>Location</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tours.map(tour => (
              <tr key={tour._id}>
                <td>
                  <div className="tour-info">
                    {tour.images && tour.images[0] && (
                      <img 
                        src={tour.images[0]} 
                        alt={tour.name}
                        className="tour-thumbnail"
                      />
                    )}
                    <div>
                      <div className="tour-name">{tour.name}</div>
                      <div className="tour-category">{tour.category?.name}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="creator-info">
                    {tour.publisher?.firstName} {tour.publisher?.lastName}
                  </div>
                </td>
                <td>{tour.location}</td>
                <td>
                  <span className={`status-badge ${tour.status}`}>
                    {tour.status} <span style={{fontStyle: 'italic', color: tour.isDeleted ? 'red' : 'green' }}>({tour.isDeleted ? 'Deleted' : 'Active'})</span>
                  </span>
                </td>
                <td>{new Date(tour.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-icon view"
                      onClick={() => onViewTour(tour)}
                      title="View Tour"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                    </button>
                    {(tour.status === 'pending' && !tour.isDeleted) &&(
                      <>
                        <button 
                          className="btn-icon approve"
                          onClick={() => onApproveTour(tour._id)}
                          title="Approve Tour"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                        </button>
                        <button 
                          className="btn-icon reject"
                          onClick={() => onRejectTour(tour._id)}
                          title="Reject Tour"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                          </svg>
                        </button>
                      </>
                    )}
                    {tour.isDeleted === true ? (
  currentUserRole === 'admin' && (
    <button
      className='btn-icon return-tour'
      onClick={() => onDeleteTour(tour._id, false,'pending')}
      title="Restore Tour"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" role="img" aria-label="Restore" xmlns="http://www.w3.org/2000/svg" focusable="false">
        <polyline points="23 4 23 10 17 10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="1 20 1 14 7 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  )
) : (
  currentUserRole === 'admin' && (
    <button 
      className="btn-icon delete"
      onClick={() => onDeleteTour(tour._id, true,'pending')}
      title="Delete Tour"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
      </svg>
    </button>
  )
)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    
  );
}

export default ToursManagement;