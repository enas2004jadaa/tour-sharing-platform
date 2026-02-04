import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ticketDetail.css';

const TicketDetail = ({ ticket, onBack, onTicketUpdate }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [userId, setUserId] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserId(payload.userId);

        if (ticket) {
            setMessages(ticket.messages || []);
            scrollToBottom();
        }
    }, [ticket]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `http://localhost:5000/tickets/${ticket._id}/message`,
                { message: newMessage.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessages(response.data.messages);
            setNewMessage('');
            scrollToBottom();
            
            if (onTicketUpdate) {
                onTicketUpdate();
            }
        } catch (err) {
            console.error("Failed to send message:", err);
            alert("Failed to send message. Please try again.");
        } finally {
            setSending(false);
        }
    };

    const handleCloseTicket = async () => {
        if (!window.confirm("Are you sure you want to close this ticket?")) return;

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `http://localhost:5000/tickets/${ticket._id}/close`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (onTicketUpdate) {
                onTicketUpdate();
            }
            alert("Ticket closed successfully");
        } catch (err) {
            console.error("Failed to close ticket:", err);
            alert("Failed to close ticket. Please try again.");
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

    if (!ticket) return null;

    return (
        <div className="ticket-detail-container">
            <div className="ticket-detail-header">
                <button className="back-button" onClick={onBack}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                    </svg>
                    Back to Tickets
                </button>
            </div>

            <div className="ticket-info">
                <div className="ticket-main-info">
                    <h2>{ticket.reason}</h2>
                    <div 
                        className="status-badge-large"
                        style={{ backgroundColor: getStatusColor(ticket.status) }}
                    >
                        {ticket.status.replace('_', ' ').toUpperCase()}
                    </div>
                </div>
                <p className="ticket-full-description">{ticket.description}</p>
                <div className="ticket-meta-info">
                    <span>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
                    <span>Last updated: {new Date(ticket.updatedAt).toLocaleString()}</span>
                </div>
            </div>

            <div className="messages-section">
                <h3>Conversation ({messages.length} messages)</h3>
                
                <div className="messages-container">
                    {messages.map((message, index) => (
                        <div 
                            key={index}
                            className={`message ${message.sender === userId ? 'user-message' : 'admin-message'}`}
                        >
                            <div className="message-content">
                                <div className="message-text">{message.message}</div>
                                <div className="message-time">
                                    {new Date(message.timestamp).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {ticket.status !== 'closed' && (
                    <form className="message-input-form" onSubmit={handleSendMessage}>
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message here..."
                            rows="3"
                            disabled={sending}
                        />
                        <button 
                            type="submit" 
                            disabled={sending || !newMessage.trim()}
                            className="send-message-btn"
                        >
                            {sending ? (
                                <>
                                    <div className="button-spinner"></div>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                    </svg>
                                    Send Message
                                </>
                            )}
                        </button>
                    </form>
                )}

                {ticket.status === 'closed' && (
                    <div className="ticket-closed-notice">
                        This ticket has been closed. No further messages can be sent.
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketDetail;