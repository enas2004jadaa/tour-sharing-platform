import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ticketList.css';

const TicketList = ({ onViewTicket, onCreateNew }) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem("token");
            const user = JSON.parse(localStorage.getItem("user"));
            
            const response = await axios.get(
                `http://localhost:5000/tickets/user/${user._id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setTickets(response.data.tickets);
        } catch (err) {
            setError("Failed to load tickets");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return '#48bb78';
            case 'in_progress': return '#ed8936';
            case 'closed': return '#a0aec0';
            default: return '#a0aec0';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'open': return 'Open';
            case 'in_progress': return 'In Progress';
            case 'closed': return 'Closed';
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="ticket-list-container">
                <div className="loading-spinner">Loading tickets...</div>
            </div>
        );
    }

    return (
        <div className="ticket-list-container">
            <div className="ticket-list-header">
                <div className="header-content">
                    <h1>My Support</h1>
                    <p>Manage and track your support requests</p>
                </div>
                <button className="create-ticket-btn" onClick={onCreateNew}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                    New Ticket
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="tickets-grid">
                {tickets.length === 0 ? (
                    <div className="empty-state">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z"/>
                        </svg>
                        <h3>No tickets yet</h3>
                        <p>Create your first support ticket to get help</p>
                        <button className="create-first-btn" onClick={onCreateNew}>
                            Create Ticket
                        </button>
                    </div>
                ) : (
                    tickets.map(ticket => (
                        <div 
                            key={ticket._id} 
                            className="ticket-card"
                            onClick={() => onViewTicket(ticket)}
                        >
                            <div className="ticket-header">
                                <div className="ticket-title">{ticket.reason}</div>
                                <div 
                                    className="status-badge"
                                    style={{ backgroundColor: getStatusColor(ticket.status) }}
                                >
                                    {getStatusText(ticket.status)}
                                </div>
                            </div>
                            <div className="ticket-description">
                                {ticket.description.length > 120 
                                    ? `${ticket.description.substring(0, 120)}...`
                                    : ticket.description
                                }
                            </div>
                            <div className="ticket-footer">
                                <div className="ticket-meta">
                                    <span className="message-count">
                                        {ticket.messages?.length || 0} messages
                                    </span>
                                    <span className="ticket-date">
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                                </svg>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TicketList;