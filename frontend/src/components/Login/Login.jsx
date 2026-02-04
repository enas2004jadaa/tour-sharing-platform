import React, { useState } from 'react'
import './login.css'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await axios.post('http://localhost:5000/users/login', {
                email: email,
                password: password
            });
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setSuccess('Login successful! Redirecting...');
            setTimeout(() => {
                navigate('/');
            }, 1000);
            
        } catch (error) {
            console.error('There was an error logging in!', error);
            setError(error.response?.data?.message || 'Login failed. Please check your credentials and try again.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="login-container">
            <div className='welcome'>Welcome to the Tours</div>
            <div className="login-card">
                <div className="login-title">Login to Your Account</div>
                <form className="login-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email" className="login-label">Email Address</label>
                        <input 
                            type="email" 
                            id="email" 
                            className="login-input" 
                            placeholder="Enter your email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password" className="login-label">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            className="login-input"  
                            placeholder="Enter your password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    
                    <div className='error-handle' style={error ? {display: 'block'} : {display: 'none'}} >
                        {error && <span className='error-message'>{error}</span>}
                    </div>
                    <div className='success-handle' style={success ? {display: 'block'} : {display: 'none'}} >
                        {success && <span className='success-message'>{success}</span>}
                    </div>
                    
                    <button 
                        type="submit" 
                        className="login-button" 
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
            <div className="register-prompt">
                Don't have an account? 
                <Link to="/register" className="register-link">Register here</Link>
            </div>
        </div>
    )
}

export default Login