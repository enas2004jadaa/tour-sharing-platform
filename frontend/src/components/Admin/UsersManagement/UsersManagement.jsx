import React , { useState, useEffect } from 'react'

function UsersManagement({ users, onDeleteUser, onEditUser }) {
    const [currentUserId, setCurrentUserId] = useState(null);
    const [userRole, setUserRole] = useState(null);
    useEffect(() => {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.userId);
        setUserRole(payload.role);
      }
    }, []);
  
    return (
    <div className="management-section">
      <div className="section-header">
        <h2>User Management</h2>
        <p>Manage platform users and their roles</p>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (            
              <tr key={user._id}>
                <td>
                  <div className="user-info">
                    <img 
                      src={user.image || '/default-avatar.png'} 
                      alt={user.firstName}
                      className="user-avatar"
                    />
                    <div>
                      <div className="user-name">{user.firstName} {user.lastName} {user._id === currentUserId ? "(You)" : ""}</div>
                      <div className="user-id">ID: {user._id.slice(-8)}</div>
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role || 'user'}`}>
                    {user.role || 'User'}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.isDeleted ? 'inactive' : 'active'}`}>
                    {user.isDeleted ? 'Inactive' : 'Active'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  {userRole === 'admin' ?
                  user._id === currentUserId ? null : (
                  <div className="action-buttons">
                    <button 
                      className="btn-icon edit"
                      onClick={() => onEditUser(user)}
                      title="Edit User"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </button>
                    <button 
                      className="btn-icon delete"
                      onClick={() => onDeleteUser(user._id)}
                      title="Delete User"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                  </div>
                  )
                : <div style={{ color: 'gray', fontStyle: 'italic' }}>Just for Admin</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )};

export default UsersManagement