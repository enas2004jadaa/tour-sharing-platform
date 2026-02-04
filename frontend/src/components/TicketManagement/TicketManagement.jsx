import React, { use, useEffect, useState } from 'react';
import CreateTicketDialog from '../Dialogs/CreateTicketDialog/CreateTicketDialog';
import TicketList from '../TicketList/TicketList';
import TicketDetail from '../TicketDetail/TicketDetail';
import './TicketManagement.css';
import { useNavigate } from 'react-router-dom';
const TicketManagement = () => {
    const navigate = useNavigate();
    const [currentView, setCurrentView] = useState('list'); // 'list', 'detail', 'create'
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        //check role in token == 'Visitor' then redirect to login
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(atob(token.split('.')[1]));
        if (user.role === 'admin' || user.role === 'moderator') {
            navigate('/admin');
            return;
        }
    }, []);
    const handleViewTicket = (ticket) => {
        setSelectedTicket(ticket);
        setCurrentView('detail');
    };

    const handleBackToList = () => {
        setCurrentView('list');
        setSelectedTicket(null);
        setRefreshTrigger(prev => prev + 1);
    };

    const handleCreateNew = () => {
        setShowCreateDialog(true);
    };

    const handleTicketCreated = () => {
        setShowCreateDialog(false);
        setRefreshTrigger(prev => prev + 1);
    };

    const handleTicketUpdate = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="ticket-management">
            {currentView === 'list' && (
                <TicketList 
                    onViewTicket={handleViewTicket}
                    onCreateNew={handleCreateNew}
                    key={refreshTrigger}
                />
            )}

            {currentView === 'detail' && (
                <TicketDetail 
                    ticket={selectedTicket}
                    onBack={handleBackToList}
                    onTicketUpdate={handleTicketUpdate}
                />
            )}

            <CreateTicketDialog 
                isOpen={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                onTicketCreated={handleTicketCreated}
            />
        </div>
    );
};

export default TicketManagement;