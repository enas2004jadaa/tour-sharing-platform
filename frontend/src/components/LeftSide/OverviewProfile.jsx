import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './overviewProfile.css';
import { useNavigate } from 'react-router-dom';

function OverViewProfile() {
  const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [userId, setUserId] = useState(null);



    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
          setUserId(null);
        } else {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUserId(payload.userId);

          axios.get(`http://localhost:5000/users/${payload.userId}`)
            .then((response) => {
              localStorage.setItem('user', JSON.stringify(response.data.user));
            })
            .catch((error) => {
              console.error('Error fetching user data:', error);
            });
        }

    }, []);

    const viewDialogCreateTour = () => {
        console.log('View dialog create tour clicked' ,user);
      if (!user?._id && !user?.id) {
          navigate("/login");
          return;
      }
        navigate(`/create-tour`);
    };


    return (
        <>
            <div className='card-create-tour'>
                <div className='user-info-section' onClick={()=> {
                  if (user?.role === 'Visitor') {
                  navigate("/login");
                  return;
                  }
                navigate(`/profile/${userId}`)
                }} >
                    <div className='user-avatar-left'>
                        {user?.image ? (
                            <img src={user?.image} alt={user?.firstName} className='avatar-image-left' />
                        ) : (
                            <div className='avatar-placeholder'>
                                {user?.firstName.split(' ').map(n => n[0]).join('')}
                            </div>
                        )}
                    </div>
                    <div className='user-details-left'>
                        <div className='user-name-left'>{user?.firstName} {user?.lastName}</div>
                        <div className='user-role'>{user?.gender}</div>
                    </div>
                   {/* <div className='user-stats'>
                        <div className='stat-item'>
                            <div className='stat-number'>{user?.tour ? user?.tour.length : 0}</div>
                            <div className='stat-label'>Tours</div>
                        </div>
                    </div>*/}
                </div>

                <div className='create-section' onClick={viewDialogCreateTour}>
                    <div className='body-create'>
                        <div className='title-create'>Tour Title</div>
                        <input 
                            type="text" 
                            className='title-input' 
                            placeholder='Enter Tour Title...' 
                            readOnly
                        />
                        <div className='create-tour-container'>
                            <button className='create-tour' type="button">+ Create Tour</button>
                            <div className='tour-count'>Share your travel experience with the community</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default OverViewProfile;