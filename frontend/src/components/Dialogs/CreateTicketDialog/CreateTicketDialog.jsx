import React, { useState } from 'react';
import axios from 'axios';
import './CreateTicketDialog.css';

const CreateTicketDialog = ({ isOpen, onClose, onTicketCreated }) => {
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!reason) {
            setError("Please select a reason");
            return;
        }

        if (!details.trim()) {
            setError("Please describe your issue");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const payload = {
                reason,
                description: details.trim()
            };

            const response = await axios.post(
                "http://localhost:5000/tickets",
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 201) {
                setReason("");
                setDetails("");
                onTicketCreated(response.data.message);
                onClose();
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create ticket.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setReason('');
        setDetails('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="ticket-dialog-overlay">
            <div className="ticket-dialog-new">
                <div className="ticket-dialog-header-new">
                    <div className="header-content-new">
                        <div className="header-icon-new">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z"/>
                            </svg>
                        </div>
                        <div className="header-text-new">
                            <h2 className="title-new">Create Support Ticket</h2>
                            <p className="subtitle-new">We're here to help! Please describe your issue in detail.</p>
                        </div>
                    </div>
                    <button className="close-button-new" onClick={handleClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>

                <div className="ticket-dialog-content-new">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group-new">
                            <label className="form-label-new">Issue Type</label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="reason-select-new"
                                disabled={loading}
                            >
                                <option value="">Select issue type...</option>
                                <option value="Question">Question</option>
                                <option value="Problem">Technical Problem</option>
                                <option value="Suggestion">Suggestion</option>
                                <option value="Bug Report">Bug Report</option>
                                <option value="Tour Inquiry">Tour Inquiry</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="form-group-new">
                            <label className="form-label-new">Description</label>
                            <textarea
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                placeholder="Please provide detailed information about your issue..."
                                className="reason-textarea-new"
                                rows="6"
                                disabled={loading}
                            />
                        </div>

                        {error && <div className="error-message-new">{error}</div>}
                    </form>
                </div>

                <div className="ticket-dialog-footer-new">
                    <button
                        type="button"
                        className="cancel-button-new"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="submit-button-new"
                        onClick={handleSubmit}
                        disabled={loading || !reason.trim() || !details.trim()}
                    >
                        {loading ? (
                            <>
                                <div className="button-spinner-new"></div>
                                Creating...
                            </>
                        ) : (
                            <>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                </svg>
                                Create Ticket
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateTicketDialog;