import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Home from './components/Home/Home'
import Navbar from './components/Navbar/Navbar'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register'
import MapDialog from './components/Map/MapDialog';
import TourDialog from './components/TourDialog/TourDialog';
import Profile from './components/Profile/Profile';
import AdminDashboard from './components/Admin/AdminDashboard'
import TicketManagement from './components/TicketManagement/TicketManagement'
import CreateTour from './components/CreateTour/CreateTour'
function App() {

    const [selectedTour, setSelectedTour] = useState(null);

    const handleTourSelect = (tour) => {
        setSelectedTour(tour);
    };

    const handleCloseDialog = () => {
        setSelectedTour(null);
    };
    
  return (
    <div>
    <Router>
      <Routes>
        <Route path="/" element={<> <Navbar onTourSelect={handleTourSelect} /><Home onTourSelect={handleTourSelect} /></>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/map" element={<MapDialog />} />
        <Route path="/profile/:userId" element={<> <Navbar onTourSelect={handleTourSelect} /><Profile /></>} />
        <Route path='/admin' element={<AdminDashboard />} />
        <Route path="/support" element={<> <Navbar onTourSelect={handleTourSelect} /><TicketManagement /></>} />
        <Route path="/create-tour" element={<> <Navbar onTourSelect={handleTourSelect} /><CreateTour /></>} />
      </Routes>
      {selectedTour && (<TourDialog tour={selectedTour} onClose={handleCloseDialog}/>)}
    </Router>
    
  </div>
  );
  
}

export default App
