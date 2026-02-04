import React, { useState } from 'react'
import './register.css'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dataBirth: '',
        phoneNumber: '',
        county: '',
        bio: '',
        gender: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setIsLoading(false);
            return;
        }

        try {
            const { confirmPassword, ...submitData } = formData;
            
            const response = await axios.post('http://localhost:5000/users/register', submitData);
            
            setSuccess('Registration successful! Redirecting to login...');
            
            setTimeout(() => {
                navigate('/login');
            }, 2000);
            
        } catch (error) {
            console.error('There was an error registering!', error);
            setError(error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="register-container">
            <div className='welcome'>Join Our Tour Community</div>
            <div className="register-card">
                <div className="register-title">Create Your Account</div>
                <form className="register-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName" className="register-label">
                                First Name *
                            </label>
                            <input 
                                type="text" 
                                id="firstName"
                                name="firstName"
                                className="register-input" 
                                placeholder="Enter your first name" 
                                required 
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName" className="register-label">
                                Last Name *
                            </label>
                            <input 
                                type="text" 
                                id="lastName"
                                name="lastName"
                                className="register-input" 
                                placeholder="Enter your last name" 
                                required 
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="email" className="register-label">
                                Email Address *
                            </label>
                            <input 
                                type="email" 
                                id="email"
                                name="email"
                                className="register-input" 
                                placeholder="Enter your email" 
                                required 
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="dataBirth" className="register-label">
                                Date of Birth *
                            </label>
                            <input 
                                type="date" 
                                id="dataBirth"
                                name="dataBirth"
                                className="register-input" 
                                required 
                                value={formData.dataBirth}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="phoneNumber" className="register-label">
                                Phone Number
                            </label>
                            <input 
                                type="tel" 
                                id="phoneNumber"
                                name="phoneNumber"
                                className="register-input" 
                                placeholder="Enter your phone number" 
                                value={formData.phoneNumber}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="county" className="register-label">
                                Country
                            </label>
                            <input 
                                type="text" 
                                id="county"
                                name="county"
                                className="register-input" 
                                placeholder="Enter your country" 
                                value={formData.county}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="gender" className="register-label">
                            Gender *
                        </label>
                        <select 
                            id="gender"
                            name="gender"
                            className="register-input" 
                            required 
                            value={formData.gender}
                            onChange={handleChange}
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password" className="register-label">
                                Password *
                            </label>
                            <input 
                                type="password" 
                                id="password"
                                name="password"
                                className="register-input" 
                                placeholder="Enter your password" 
                                required 
                                value={formData.password}
                                onChange={handleChange}
                                minLength="6"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="register-label">
                                Confirm Password *
                            </label>
                            <input 
                                type="password" 
                                id="confirmPassword"
                                name="confirmPassword"
                                className="register-input" 
                                placeholder="Confirm your password" 
                                required 
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className='error-handle'>
                        {error && <span className='error-message'>{error}</span>}
                    </div>
                    <div className='success-handle'>
                        {success && <span className='success-message'>{success}</span>}
                    </div>

                    <button 
                        type="submit" 
                        className="register-button" 
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
            </div>
            <div className="login-prompt">
                Already have an account? 
                <Link to="/login" className="login-link">Login here</Link>
            </div>
        </div>
    )
}

export default Register