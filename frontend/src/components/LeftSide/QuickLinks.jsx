import React, { useEffect, useState } from 'react';
import './quickLinks.css';
import CreateTicketDialog from '../Dialogs/CreateTicketDialog/CreateTicketDialog.jsx';
import { useNavigate } from 'react-router-dom';

function QuickLinks() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userData = JSON.parse(atob(token.split('.')[1]));
      setRole(userData.role);
    }
  }, []);
  const quickLinks = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
        </svg>
      ),
      title: role === 'admin' || role === 'moderator' ? "Admin Panel" : "Support",
      count: null,
      color: "#f093fb"
    }
  ];

  const handleLinkClick = (title) => {
    if (title === "Support") {
      if (user.role === 'Visitor') {
        navigate("/login");
        return;
      }
      navigate("/support");
    } else if (title === "Admin Panel") {
      navigate("/admin");
    } 
  };
  
  return (
    <>
      <div className='card-quick-link'>
        <div className='header-quick-link'>
          <div className='header-content-quick-link'>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className='header-icon'>
              <path d="M13.5 1.5a1.5 1.5 0 1 1 3 0v3a1.5 1.5 0 0 1-3 0v-3zm-6 0a1.5 1.5 0 1 1 3 0v3a1.5 1.5 0 0 1-3 0v-3zm9 9a1.5 1.5 0 1 1 3 0v3a1.5 1.5 0 0 1-3 0v-3zm-12 0a1.5 1.5 0 1 1 3 0v3a1.5 1.5 0 0 1-3 0v-3zm9 9a1.5 1.5 0 1 1 3 0v3a1.5 1.5 0 0 1-3 0v-3zm-6 0a1.5 1.5 0 1 1 3 0v3a1.5 1.5 0 0 1-3 0v-3z"/>
            </svg>
            Quick Links
          </div>
        </div>
        
        <div className='quick-links-container'>
          {quickLinks.map((link, index) => (
            <div 
              key={index}
              className='quick-link-item'
              onClick={() => handleLinkClick(link.title)}
            >
              <div className='link-content'>
                <div 
                  className='icon-container'
                  style={{ backgroundColor: `${link.color}15` }}
                >
                  <div 
                    className='link-icon'
                    style={{ color: link.color }}
                  >
                    {link.icon}
                  </div>
                </div>
                <div className='link-text'>
                  <div className='title-link'>{link.title}</div>
                </div>
              </div>
              
              <div className='link-count'>
                {link.count !== null && (
                  <div 
                    className='count-badge'
                    style={{ backgroundColor: link.color }}
                  >
                    {link.count}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </>
  );
}

export default QuickLinks;