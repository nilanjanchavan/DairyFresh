import React from 'react'
import { useState } from 'react'
import Popup from './Popup.jsx'
import { AuthService } from '../services/AuthService.js'

function Footer(props) {
    var showToast = props.showToast

    var newsletterState = useState('')
    var newsletterEmail = newsletterState[0]
    var setNewsletterEmail = newsletterState[1]

    var successPopupState = useState(false)
    var showSuccessPopup = successPopupState[0]
    var setShowSuccessPopup = successPopupState[1]

    function handleSubmit(event) {
        event.preventDefault()
        if (showToast) {
            showToast('Message sent! We will get back to you soon.', 'success')
        }
        event.target.reset()
    }

    function handleNewsletterChange(event) {
        setNewsletterEmail(event.target.value)
    }

    async function handleNewsletterSubmit(event) {
        event.preventDefault()
        if (newsletterEmail.trim() !== '') {
            try {
                await AuthService.subscribeNewsletter(newsletterEmail)
                setShowSuccessPopup(true)
                setNewsletterEmail('')
            } catch (error) {
                if (showToast) showToast(error.message, 'error')
            }
        }
    }

    function handleSuccessClose() {
        setShowSuccessPopup(false)
    }

    var socialLinks = [
        { icon: '📱', name: 'WhatsApp', url: 'https://wa.me/14155238886?text=Hi' },
        { icon: '📘', name: 'Facebook', url: '#' },
        { icon: '📸', name: 'Instagram', url: '#' },
        { icon: '🐦', name: 'Twitter', url: '#' },
        { icon: '📺', name: 'YouTube', url: '#' }
    ]

    var quickLinks = [
        { name: 'FAQs', url: '#' },
        { name: 'Shipping Policy', url: '#' },
        { name: 'Return Policy', url: '#' },
        { name: 'Privacy Policy', url: '#' },
        { name: 'Terms of Service', url: '#' }
    ]

    return (
        <footer id="footer" className="footer">
            <div className="footer-content">
                <h2>Contact Us</h2>
                <p style={{ marginBottom: '30px' }}>Have questions about our dairy products? We're here to help!</p>

                <div className="contact-grid">
                    <div className="contact-card">
                        <h3>📧 Email</h3>
                        <p>doodhwaala@dairyfresh.com</p>
                    </div>
                    <div className="contact-card">
                        <h3>📱 Phone</h3>
                        <p>1800-XXXX-XXXX</p>
                    </div>
                    <div className="contact-card">
                        <h3>📍 Location</h3>
                        <p>Football Ground, IIIT Lucknow</p>
                    </div>
                    <div className="contact-card">
                        <h3>⏰ Hours</h3>
                        <p>Mon-Sat: 6AM - 10PM</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginTop: '30px' }}>
                    <div className="contact-form">
                        <h3 style={{ color: '#228b22', marginBottom: '20px' }}>Send us a Message</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <input type="text" placeholder="Your name" required />
                            </div>
                            <div className="form-group">
                                <input type="email" placeholder="your@email.com" required />
                            </div>
                            <div className="form-group">
                                <input type="text" placeholder="Subject" />
                            </div>
                            <div className="form-group">
                                <textarea rows="4" placeholder="Your message..."></textarea>
                            </div>
                            <button type="submit" className="btn">Send Message</button>
                        </form>
                    </div>

                    <div>
                        <div style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            padding: '25px',
                            borderRadius: '15px',
                            marginBottom: '20px'
                        }}>
                            <h3 style={{ color: 'white', marginBottom: '15px' }}>📬 Newsletter</h3>
                            <p style={{ marginBottom: '15px', opacity: 0.9 }}>Subscribe for exclusive offers and updates!</p>
                            <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={newsletterEmail}
                                    onChange={handleNewsletterChange}
                                    style={{
                                        flex: 1,
                                        padding: '12px 15px',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontSize: '14px'
                                    }}
                                    required
                                />
                                <button
                                    type="submit"
                                    style={{
                                        padding: '12px 20px',
                                        backgroundColor: 'white',
                                        color: '#228b22',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Subscribe
                                </button>
                            </form>
                        </div>

                        <div style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            padding: '25px',
                            borderRadius: '15px',
                            marginBottom: '20px'
                        }}>
                            <h3 style={{ color: 'white', marginBottom: '15px' }}>Quick Links</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {quickLinks.map(function (link, index) {
                                    return (
                                        <a
                                            key={index}
                                            href={link.url}
                                            style={{
                                                color: 'white',
                                                textDecoration: 'none',
                                                padding: '8px 15px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                borderRadius: '20px',
                                                fontSize: '13px',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            {link.name}
                                        </a>
                                    )
                                })}
                            </div>
                        </div>

                        <div style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            padding: '25px',
                            borderRadius: '15px'
                        }}>
                            <h3 style={{ color: 'white', marginBottom: '15px' }}>Follow Us</h3>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                {socialLinks.map(function (social, index) {
                                    return (
                                        <a
                                            key={index}
                                            href={social.url}
                                            style={{
                                                width: '45px',
                                                height: '45px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '20px',
                                                textDecoration: 'none',
                                                transition: 'all 0.3s'
                                            }}
                                            title={social.name}
                                        >
                                            {social.icon}
                                        </a>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{
                    marginTop: '40px',
                    paddingTop: '20px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center'
                }}>
                    <p style={{ color: '#ffffff', marginBottom: '10px' }}>
                        © 2024 DairyFresh. All rights reserved.
                    </p>
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px' }}>
                        Made with ❤️ by the DairyFresh Team
                    </p>
                </div>
            </div>

            <Popup isOpen={showSuccessPopup} onClose={handleSuccessClose} title="🎉 Subscribed!">
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: '60px', marginBottom: '15px' }}>✉️</div>
                    <h3 style={{ color: '#27ae60', marginBottom: '10px' }}>You're on the list!</h3>
                    <p style={{ color: '#2ecc71' }}>
                        Thanks for subscribing to our newsletter. You'll receive exclusive offers soon!
                    </p>
                </div>
            </Popup>
        </footer>
    )
}

export default Footer
