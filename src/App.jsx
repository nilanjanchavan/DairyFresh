import React from 'react'
import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Routes } from 'react-router-dom'
import { Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import VideoBackground from './components/VideoBackground.jsx'
import ChatbotButton from './components/ChatbotButton.jsx'
import Popup from './components/Popup.jsx'
import Toast from './components/Toast.jsx'
import CartPopup from './components/CartPopup.jsx'
import NewsletterPopup from './components/NewsletterPopup.jsx'
import HomePage from './pages/HomePage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ProductsPage from './pages/ProductsPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import AdminPanel from './pages/AdminPanel.jsx'

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

    var toastState = useState({ isVisible: false, message: '', type: 'success' })
    var toast = toastState[0]
    var setToast = toastState[1]

    var newsletterState = useState(false)
    var isNewsletterOpen = newsletterState[0]
    var setIsNewsletterOpen = newsletterState[1]

    var newsletterShownState = useState(false)
    var hasNewsletterBeenShown = newsletterShownState[0]
    var setHasNewsletterBeenShown = newsletterShownState[1]

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

        if (existingIndex >= 0) {
            var updatedCart = cartItems.slice()
            updatedCart[existingIndex].quantity = updatedCart[existingIndex].quantity + quantity
            setCartItems(updatedCart)
        } else {
            var newItem = {
                title: product.title,
                description: product.description,
                price: product.price,
                imageSrc: product.imageSrc,
                imageDarkSrc: product.imageDarkSrc,
                quantity: quantity
            }
            setCartItems(cartItems.concat([newItem]))
        }

        showToast('Added to cart: ' + product.title, 'success')
    }

    function handleRemoveFromCart(index) {
        var updatedCart = cartItems.slice()
        var removedItem = updatedCart[index]
        updatedCart.splice(index, 1)
        setCartItems(updatedCart)
        showToast('Removed: ' + removedItem.title, 'info')
    }

    function handleUpdateCartQuantity(index, newQuantity) {
        var updatedCart = cartItems.slice()
        updatedCart[index].quantity = newQuantity
        setCartItems(updatedCart)
    }

    function handleCheckout() {
        setIsCartOpen(false)
        showToast('Order placed successfully! 🎉', 'success')
        setCartItems([])
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

    function handleNewsletterSubscribe(email) {
        showToast('Welcome to DairyFresh family!', 'success')
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
                    />
                } />
                <Route path="/admin" element={
                    <AdminPanel
                        isDarkMode={isDarkMode}
                        showToast={showToast}
                    />
                } />
            </Routes>
        </BrowserRouter>
    )
}

export default App
