import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import QuoteSection from '../components/QuoteSection.jsx'
import Sidebar from '../components/Sidebar.jsx'
import ProductCard from '../components/ProductCard.jsx'
import Footer from '../components/Footer.jsx'
import ProductQuickView from '../components/ProductQuickView.jsx'
import SubscriptionPopup from '../components/SubscriptionPopup.jsx'
import ShareButton from '../components/ShareButton.jsx'

function HomePage(props) {
    var isDarkMode = props.isDarkMode
    var onAddToCart = props.onAddToCart
    var showToast = props.showToast
    var onOpenNewsletter = props.onOpenNewsletter
    var navigate = useNavigate()

    var quickViewState = useState({ isOpen: false, product: null })
    var quickView = quickViewState[0]
    var setQuickView = quickViewState[1]

    var subscriptionState = useState({ isOpen: false, productName: '' })
    var subscription = subscriptionState[0]
    var setSubscription = subscriptionState[1]

    var faqState = useState(-1)
    var openFaqIndex = faqState[0]
    var setOpenFaqIndex = faqState[1]

    useEffect(function () {
        var timer = setTimeout(function () {
            onOpenNewsletter()
        }, 8000)
        return function () {
            clearTimeout(timer)
        }
    }, [])

    var products = [
        {
            title: 'Fresh Milk',
            description: 'Pure, farm-fresh milk delivered daily',
            price: '₹45/liter',
            imageSrc: '/images/milk.jpg',
            imageDarkSrc: '/images/milk_dark.jpg'
        },
        {
            title: 'Greek Yogurt',
            description: 'Creamy, protein-rich yogurt',
            price: '₹60/500g',
            imageSrc: '/images/yogurt.jpg',
            imageDarkSrc: '/images/yogurt_dark.jpg'
        },
        {
            title: 'Artisan Cheese',
            description: 'Handcrafted cheese varieties',
            price: '₹150/250g',
            imageSrc: '/images/cheese.jpg',
            imageDarkSrc: '/images/cheese_dark.jpg'
        },
        {
            title: 'Premium Butter',
            description: 'Rich, creamy butter from pure cream',
            price: '₹80/200g',
            imageSrc: '/images/butter.jpg',
            imageDarkSrc: '/images/butter_dark.jpg'
        },
        {
            title: 'Fresh Cream',
            description: 'Thick, farm-fresh cream',
            price: '₹70/250ml',
            imageSrc: '/images/cream.jpg',
            imageDarkSrc: '/images/cream_dark.jpg'
        },
        {
            title: 'Fresh Paneer',
            description: 'Soft, homemade-style paneer',
            price: '₹90/250g',
            imageSrc: '/images/paneer.jpg',
            imageDarkSrc: '/images/paneer_dark.jpg'
        }
    ]

    var collageImages = [
        { src: '/images/product-1.jpg', darkSrc: '/images/product-1_dark.jpg', alt: 'Product 1' },
        { src: '/images/product-2.jpg', darkSrc: '/images/product-2_dark.jpg', alt: 'Product 2' },
        { src: '/images/product-3.jpg', darkSrc: '/images/product-3_dark.jpg', alt: 'Product 3' },
        { src: '/images/product-4.jpg', darkSrc: '/images/product-4_dark.jpg', alt: 'Product 4' },
        { src: '/images/product-5.jpg', darkSrc: '/images/product-5_dark.jpg', alt: 'Product 5' }
    ]

    var allCollageImages = collageImages.concat(collageImages).concat(collageImages)

    var testimonials = [
        {
            text: 'DairyFresh milk is the best! My kids love it and I trust the quality. The daily delivery is so convenient!',
            name: 'Priya Sharma',
            location: 'Delhi',
            avatar: '👩',
            rating: 5
        },
        {
            text: 'Finally found organic dairy products that actually taste amazing. The paneer is just like homemade!',
            name: 'Rahul Verma',
            location: 'Mumbai',
            avatar: '👨',
            rating: 5
        },
        {
            text: 'Excellent service and fresh products every morning. The subscription model makes my life so much easier.',
            name: 'Anita Gupta',
            location: 'Bangalore',
            avatar: '👩',
            rating: 5
        }
    ]

    var whyChooseUs = [
        {
            icon: '🥛',
            title: 'Farm Fresh',
            description: 'Directly from our farms to your home within 24 hours'
        },
        {
            icon: '🚚',
            title: 'Free Delivery',
            description: 'No delivery charges on all subscription orders'
        },
        {
            icon: '🌿',
            title: '100% Organic',
            description: 'Certified organic with no preservatives or additives'
        },
        {
            icon: '💯',
            title: 'Quality Promise',
            description: 'Satisfaction guaranteed or full refund'
        }
    ]

    var deliverySteps = [
        {
            number: 1,
            icon: '📱',
            title: 'Choose Products',
            description: 'Browse and select your favorites'
        },
        {
            number: 2,
            icon: '📅',
            title: 'Set Schedule',
            description: 'Pick delivery frequency'
        },
        {
            number: 3,
            icon: '🚚',
            title: 'We Deliver',
            description: 'Fresh to your doorstep'
        },
        {
            number: 4,
            icon: '😊',
            title: 'Enjoy Fresh!',
            description: 'Healthy dairy every day'
        }
    ]

    var faqItems = [
        {
            question: 'How fresh are your products?',
            answer: 'All our products are delivered within 24 hours of production. We maintain a strict cold chain to ensure maximum freshness and quality.'
        },
        {
            question: 'Can I pause or cancel my subscription?',
            answer: 'Yes! You can pause, modify, or cancel your subscription anytime through your account dashboard. No questions asked!'
        },
        {
            question: 'What areas do you deliver to?',
            answer: 'We currently deliver to all major cities including Delhi, Mumbai, Bangalore, Chennai, Hyderabad, and more. Enter your pincode to check availability.'
        },
        {
            question: 'Are your products really organic?',
            answer: 'Yes, our organic range is certified by recognized bodies. Our cows are grass-fed and we use no artificial hormones or antibiotics.'
        }
    ]

    function handleProductClick(product) {
        setQuickView({ isOpen: true, product: product })
    }

    function handleQuickViewClose() {
        setQuickView({ isOpen: false, product: null })
    }

    function handleStartSubscription() {
        setSubscription({ isOpen: true, productName: '' })
    }

    function handleSubscriptionClose() {
        setSubscription({ isOpen: false, productName: '' })
    }

    function handleSubscriptionConfirm(data) {
        showToast('Subscription started for ' + (data.product || 'DairyFresh'), 'success')
    }

    function handleFaqClick(index) {
        if (openFaqIndex === index) {
            setOpenFaqIndex(-1)
        } else {
            setOpenFaqIndex(index)
        }
    }

    function handleExploreProducts() {
        navigate('/products')
    }

    function renderStars(count) {
        var stars = ''
        for (var i = 0; i < count; i = i + 1) {
            stars = stars + '⭐'
        }
        return stars
    }

    return (
        <div>
            <QuoteSection />

            <div className="container">
                <Sidebar showToast={showToast} />

                <main className="main-content">
                    <div className="special-offers-banner">
                        <div className="offer-content">
                            <h3>🎉 New Customer Special!</h3>
                            <p>Get 20% off on your first subscription order</p>
                        </div>
                        <div className="offer-badge">
                            Use Code: FRESH20
                        </div>
                    </div>

                    <div className="stats-section">
                        <div className="stat-card">
                            <div className="stat-number">10K+</div>
                            <div>Happy Customers</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">15+</div>
                            <div>Fresh Products</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">100%</div>
                            <div>Farm Fresh</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">7 Days</div>
                            <div>Weekly Delivery</div>
                        </div>
                    </div>

                    <div className="content-header">
                        <h1>Our Premium Dairy Products</h1>
                        <p style={{
                            fontSize: '24px',
                            marginBottom: '40px',
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                            maxWidth: '800px',
                            margin: '0 auto 40px auto'
                        }}>
                            Experience the purity of farm-fresh dairy products delivered straight to your doorstep.
                        </p>
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            <button className="btn" onClick={handleExploreProducts} style={{ fontSize: '18px', padding: '15px 40px' }}>
                                Explore Products
                            </button>
                            <ShareButton 
                                title="DairyFresh - Farm Fresh Dairy Products Delivered"
                                text="I just discovered DairyFresh! They deliver premium quality, farm-fresh milk and dairy products directly to your doorstep."
                            />
                        </div>
                        <button className="btn" onClick={handleStartSubscription}>🛒 Start Your Subscription</button>
                    </div>

                    <div className="cards-grid">
                        {products.map(function (product, index) {
                            return (
                                <ProductCard
                                    key={index}
                                    title={product.title}
                                    description={product.description}
                                    price={product.price}
                                    imageSrc={product.imageSrc}
                                    imageDarkSrc={product.imageDarkSrc}
                                    isDarkMode={isDarkMode}
                                    onProductClick={function () { handleProductClick(product) }}
                                />
                            )
                        })}
                    </div>

                    <div className="why-choose-section">
                        <h2>Why Choose DairyFresh?</h2>
                        <div className="why-choose-grid">
                            {whyChooseUs.map(function (item, index) {
                                return (
                                    <div key={index} className="why-choose-card">
                                        <div className="why-choose-icon">{item.icon}</div>
                                        <h3>{item.title}</h3>
                                        <p>{item.description}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="collage-container">
                        <h3 style={{ marginBottom: '15px' }}>Customer Favorites</h3>
                        <div className="collage-scroll">
                            {allCollageImages.map(function (image, index) {
                                var currentSrc = isDarkMode ? image.darkSrc : image.src
                                return (
                                    <div key={index} className="collage-item">
                                        <img
                                            src={currentSrc}
                                            alt={image.alt}
                                            className="product-img"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '15px' }}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="delivery-steps-section">
                        <h2>How It Works</h2>
                        <div className="delivery-steps">
                            {deliverySteps.map(function (step, index) {
                                return (
                                    <div key={index} className="delivery-step">
                                        <div className="step-number">{step.number}</div>
                                        <div className="step-icon">{step.icon}</div>
                                        <h4>{step.title}</h4>
                                        <p>{step.description}</p>
                                        {index < deliverySteps.length - 1 && (
                                            <span className="step-arrow">→</span>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="testimonials-section">
                        <h2>What Our Customers Say</h2>
                        <div className="testimonials-grid">
                            {testimonials.map(function (testimonial, index) {
                                return (
                                    <div key={index} className="testimonial-card">
                                        <span className="testimonial-quote">"</span>
                                        <p className="testimonial-text">{testimonial.text}</p>
                                        <div className="testimonial-author">
                                            <div className="testimonial-avatar">{testimonial.avatar}</div>
                                            <div className="testimonial-info">
                                                <h4>{testimonial.name}</h4>
                                                <span>{testimonial.location}</span>
                                                <div className="testimonial-rating">
                                                    {renderStars(testimonial.rating)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="faq-section">
                        <h2>Frequently Asked Questions</h2>
                        {faqItems.map(function (faq, index) {
                            var questionClass = openFaqIndex === index ? 'faq-question active' : 'faq-question'
                            var answerClass = openFaqIndex === index ? 'faq-answer active' : 'faq-answer'
                            return (
                                <div key={index} className="faq-item">
                                    <button className={questionClass} onClick={function () { handleFaqClick(index) }}>
                                        <span>{faq.question}</span>
                                        <span className="faq-icon">▼</span>
                                    </button>
                                    <div className={answerClass}>
                                        <p>{faq.answer}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </main>
            </div>

            <Footer showToast={showToast} />

            <ProductQuickView
                isOpen={quickView.isOpen}
                onClose={handleQuickViewClose}
                product={quickView.product}
                isDarkMode={isDarkMode}
                onAddToCart={onAddToCart}
            />

            <SubscriptionPopup
                isOpen={subscription.isOpen}
                onClose={handleSubscriptionClose}
                productName={subscription.productName}
                onSubscribe={handleSubscriptionConfirm}
            />
        </div>
    )
}

export default HomePage
