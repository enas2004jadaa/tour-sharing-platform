import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';

const TicketsManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/admin/tickets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(response.data.tickets || response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    console.log("selected Ticket =>", ticket);
    
    setShowTicketModal(true);
  };

  const handleCloseTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to close this ticket?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/admin/tickets/${ticketId}/close`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTickets(tickets.map(ticket => 
        ticket._id === ticketId ? { ...ticket, status: 'closed' } : ticket
      ));
      
      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: 'closed' });
      }
    } catch (error) {
      console.error('Error closing ticket:', error);
    }
  };

  const handleOpenTicket = async (ticketId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/admin/tickets/${ticketId}/open`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTickets(tickets.map(ticket => 
        ticket._id === ticketId ? { ...ticket, status: 'open' } : ticket
      ));
      
      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: 'open' });
      }
    } catch (error) {
      console.error('Error opening ticket:', error);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setSendingReply(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/admin/tickets/${selectedTicket._id}/message`, 
        { message: replyMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const response = await axios.get(`http://localhost:5000/admin/tickets/${selectedTicket._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSelectedTicket(response.data);
      setTickets(tickets.map(ticket => 
        ticket._id === selectedTicket._id ? response.data : ticket
      ));
      
      setReplyMessage('');
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { class: 'open', label: 'Open' },
      in_progress: { class: 'in-progress', label: 'In Progress' },
      closed: { class: 'closed', label: 'Closed' }
    };
    
    const config = statusConfig[status] || statusConfig.open;
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="management-section">
        <div className="section-header">
          <h2>Support Tickets</h2>
          <p>Manage user support requests</p>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Support Tickets</h2>
        <p>Manage user support requests and provide assistance</p>
        <div className="tickets-stats">
          <div className="stat-item">
            <span className="stat-number">{tickets.filter(t => t.status === 'open').length}</span>
            <span className="stat-label">Open</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{tickets.filter(t => t.status === 'in_progress').length}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{tickets.filter(t => t.status === 'closed').length}</span>
            <span className="stat-label">Closed</span>
          </div>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎫</div>
          <h3>No Support Tickets</h3>
          <p>There are currently no support tickets to display.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>User</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Created</th>
                <th>Last Updated</th>
                <th>Messages</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket._id}>
                  <td>
                    <div className="ticket-id">#{ticket._id.slice(-8)}</div>
                  </td>
                  <td>
                    <div className="user-info">
                      <div className="user-name">
                        {ticket.user?.firstName} {ticket.user?.lastName}
                      </div>
                      <div className="user-email">{ticket.user?.email}</div>
                    </div>
                  </td>
                  <td>
                    <div className="ticket-reason">
                      {ticket.reason}
                      {ticket.description && (
                        <div className="ticket-description">
                          {ticket.description.length > 50 
                            ? `${ticket.description.substring(0, 50)}...` 
                            : ticket.description
                          }
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    {getStatusBadge(ticket.status)}
                  </td>
                  <td>
                    {formatDate(ticket.createdAt)}
                  </td>
                  <td>
                    {formatDate(ticket.updatedAt)}
                  </td>
                  <td>
                    <div className="message-count">
                      {ticket.messages?.length || 0} messages
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-icon view"
                        onClick={() => handleViewTicket(ticket)}
                        title="View Ticket"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                      </button>
                      
                      {ticket.status === 'closed' ? (
                        <button 
                          className="btn-icon open"
                          onClick={() => handleOpenTicket(ticket._id)}
                          title="Reopen Ticket"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </button>
                      ) : (
                        <button 
                          className="btn-icon close"
                          onClick={() => handleCloseTicket(ticket._id)}
                          title="Close Ticket"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showTicketModal && selectedTicket && (
        <div className="modal-overlay">
          <div className="modal large">
            <div className="modal-header">
              <h2>Ticket Details</h2>
              <button className="close-btn" onClick={() => setShowTicketModal(false)}>×</button>
            </div>
            <div className="modal-content-tickets">
              <div className="ticket-detail">
                <div className="ticket-header">
                  <div className="ticket-meta">
  <div className="ticket-id">Ticket #{selectedTicket._id.slice(-8)}</div>
  {getStatusBadge(selectedTicket.status)}
  
  <button 
    onClick={() => selectedTicket.status === 'closed' ? handleOpenTicket(selectedTicket._id) : handleCloseTicket(selectedTicket._id)}
    style={{
      marginLeft: '10px',
      padding: '6px 12px',
      background: selectedTicket.status === 'closed' ? '#c6f6d5' : '#fed7d7',
      color: selectedTicket.status === 'closed' ? '#276749' : '#c53030',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.85rem'
    }}
  >
    {selectedTicket.status === 'closed' ? 'Reopen' : 'Close'}
  </button>
  
  <div className="ticket-reason-section">
    <h3 style={{color : "gray"}}>Reason : <span style={{fontStyle:"italic" , color:"black"}}>{selectedTicket.reason}</span></h3>
  </div>
</div>

                  
                  <div className="ticket-user">
                    <div className="user-avatar-ticket">
                      {selectedTicket.user?.firstName?.charAt(0)}{selectedTicket.user?.lastName?.charAt(0)}
                    </div>
                    <div className="user-details-ticket">
                      <div className="user-name">
                        {selectedTicket.user?.firstName} {selectedTicket.user?.lastName}
                      </div>
                      <div className="user-email">{selectedTicket.user?.email}</div>
                    </div>

                    
                  </div>
                </div>

                <div className="ticket-content">

                  
                  {selectedTicket.description && (
                    <div className="ticket-description-section">
                      <h3 style={{color : "gray"}}>Description : <span style={{fontStyle:"italic" , color:"black"}}>{selectedTicket.description}</span></h3>
                    </div>
                  )}

                  <div className="ticket-messages">
                    <h3>Conversation</h3>
                    <div className="messages-list">
                      {selectedTicket.messages?.map((message, index) => (
                        <div 
                          key={index} 
                          className={`message ${message.sender._id === selectedTicket.user._id ? 'user-message' : 'admin-message'}`}
                        >
                          <div className="message-header">
                            <div className="message-sender" style={{color: "gray"}}>
                              {message.sender._id === selectedTicket.user._id 
                                ? `${selectedTicket.user.firstName.charAt(0).toUpperCase() + selectedTicket.user.firstName.slice(1).toLowerCase()}`
                                
                                : 'Support Team'
                              }
                            </div>
                            
                          </div>
                          <div className="message-content-user">
                            {message.message}
                          </div>
                          <div className="message-time">
                              {formatDate(message.timestamp)}
                            </div>
                        </div>
                      ))}
                      
                      {(!selectedTicket.messages || selectedTicket.messages.length === 0) && (
                        <div className="no-messages">
                          No messages yet. Be the first to respond!
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedTicket.status !== 'closed' && (
                    <form className="reply-form" onSubmit={handleSendReply}>
                      <div className="form-group">
                        <label htmlFor="replyMessage">Your Response</label>
                        <textarea
                          id="replyMessage"
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Type your response here..."
                          rows="4"
                          disabled={sendingReply}
                        />
                      </div>
                      <div className="form-actions-tickets">
                        <button 
                          type="button" 
                          className="cancel-btn"
                          onClick={() => setShowTicketModal(false)}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="send-btn"
                          disabled={!replyMessage.trim() || sendingReply}
                        >
                          {sendingReply ? (
                            <>
                              <div className="button-spinner"></div>
                              Sending...
                            </>
                          ) : (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                              </svg>
                              Send Response
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsManagement;