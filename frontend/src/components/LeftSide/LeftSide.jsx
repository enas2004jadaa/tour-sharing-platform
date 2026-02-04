import React from 'react'
import OverViewProfile from './OverviewProfile';
import QuickLinks from './QuickLinks';
import './leftSide.css';
import TicketManagement from '../TicketManagement/TicketManagement';
function LeftSide() {
  return (
    <div className='container-right'>
        <OverViewProfile />
        <QuickLinks />
    </div>
  )
}

export default LeftSide