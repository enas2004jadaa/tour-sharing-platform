import React from 'react'

function StatCard({ title, value, icon, color, trend }) {
    
return (
  <div className="stat-card" style={{ borderLeftColor: color }}>
    <div className="stat-icon" style={{ backgroundColor: color + '20' }}>
      {icon}
    </div>
    <div className="stat-content">
      <h3>{value}</h3>
      <p>{title}</p>
      <span className="trend" style={{ color }}>
        {trend}
      </span>
    </div>
  </div>
)
}

export default StatCard