import React from 'react'
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthService } from '../services/AuthService.js'

function Header(props) {
    var isDarkMode = props.isDarkMode
    var onThemeToggle = props.onThemeToggle
    var cartItemCount = props.cartItemCount
    var onCartClick = props.onCartClick
    var user = props.user
    var onLogout = props.onLogout
    var unreadNotifications = props.unreadNotifications || 0
    var onClearNotifications = props.onClearNotifications


    var menuState = useState(false)
    var isMenuOpen = menuState[0]
    var setIsMenuOpen = menuState[1]

    var dropdownState = useState(false)
    var isDropdownOpen = dropdownState[0]
    var setIsDropdownOpen = dropdownState[1]

    var dropdownRef = useRef(null)
    var navigate = useNavigate()

    // Close dropdown when clicking outside
    useEffect(function() {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return function() {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    function handleMenuToggle() {
        if (isMenuOpen === true) {
            setIsMenuOpen(false)
        } else {
            setIsMenuOpen(true)
        }
    }

    function handleContactClick(event) {
        event.preventDefault()
        navigate('/')
        setTimeout(function () {
            var footer = document.getElementById('footer')
            if (footer) {
                footer.scrollIntoView({ behavior: 'smooth' })
            }
        }, 100)
    }

    function handleDropdownToggle() {
        setIsDropdownOpen(!isDropdownOpen)
    }

    function handleLogoutClick() {
        setIsDropdownOpen(false)
        if (onLogout) onLogout()
    }

    function handleAdminClick() {
        setIsDropdownOpen(false)
        navigate('/admin')
    }

    var logoSrc = isDarkMode ? '/images/logo_dark.png' : '/images/logo.png'
    var navClassName = isMenuOpen ? 'active' : ''

    // Get first letter of name for avatar
    var userInitial = user && user.name ? user.name.charAt(0).toUpperCase() : '?'

    return (
        <header>
            <div className="logo">
                <img
                    src={logoSrc}
                    alt="DairyFresh Logo"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '15px' }}
                />
            </div>

            <div className="header-right">
                <div className="theme-toggle-container">
                    <input
                        type="checkbox"
                        id="theme-toggle"
                        className="theme-toggle-checkbox"
                        checked={isDarkMode}
                        onChange={onThemeToggle}
                    />
                    <label htmlFor="theme-toggle" className="theme-toggle-label">
                        <span className="theme-toggle-slider">
                            <span className="theme-icon sun">☀️</span>
                            <span className="theme-icon moon">🌙</span>
                        </span>
                    </label>
                </div>

                {user && (
                    <div className="notification-icon-container" onClick={onClearNotifications} style={{ position: 'relative', cursor: 'pointer', marginRight: '15px' }}>
                        <span className="notification-icon" style={{ fontSize: '24px' }}>🔔</span>
                        {unreadNotifications > 0 && (
                            <span className="cart-count">{unreadNotifications}</span>
                        )}
                    </div>
                )}

                <div className="cart-icon-container" onClick={onCartClick}>
                    <span className="cart-icon">🛒</span>
                    {cartItemCount > 0 && (
                        <span className="cart-count">{cartItemCount}</span>
                    )}
                </div>

                <button className="menu-toggle" onClick={handleMenuToggle}>☰ Menu</button>
                <nav id="nav" className={navClassName}>
                    <Link to="/">Home</Link>
                    <Link to="/about">About Us</Link>
                    <Link to="/products">Our Products</Link>
                    <a href="#footer" onClick={handleContactClick}>Contact</a>

                    {user ? (
                        <div className="user-dropdown" ref={dropdownRef}>
                            <button className="user-dropdown-btn" onClick={handleDropdownToggle}>
                                <span className="user-avatar">{userInitial}</span>
                                <span className="user-name">{user.name}</span>
                                <span className="dropdown-arrow">{isDropdownOpen ? '▲' : '▼'}</span>
                            </button>
                            {isDropdownOpen && (
                                <div className="user-dropdown-menu">
                                    <div className="dropdown-user-info">
                                        <span className="dropdown-email">{user.email}</span>
                                    </div>
                                    <button className="dropdown-item" onClick={() => { setIsDropdownOpen(false); if(props.onOrdersClick) props.onOrdersClick(); }}>
                                        📦 My Orders
                                    </button>
                                    {user.role === 'admin' && (
                                        <button className="dropdown-item" onClick={handleAdminClick}>
                                            ⚙️ Admin Panel
                                        </button>
                                    )}
                                    <button className="dropdown-item dropdown-logout" onClick={handleLogoutClick}>
                                        🚪 Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login">Login</Link>
                    )}
                </nav>
            </div>
        </header>
    )
}

export default Header
