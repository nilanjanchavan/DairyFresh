import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthService } from '../services/AuthService.js'
import Popup from '../components/Popup.jsx'

function LoginPage(props) {
    var navigate = useNavigate();
    var isDarkMode = props.isDarkMode
    var showToast = props.showToast

    var modeState = useState('login')
    var mode = modeState[0]
    var setMode = modeState[1]

    var emailState = useState('')
    var email = emailState[0]
    var setEmail = emailState[1]

    var passwordState = useState('')
    var password = passwordState[0]
    var setPassword = passwordState[1]

    var nameState = useState('')
    var name = nameState[0]
    var setName = nameState[1]

    var phoneState = useState('')
    var phone = phoneState[0]
    var setPhone = phoneState[1]

    var successPopupState = useState(false)
    var showSuccessPopup = successPopupState[0]
    var setShowSuccessPopup = successPopupState[1]

    var forgotPasswordState = useState(false)
    var showForgotPassword = forgotPasswordState[0]
    var setShowForgotPassword = forgotPasswordState[1]

    var loginLogoSrc = isDarkMode ? '/images/login-logo_dark.png' : '/images/login-logo.png'

    async function handleSubmit(event) {
        event.preventDefault()

        if (email.trim() === '' || password.trim() === '') {
            if (showToast) {
                showToast('Please fill in all fields', 'error')
            }
            return
        }

        if (mode === 'signup' && name.trim() === '') {
            if (showToast) {
                showToast('Please enter your name', 'error')
            }
            return
        }

        if (mode === 'login') {
            try {
                const response = await AuthService.login(email, password);
                if (response.role === 'admin') {
                    if (showToast) showToast('Admin login successful!', 'success');
                    navigate('/admin');
                } else {
                    setShowSuccessPopup(true);
                }
            } catch (err) {
                if (showToast) showToast('Invalid credentials (try admin@dairyfresh.com / admin123)', 'error');
            }
        } else {
            setShowSuccessPopup(true)
        }
    }

    function handleSuccessClose() {
        setShowSuccessPopup(false)
        setEmail('')
        setPassword('')
        setName('')
        setPhone('')
    }

    function handleModeToggle() {
        if (mode === 'login') {
            setMode('signup')
        } else {
            setMode('login')
        }
        setEmail('')
        setPassword('')
        setName('')
        setPhone('')
    }

    function handleForgotPassword() {
        setShowForgotPassword(true)
    }

    function handleForgotPasswordClose() {
        setShowForgotPassword(false)
    }

    function handleForgotPasswordSubmit(event) {
        event.preventDefault()
        if (showToast) {
            showToast('Password reset link sent to your email!', 'success')
        }
        setShowForgotPassword(false)
    }

    function handleEmailChange(event) {
        setEmail(event.target.value)
    }

    function handlePasswordChange(event) {
        setPassword(event.target.value)
    }

    function handleNameChange(event) {
        setName(event.target.value)
    }

    function handlePhoneChange(event) {
        setPhone(event.target.value)
    }

    var title = mode === 'login' ? 'Welcome Back!' : 'Create Account'
    var buttonText = mode === 'login' ? 'Login' : 'Sign Up'
    var toggleText = mode === 'login' ? "Don't have an account? " : 'Already have an account? '
    var toggleLinkText = mode === 'login' ? 'Sign up' : 'Login'
    var successMessage = mode === 'login' ? 'Login successful!' : 'Account created successfully!'

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-logo">
                    <img
                        src={loginLogoSrc}
                        alt="Login"
                        className="product-img"
                        style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                    />
                </div>

                <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>{title}</h2>

                <form onSubmit={handleSubmit}>
                    {mode === 'signup' && (
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={handleNameChange}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={handleEmailChange}
                        />
                    </div>

                    {mode === 'signup' && (
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                placeholder="+91 XXXXX XXXXX"
                                value={phone}
                                onChange={handlePhoneChange}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={handlePasswordChange}
                        />
                    </div>

                    {mode === 'login' && (
                        <p style={{ textAlign: 'right', marginBottom: '15px' }}>
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#2ecc71',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Forgot password?
                            </button>
                        </p>
                    )}

                    <button type="submit" className="btn" style={{ width: '100%', marginTop: '10px' }}>
                        {buttonText}
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '20px', color: '#2ecc71' }}>
                        {toggleText}
                        <button
                            type="button"
                            onClick={handleModeToggle}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#228b22',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            {toggleLinkText}
                        </button>
                    </p>
                </form>

                {mode === 'signup' && (
                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <p style={{ fontSize: '12px', color: '#999' }}>
                            By signing up, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </div>
                )}
            </div>

            <Popup isOpen={showSuccessPopup} onClose={handleSuccessClose} title="🎉 Success!">
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: '60px', marginBottom: '15px' }}>✓</div>
                    <h3 style={{ color: '#27ae60', marginBottom: '10px' }}>{successMessage}</h3>
                    <p style={{ color: '#2ecc71', marginBottom: '20px' }}>
                        {mode === 'login'
                            ? 'Welcome back to DairyFresh!'
                            : 'Welcome to the DairyFresh family!'}
                    </p>
                    <button className="btn" onClick={handleSuccessClose}>
                        Continue Shopping
                    </button>
                </div>
            </Popup>

            <Popup isOpen={showForgotPassword} onClose={handleForgotPasswordClose} title="🔐 Reset Password">
                <form onSubmit={handleForgotPasswordSubmit}>
                    <p style={{ color: '#2ecc71', marginBottom: '20px' }}>
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            required
                        />
                    </div>
                    <button type="submit" className="btn" style={{ width: '100%' }}>
                        Send Reset Link
                    </button>
                </form>
            </Popup>
        </div>
    )
}

export default LoginPage
