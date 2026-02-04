import React, { useState }  from 'react'

function UserModal({ user, onClose, onUpdateRole }) {

 console.log("user Data =>", user);
  
  const [selectedRole, setSelectedRole] = useState(user.role || 'user');

  const handleSubmit = (e) => {
    console.log("selected Role =>", selectedRole);
    
    e.preventDefault();
    onUpdateRole(user._id, selectedRole);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit User Role</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        
        <div className="modal-content">
          <div className="user-details">
            <div className="user-avatar">
              <img 
                src={user.image || '/default-avatar.png'} 
                alt={`${user.firstName} ${user.lastName}`}
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
              />
            </div>
            <div className="user-info">
              <h3>{user.firstName} {user.lastName}</h3>
              <p className="user-email">{user.email}</p>
              <div className="current-role-badge">
                Current: <span>{user.role}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="role-select">Select New Role</label>
              <select 
                id="role-select"
                value={selectedRole} 
                onChange={(e) => setSelectedRole(e.target.value)}
                className="role-select"
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
              <div className="select-arrow">▼</div>
            </div>
            
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={selectedRole === user.role}
              >
                Update Role
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserModal