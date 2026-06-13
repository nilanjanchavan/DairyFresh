import React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Routes } from 'react-router-dom'
import { Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import VideoBackground from './components/VideoBackground.jsx'
import ChatbotButton from './components/ChatbotButton.jsx'
import Popup from './components/Popup.jsx'
import Toast from './components/Toast.jsx'
import CartPopup from './components/CartPopup.jsx'
import OrderHistoryPopup from './components/OrderHistoryPopup.jsx'
import NewsletterPopup from './components/NewsletterPopup.jsx'
import HomePage from './pages/HomePage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ProductsPage from './pages/ProductsPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import { AuthService } from './services/AuthService.js'
import { NotificationService } from './services/NotificationService.js'

function App() {
    var savedTheme = localStorage.getItem('theme')
    var initialDarkMode = savedTheme === 'dark'

    var darkModeState = useState(initialDarkMode)
    var isDarkMode = darkModeState[0]
    var setIsDarkMode = darkModeState[1]

    var chatbotPopupState = useState(false)
    var isChatbotPopupOpen = chatbotPopupState[0]
    var setIsChatbotPopupOpen = chatbotPopupState[1]

    var cartState = useState([])
    var cartItems = cartState[0]
    var setCartItems = cartState[1]

    var cartPopupState = useState(false)
    var isCartOpen = cartPopupState[0]
    var setIsCartOpen = cartPopupState[1]

    var ordersPopupState = useState(false)
    var isOrdersOpen = ordersPopupState[0]
    var setIsOrdersOpen = ordersPopupState[1]

    var orderConfirmationState = useState(false)
    var isOrderConfirmationOpen = orderConfirmationState[0]
    var setIsOrderConfirmationOpen = orderConfirmationState[1]

    var toastState = useState({ isVisible: false, message: '', type: 'success' })
    var toast = toastState[0]
    var setToast = toastState[1]

    var newsletterState = useState(false)
    var isNewsletterOpen = newsletterState[0]
    var setIsNewsletterOpen = newsletterState[1]

    var newsletterShownState = useState(false)
    var hasNewsletterBeenShown = newsletterShownState[0]
    var setHasNewsletterBeenShown = newsletterShownState[1]

    // User auth state
    var userState = useState(null)
    var user = userState[0]
    var setUser = userState[1]

    // Notification unread count
    var notificationCountState = useState(0)
    var unreadNotifications = notificationCountState[0]
    var setUnreadNotifications = notificationCountState[1]

    // Check session on app load
    useEffect(function() {
        AuthService.getSession().then(async function(sessionUser) {
            if (sessionUser && sessionUser.email) {
                setUser(sessionUser)
                // Load user's cart from DB
                AuthService.getCart().then(function(items) {
                    if (items && items.length > 0) {
                        setCartItems(items)
                    }
                })

                // Register for push notifications
                const warningMsg = await NotificationService.requestPermissionAndGetToken(sessionUser.email);
                if (warningMsg && typeof warningMsg === 'string') {
                    showToast(warningMsg, 'error');
                }
            }
        })
    }, [])

    useEffect(function() {
        if (user) {
            const unsubscribe = NotificationService.setupForegroundListener((payload) => {
                showToast(payload.notification?.title + ": " + payload.notification?.body, 'info');
                setUnreadNotifications(prev => prev + 1);
            });
            return () => {
                if (unsubscribe) unsubscribe();
            };
        }
    }, [user])


    // Save cart to DB whenever it changes (only if logged in)
    var cartSyncTimeout = useState(null)
    var cartSyncRef = cartSyncTimeout[0]
    var setCartSyncRef = cartSyncTimeout[1]

    function syncCartToServer(items) {
        // Debounce cart saves
        if (cartSyncRef) {
            clearTimeout(cartSyncRef)
        }
        var timeoutId = setTimeout(function() {
            AuthService.saveCart(items)
        }, 500)
        setCartSyncRef(timeoutId)
    }

    function handleThemeToggle() {
        if (isDarkMode === true) {
            setIsDarkMode(false)
            localStorage.setItem('theme', 'light')
            document.documentElement.classList.remove('dark-mode')
        } else {
            setIsDarkMode(true)
            localStorage.setItem('theme', 'dark')
            document.documentElement.classList.add('dark-mode')
        }
    }

    function handleChatbotClick() {
        setIsChatbotPopupOpen(true)
    }

    function handleChatbotPopupClose() {
        setIsChatbotPopupOpen(false)
    }

    function handleAddToCart(product, quantity) {
        var existingIndex = -1
        for (var i = 0; i < cartItems.length; i = i + 1) {
            if (cartItems[i].title === product.title) {
                existingIndex = i
                break
            }
        }

        var updatedCart
        if (existingIndex >= 0) {
            updatedCart = cartItems.slice()
            updatedCart[existingIndex].quantity = updatedCart[existingIndex].quantity + quantity
        } else {
            var newItem = {
                title: product.title,
                description: product.description,
                price: product.price,
                imageSrc: product.imageSrc,
                imageDarkSrc: product.imageDarkSrc,
                quantity: quantity
            }
            updatedCart = cartItems.concat([newItem])
        }

        setCartItems(updatedCart)
        if (user) syncCartToServer(updatedCart)
        showToast('Added to cart: ' + product.title, 'success')
    }

    function handleRemoveFromCart(index) {
        var updatedCart = cartItems.slice()
        var removedItem = updatedCart[index]
        updatedCart.splice(index, 1)
        setCartItems(updatedCart)
        if (user) syncCartToServer(updatedCart)
        showToast('Removed: ' + removedItem.title, 'info')
    }

    function handleUpdateCartQuantity(index, newQuantity) {
        var updatedCart = cartItems.slice()
        updatedCart[index].quantity = newQuantity
        setCartItems(updatedCart)
        if (user) syncCartToServer(updatedCart)
    }

    async function handleCheckout() {
        if (!user) {
            showToast('Please login to place an order', 'error')
            return
        }
        
        if (cartItems.length === 0) {
            showToast('Your cart is empty', 'error')
            return
        }
        
        try {
            await AuthService.checkout(cartItems)
            setIsCartOpen(false)
            setIsOrderConfirmationOpen(true)
            var emptyCart = []
            setCartItems(emptyCart)
            syncCartToServer(emptyCart)
        } catch (error) {
            showToast(error.message, 'error')
        }
    }

    function handleOrderConfirmationClose() {
        setIsOrderConfirmationOpen(false)
    }

    function showToast(message, type) {
        setToast({ isVisible: true, message: message, type: type })
    }

    function hideToast() {
        setToast({ isVisible: false, message: '', type: 'success' })
    }

    function handleCartClick() {
        setIsCartOpen(true)
    }

    function handleCloseCart() {
        setIsCartOpen(false)
    }

    function handleNewsletterClose() {
        setIsNewsletterOpen(false)
    }

    async function handleNewsletterSubscribe(email) {
        try {
            await AuthService.subscribeNewsletter(email)
            showToast('Welcome to DairyFresh family!', 'success')
        } catch (error) {
            showToast(error.message, 'error')
        }
    }

    function handleOpenNewsletter() {
        if (hasNewsletterBeenShown === false) {
            setIsNewsletterOpen(true)
            setHasNewsletterBeenShown(true)
        }
    }

    function getTotalCartItems() {
        var total = 0
        for (var i = 0; i < cartItems.length; i = i + 1) {
            total = total + cartItems[i].quantity
        }
        return total
    }

    async function handleLogin(userData) {
        setUser(userData)
        // Load user's cart from DB
        AuthService.getCart().then(function(items) {
            if (items && items.length > 0) {
                setCartItems(items)
            }
        })

        const warningMsg = await NotificationService.requestPermissionAndGetToken(userData.email);
        if (warningMsg && typeof warningMsg === 'string') {
            showToast(warningMsg, 'error');
        }
    }

    function handleLogout() {
        if (user) {
            NotificationService.unregisterDevice(user.email);
        }
        AuthService.logout().then(function() {
            setUser(null)
            setCartItems([])
            showToast('Logged out successfully', 'info')
        })
    }

    return (
        <BrowserRouter>
            <VideoBackground isDarkMode={isDarkMode} />
            <ChatbotButton onChatbotClick={handleChatbotClick} />
            <Popup isOpen={isChatbotPopupOpen} onClose={handleChatbotPopupClose} title="💬 Chat Support">
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                    <div style={{ fontSize: '60px', marginBottom: '20px' }}>🤖</div>
                    <h3 style={{ color: '#228b22', marginBottom: '15px' }}>Coming Soon!</h3>
                    <p style={{ color: '#2ecc71', marginBottom: '20px' }}>
                        Our AI-powered chat support is under development.
                        For now, please contact us via email or phone.
                    </p>
                    <div style={{
                        backgroundColor: 'rgba(46, 204, 113, 0.1)',
                        padding: '15px',
                        borderRadius: '12px',
                        marginBottom: '15px'
                    }}>
                        <p style={{ margin: '5px 0', color: '#228b22' }}>📧 doodhwaala@dairyfresh.com</p>
                        <p style={{ margin: '5px 0', color: '#228b22' }}>📱 1800-XXXX-XXXX</p>
                    </div>
                    <button className="btn" onClick={handleChatbotPopupClose}>
                        Got it!
                    </button>
                </div>
            </Popup>
            <Header
                isDarkMode={isDarkMode}
                onThemeToggle={handleThemeToggle}
                cartItemCount={getTotalCartItems()}
                onCartClick={handleCartClick}
                onOrdersClick={() => setIsOrdersOpen(true)}
                user={user}
                onLogout={handleLogout}
                unreadNotifications={unreadNotifications}
                onClearNotifications={() => setUnreadNotifications(0)}
            />
            <Toast
                message={toast.message}
                isVisible={toast.isVisible}
                type={toast.type}
                onHide={hideToast}
            />
            <CartPopup
                isOpen={isCartOpen}
                onClose={handleCloseCart}
                cartItems={cartItems}
                onRemoveItem={handleRemoveFromCart}
                onUpdateQuantity={handleUpdateCartQuantity}
                onCheckout={handleCheckout}
            />
            <OrderHistoryPopup
                isOpen={isOrdersOpen}
                onClose={() => setIsOrdersOpen(false)}
            />
            <Popup isOpen={isOrderConfirmationOpen} onClose={handleOrderConfirmationClose} title="🎉 Order Placed!">
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: '60px', marginBottom: '15px' }}>✓</div>
                    <h3 style={{ color: '#27ae60', marginBottom: '10px' }}>Thank you for your order!</h3>
                    <p style={{ color: '#2ecc71', marginBottom: '20px' }}>
                        Your order has been placed successfully. 
                        We will send you an email confirmation shortly.
                    </p>
                    <button className="btn" onClick={handleOrderConfirmationClose}>
                        Continue Shopping
                    </button>
                </div>
            </Popup>
            <NewsletterPopup
                isOpen={isNewsletterOpen}
                onClose={handleNewsletterClose}
                onSubscribe={handleNewsletterSubscribe}
            />
            <Routes>
                <Route path="/" element={
                    <HomePage
                        isDarkMode={isDarkMode}
                        onAddToCart={handleAddToCart}
                        showToast={showToast}
                        onOpenNewsletter={handleOpenNewsletter}
                    />
                } />
                <Route path="/about" element={<AboutPage isDarkMode={isDarkMode} />} />
                <Route path="/products" element={
                    <ProductsPage
                        isDarkMode={isDarkMode}
                        onAddToCart={handleAddToCart}
                        showToast={showToast}
                    />
                } />
                <Route path="/login" element={
                    <LoginPage
                        isDarkMode={isDarkMode}
                        showToast={showToast}
                        onLogin={handleLogin}
                        user={user}
                    />
                } />
                <Route path="/admin" element={
                    <AdminPanel
                        isDarkMode={isDarkMode}
                        showToast={showToast}
                        user={user}
                    />
                } />
            </Routes>
        </BrowserRouter>
    )
}

export default App
