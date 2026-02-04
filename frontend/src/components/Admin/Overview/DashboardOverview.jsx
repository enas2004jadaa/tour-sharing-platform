import React from 'react'

function DashboardOverview({ logs }) {
    
    const getLogIcon = (action) => {
      const icons = {
        login: '🔐',
        create: '➕',
        update: '✏️',
        delete: '🗑️',
        view: '👁️',
        download: '📥'
      };

      return icons[action.toLowerCase()] || '📄';
    };

    return (
    <div className="logs-window">
      <div className="logs-header">
        <h3>Recent Activity Logs</h3>
      </div>
      
      <div className="logs-container">
        {logs?.length > 0 ? (
          logs.map((log, index) => (
            <div key={index} className="log-entry">
              <div className="log-icon">
                {getLogIcon(log.action)}
              </div>
              <div className="log-content">
                <div className="log-main">
                  <span className="log-action">{log.action}</span>
                  <span className="log-details">{log.details}</span>
                </div>
                <div className="log-meta">
                  <span className="log-user">
                    {log.user.firstName} {log.user.lastName} ({log.user.role})
                  </span>
                  {log.timestamp && (
                    <span className="log-time">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-logs">
            <p>No activity logs available</p>
          </div>
        )}
      </div>
      
      <div className="logs-footer">
        <span>Showing {logs?.length || 0} entries</span>
      </div>
    </div>
)}

export default DashboardOverview