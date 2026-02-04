import React, { useEffect, useState } from 'react';
import PostList from '../PostList/PostList';
import axios from 'axios';
import LeftSide from '../LeftSide/LeftSide';
import RightSide from '../RightSide/RightSide';
import './home.css';
import { useNavigate } from 'react-router-dom';
const Home = ({ onTourSelect }) => {
  const navigate = useNavigate()
  const [tours, setTours] = useState([]);
  const [popularTours, setPopularTours] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [selectedCategory , setSelectedCategory] = useState(null);

  const checkAuthExpiry = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp;
      const now = Math.floor(Date.now() / 1000);
      if (now >= expiry) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }

      const fetchTours = async () => {
      try {
        const response = await axios.get('http://localhost:5000/tours');
        setTours(response.data);        
      } catch (error) {
        console.error('Error fetching tours:', error);
      }
    };

    const fetchPopularTours = async () => {
      try {
        const response = await axios.get('http://localhost:5000/tours/popular');
        setPopularTours(response.data);
      } catch (error) {
        console.error('Error fetching popular tours:', error);
      }
    };

    const getTopCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/categories/top');
        setTopCategories(response.data.data);
      } catch (error) {
        console.error('Error fetching top categories:', error);
      }
    };

  useEffect(() => {
    fetchTours();
    fetchPopularTours();
    getTopCategories();
    checkAuthExpiry();
    if (!localStorage.getItem('token')) {
        const user =  { 
        firstName: 'Guest', 
        lastName: 'User', 
        role: 'Visitor', 
        avatar: null, 
        tour: [],
        id: null 
    }
    localStorage.setItem('user', JSON.stringify(user)); 
    
    return;
  }
    //decode token to get user info
    const token = localStorage.getItem('token');
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId;
    
    axios.get(`http://localhost:5000/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
      }).then(response => {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }).catch(error => {
      // If error occurs (e.g., invalid token), clear local storage
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      console.error('Error fetching user data:', error);
    }
    )
  }, []);

  return (
    <div className="home-container">
      <LeftSide />
      <PostList tours={tours} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}/>
      <RightSide 
      popularTours={popularTours} 
      topCategories={topCategories} 
      onTourSelect={onTourSelect} 
      selectedCategory={selectedCategory} 
      setSelectedCategory={setSelectedCategory}/>
    </div>
  );
};

export default Home;